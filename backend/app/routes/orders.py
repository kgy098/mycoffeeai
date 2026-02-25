"""Order routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random

from app.database import get_db
from app.models import Order, OrderItem, Blend, DeliveryAddress, User, PointsLedger
from app.models.points_ledger import PointsLedger
from pydantic import BaseModel

router = APIRouter()


class OrderItemRequest(BaseModel):
    blend_id: int
    collection_id: Optional[int] = None
    collection_name: Optional[str] = None
    quantity: int = 1
    unit_price: Optional[float] = None
    options: Optional[dict] = None


class OrderCreateRequest(BaseModel):
    user_id: int
    order_type: str = "single"
    delivery_address_id: Optional[int] = None
    payment_method: Optional[str] = None
    total_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    points_used: int = 0
    delivery_fee: Optional[float] = None
    agree_personal_info: bool = False
    agree_terms: bool = False
    agree_marketing: bool = False
    items: List[OrderItemRequest]


class OrderItemResponse(BaseModel):
    id: int
    blend_id: Optional[int]
    blend_name: Optional[str]
    collection_id: Optional[int]
    collection_name: Optional[str]
    quantity: int
    unit_price: Optional[float]
    options: Optional[dict]


class OrderResponse(BaseModel):
    id: int
    order_number: str
    order_type: str
    status: str
    subscription_id: Optional[int] = None
    total_amount: Optional[float]
    discount_amount: Optional[float] = None
    points_used: int = 0
    delivery_fee: Optional[float]
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    items: List[OrderItemResponse]
    delivery_address: Optional[dict]


@router.get("/orders", response_model=List[OrderResponse])
async def list_orders(
    user_id: int = Query(...),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.user_id == user_id)
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    results = []
    for order in orders:
        items = []
        for item in order.items:
            blend_name = item.blend.name if item.blend else None
            items.append(
                OrderItemResponse(
                    id=item.id,
                    blend_id=item.blend_id,
                    blend_name=blend_name,
                    collection_id=item.collection_id,
                    collection_name=item.collection_name,
                    quantity=item.quantity,
                    unit_price=float(item.unit_price) if item.unit_price else None,
                    options=item.options,
                )
            )

        address = None
        if order.delivery_address:
            address = {
                "id": order.delivery_address.id,
                "recipient_name": order.delivery_address.recipient_name,
                "phone_number": order.delivery_address.phone_number,
                "postal_code": order.delivery_address.postal_code,
                "address_line1": order.delivery_address.address_line1,
                "address_line2": order.delivery_address.address_line2,
            }

        results.append(
            OrderResponse(
                id=order.id,
                order_number=order.order_number,
                order_type=order.order_type,
                status=order.status,
                subscription_id=order.subscription_id,
                total_amount=float(order.total_amount) if order.total_amount else None,
                discount_amount=float(order.discount_amount) if order.discount_amount else None,
                points_used=order.points_used or 0,
                delivery_fee=float(order.delivery_fee) if order.delivery_fee else None,
                tracking_number=order.tracking_number,
                carrier=order.carrier,
                cancel_reason=order.cancel_reason,
                cancelled_at=order.cancelled_at,
                created_at=order.created_at,
                items=items,
                delivery_address=address,
            )
        )
    return results


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

    items = []
    for item in order.items:
        blend_name = item.blend.name if item.blend else None
        items.append(
            OrderItemResponse(
                id=item.id,
                blend_id=item.blend_id,
                blend_name=blend_name,
                collection_id=item.collection_id,
                collection_name=item.collection_name,
                quantity=item.quantity,
                unit_price=float(item.unit_price) if item.unit_price else None,
                options=item.options,
            )
        )

    address = None
    if order.delivery_address:
        address = {
            "id": order.delivery_address.id,
            "recipient_name": order.delivery_address.recipient_name,
            "phone_number": order.delivery_address.phone_number,
            "postal_code": order.delivery_address.postal_code,
            "address_line1": order.delivery_address.address_line1,
            "address_line2": order.delivery_address.address_line2,
        }

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        order_type=order.order_type,
        status=order.status,
        subscription_id=order.subscription_id,
        total_amount=float(order.total_amount) if order.total_amount else None,
        discount_amount=float(order.discount_amount) if order.discount_amount else None,
        points_used=order.points_used or 0,
        delivery_fee=float(order.delivery_fee) if order.delivery_fee else None,
        tracking_number=order.tracking_number,
        carrier=order.carrier,
        cancel_reason=order.cancel_reason,
        cancelled_at=order.cancelled_at,
        created_at=order.created_at,
        items=items,
        delivery_address=address,
    )


@router.post("/orders/single", response_model=OrderResponse)
async def create_single_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db)
):
    try:
        if payload.points_used and payload.points_used > 0:
            user = db.query(User).filter(User.id == payload.user_id).with_for_update().first()
            if not user:
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
            if (user.point_balance or 0) < payload.points_used:
                raise HTTPException(status_code=400, detail="보유 포인트가 부족합니다.")
            user.point_balance = (user.point_balance or 0) - payload.points_used
            ledger = PointsLedger(
                user_id=payload.user_id,
                transaction_type="2",
                change_amount=-payload.points_used,
                reason="06",
            )
            db.add(ledger)

        now = datetime.utcnow()
        order_number = datetime.now().strftime("%Y%m%d%H%M%S") + "_" + str(random.randint(10000, 99999))
        order = Order(
            user_id=payload.user_id,
            order_number=order_number,
            order_type=payload.order_type,
            status="1",
            delivery_address_id=payload.delivery_address_id,
            payment_method=payload.payment_method,
            total_amount=payload.total_amount,
            discount_amount=payload.discount_amount,
            points_used=payload.points_used,
            delivery_fee=payload.delivery_fee,
            agree_personal_info=payload.agree_personal_info,
            agree_personal_info_at=now if payload.agree_personal_info else None,
            agree_terms=payload.agree_terms,
            agree_terms_at=now if payload.agree_terms else None,
            agree_marketing=payload.agree_marketing,
            agree_marketing_at=now if payload.agree_marketing else None,
        )
        db.add(order)
        db.flush()

        for item in payload.items:
            order_item = OrderItem(
                order_id=order.id,
                blend_id=item.blend_id,
                collection_id=item.collection_id,
                collection_name=item.collection_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                options=item.options,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    return await get_order_detail(order.id, db)


class OrderCancelRequest(BaseModel):
    reason: Optional[str] = None


class OrderReturnRequest(BaseModel):
    return_reason: str
    return_content: str
    return_photos: Optional[List[str]] = None


@router.put("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    body: OrderCancelRequest = OrderCancelRequest(),
    db: Session = Depends(get_db),
):
    """주문 취소 (주문접수/배송준비 상태만 가능)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    if order.status not in ("1", "2"):
        raise HTTPException(status_code=400, detail="취소할 수 없는 주문 상태입니다.")

    order.status = "5"
    order.cancel_reason = body.reason
    order.cancelled_at = datetime.utcnow()

    # 포인트 사용분 환불
    if order.points_used and order.points_used > 0:
        user = db.query(User).filter(User.id == order.user_id).with_for_update().first()
        if user:
            user.point_balance = (user.point_balance or 0) + order.points_used
            db.add(PointsLedger(
                user_id=order.user_id,
                transaction_type="3",
                change_amount=order.points_used,
                reason="08",
                related_id=order.id,
                note=f"주문취소 환불 (주문번호: {order.order_number})",
            ))

    db.commit()
    return {"message": "주문이 취소되었습니다.", "id": order.id}


@router.put("/orders/{order_id}/return")
async def return_order(
    order_id: int,
    body: OrderReturnRequest,
    db: Session = Depends(get_db),
):
    """반품 신청 (배송중/배송완료 상태만 가능)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    if order.status not in ("3", "4"):
        raise HTTPException(status_code=400, detail="반품할 수 없는 주문 상태입니다.")

    order.status = "6"
    order.return_reason = body.return_reason
    order.return_content = body.return_content
    order.return_photos = body.return_photos
    order.returned_at = datetime.utcnow()

    # 포인트 사용분 환불
    if order.points_used and order.points_used > 0:
        user = db.query(User).filter(User.id == order.user_id).with_for_update().first()
        if user:
            user.point_balance = (user.point_balance or 0) + order.points_used
            db.add(PointsLedger(
                user_id=order.user_id,
                transaction_type="3",
                change_amount=order.points_used,
                reason="08",
                related_id=order.id,
                note=f"반품 환불 (주문번호: {order.order_number})",
            ))

    db.commit()
    return {"message": "반품 신청이 완료되었습니다.", "id": order.id}
