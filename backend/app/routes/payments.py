"""토스페이먼츠 결제 확인 API"""
import base64
import logging
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.database import get_db
from app.models import Order, OrderItem
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.subscription_cycle import SubscriptionCycle, CycleStatus
from app.models.payment import Payment, PaymentStatus
from sqlalchemy.orm import Session

router = APIRouter()
logger = logging.getLogger(__name__)

TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm"


class PaymentConfirmRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int


class PaymentConfirmResponse(BaseModel):
    success: bool
    orderId: str
    type: str  # "order" | "subscription"
    order_id: Optional[int] = None   # 단건 주문 시 우리 DB order.id
    subscription_id: Optional[int] = None  # 구독 시 우리 DB subscription.id


@router.post("/payments/confirm", response_model=PaymentConfirmResponse)
async def confirm_payment(
    payload: PaymentConfirmRequest,
    db: Session = Depends(get_db),
):
    """토스 결제 승인 후 주문/구독 상태 반영"""
    settings = get_settings()
    if not settings.toss_secret_key:
        raise HTTPException(
            status_code=503,
            detail="결제 서비스가 설정되지 않았습니다. TOSS_SECRET_KEY를 설정해주세요.",
        )

    # 1) 토스페이먼츠 결제 승인 API 호출
    secret_b64 = base64.b64encode(
        f"{settings.toss_secret_key}:".encode()
    ).decode()
    headers = {
        "Authorization": f"Basic {secret_b64}",
        "Content-Type": "application/json",
    }
    body = {
        "paymentKey": payload.paymentKey,
        "orderId": payload.orderId,
        "amount": payload.amount,
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                TOSS_CONFIRM_URL,
                json=body,
                headers=headers,
                timeout=15.0,
            )
    except Exception as e:
        logger.exception("Toss confirm request failed: %s", e)
        raise HTTPException(status_code=502, detail="결제 서버 요청에 실패했습니다.")

    if resp.status_code != 200:
        err = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
        code = err.get("code") or str(resp.status_code)
        msg = err.get("message") or resp.text or "결제 승인 실패"
        raise HTTPException(status_code=400, detail=f"[{code}] {msg}")

    # 2) 주문/구독 상태 반영 + Payment 레코드 생성
    toss_data = resp.json()
    payment_key = toss_data.get("paymentKey", payload.paymentKey)
    payment_method_name = toss_data.get("method", "카드")

    order_id = payload.orderId
    if order_id.startswith("SUB-"):
        try:
            sub_id = int(order_id[4:].strip())
        except ValueError:
            raise HTTPException(status_code=400, detail="잘못된 구독 결제 정보입니다.")
        sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
        if not sub:
            raise HTTPException(status_code=404, detail="구독을 찾을 수 없습니다.")
        if sub.status != SubscriptionStatus.PENDING_PAYMENT:
            raise HTTPException(status_code=400, detail="이미 처리된 구독 결제입니다.")
        sub.status = SubscriptionStatus.ACTIVE
        payment = Payment(
            subscription_id=sub.id,
            amount=payload.amount,
            payment_method=payment_method_name,
            transaction_id=payment_key,
            status=PaymentStatus.COMPLETED,
        )
        db.add(payment)
        db.flush()

        # 첫 번째 회차의 subscription_cycle 업데이트
        first_cycle = (
            db.query(SubscriptionCycle)
            .filter(
                SubscriptionCycle.subscription_id == sub.id,
                SubscriptionCycle.cycle_number == 1,
            )
            .first()
        )
        if first_cycle:
            first_cycle.status = CycleStatus.PAID
            first_cycle.payment_id = payment.id
            from datetime import datetime
            first_cycle.billed_at = datetime.now()

        # 첫 번째 회차 주문 생성
        import uuid
        order_number = f"SUB-{sub.id}-C1-{uuid.uuid4().hex[:6].upper()}"
        new_order = Order(
            user_id=sub.user_id,
            order_number=order_number,
            order_type="subscription",
            status="1",
            subscription_id=sub.id,
            cycle_number=1,
            delivery_address_id=sub.delivery_address_id,
            payment_method=payment_method_name,
            total_amount=payload.amount,
        )
        db.add(new_order)
        db.flush()
        # 주문 항목 생성
        order_item = OrderItem(
            order_id=new_order.id,
            blend_id=sub.blend_id,
            quantity=sub.quantity or 1,
            unit_price=payload.amount,
        )
        db.add(order_item)

        db.commit()
        return PaymentConfirmResponse(
            success=True, orderId=order_id, type="subscription", subscription_id=sub.id
        )
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
        if order.status != "1":
            raise HTTPException(status_code=400, detail="이미 처리된 주문 결제입니다.")
        order.status = "2"
        payment = Payment(
            order_id=order.id,
            amount=payload.amount,
            payment_method=payment_method_name,
            transaction_id=payment_key,
            status=PaymentStatus.COMPLETED,
        )
        db.add(payment)
        db.commit()
        return PaymentConfirmResponse(
            success=True, orderId=order_id, type="order", order_id=order.id
        )
