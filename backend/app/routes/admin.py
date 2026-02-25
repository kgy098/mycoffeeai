"""Admin routes"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, timedelta

from pydantic import BaseModel
from app.database import get_db
from app.models import (
    User,
    Admin,
    Banner,
    Subscription,
    Payment,
    Shipment,
    Blend,
    CoffeeStory,
    CoffeeTip,
    Event,
    AccessLog,
    AnalysisResult,
    Order,
    OrderItem,
    PointsLedger,
    ScoreScale,
    Review,
    MonthlyCoffee,
    SubscriptionCycle,
    UserCollection,
    Inquiry,
)
from app.models.subscription_cycle import CycleStatus
from app.schemas.banner import BannerResponse, BannerCreate, BannerUpdate
from app.models.terms import Terms
from app.schemas.terms import TermsResponse, TermsCreate, TermsUpdate, TermsListItem
from app.utils.security import decode_access_token, get_password_hash


def get_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    admin_row = db.query(Admin).filter(Admin.user_id == user.id).first()
    if not admin_row:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def log_admin_access(
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if request.method == "OPTIONS":
        return
    ip_address = request.client.host if request.client else "unknown"
    action = f"{request.method} {request.url.path}"
    db.add(AccessLog(user_id=admin.id, action=action, ip_address=ip_address))
    db.commit()


router = APIRouter(dependencies=[Depends(log_admin_access)])


class AdminMeResponse(BaseModel):
    user_id: int
    email: str
    display_name: Optional[str]


@router.get("/me", response_model=AdminMeResponse)
async def get_admin_me(admin: User = Depends(get_admin_user)):
    """현재 로그인된 관리자 본인 정보 반환."""
    return AdminMeResponse(
        user_id=admin.id,
        email=admin.email,
        display_name=admin.display_name,
    )


class AdminUserResponse(BaseModel):
    id: int
    email: str
    display_name: Optional[str]
    phone_number: Optional[str]
    provider: Optional[str]
    is_admin: bool
    status: Optional[str] = "1"
    created_at: datetime
    last_login_at: Optional[datetime] = None
    subscription_count: int
    order_count: int = 0
    point_balance: int = 0


class AdminUserCreate(BaseModel):
    email: str
    phone_number: str
    display_name: Optional[str] = None
    provider: Optional[str] = "email"
    is_admin: bool = False
    status: str = "1"
    password: Optional[str] = None


class AdminUserUpdate(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    display_name: Optional[str] = None
    provider: Optional[str] = None
    is_admin: Optional[bool] = None
    status: Optional[str] = None
    password: Optional[str] = None


class AdminPaymentResponse(BaseModel):
    id: int
    subscription_id: Optional[int] = None
    order_id: Optional[int] = None
    order_number: Optional[str] = None
    cycle_number: Optional[int] = None
    user_id: int
    user_name: Optional[str] = None
    blend_name: Optional[str] = None
    amount: float
    status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime


class AdminOrderItem(BaseModel):
    id: int
    blend_name: Optional[str]
    collection_name: Optional[str]
    quantity: int
    unit_price: Optional[float]
    options: Optional[dict] = None


class AdminOrderResponse(BaseModel):
    id: int
    order_number: str
    order_type: str
    status: str
    user_id: int
    user_name: Optional[str]
    total_amount: Optional[float]
    cycle_number: Optional[int] = None
    subscription_id: Optional[int] = None
    created_at: datetime
    items: List[AdminOrderItem]
    delivery_address: Optional[dict]
    return_reason: Optional[str] = None
    return_content: Optional[str] = None
    return_photos: Optional[list] = None
    returned_at: Optional[datetime] = None


class AdminOrderItemUpdate(BaseModel):
    id: int
    quantity: Optional[int] = None
    options: Optional[dict] = None


class AdminOrderUpdate(BaseModel):
    status: Optional[str] = None
    items: Optional[List[AdminOrderItemUpdate]] = None
    delivery_address: Optional[dict] = None


class AdminShipmentResponse(BaseModel):
    id: int
    subscription_id: int
    user_id: int
    user_name: Optional[str]
    blend_name: Optional[str]
    tracking_number: Optional[str]
    carrier: Optional[str]
    status: str
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    scheduled_date: Optional[date]
    created_at: datetime


class AdminBlendResponse(BaseModel):
    id: int
    name: str
    summary: Optional[str]
    aroma: int
    acidity: int
    sweetness: int
    body: int
    nuttiness: int
    price: Optional[float]
    stock: int
    thumbnail_url: Optional[str]
    status: str  # 1=판매중, 2=일시중지, 3=품절
    created_at: datetime


class AdminBlendCreate(BaseModel):
    name: str
    summary: Optional[str] = None
    aroma: int
    acidity: int
    sweetness: int
    body: int
    nuttiness: int
    price: Optional[float] = None
    stock: int = 0
    thumbnail_url: Optional[str] = None
    status: str = "1"  # 1=판매중, 2=일시중지, 3=품절


class AdminBlendUpdate(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    aroma: Optional[int] = None
    acidity: Optional[int] = None
    sweetness: Optional[int] = None
    body: Optional[int] = None
    nuttiness: Optional[int] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None  # 1=판매중, 2=일시중지, 3=품절


class AdminPostResponse(BaseModel):
    id: int
    category: str
    title: str
    content: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: str
    created_at: datetime


class AdminPostCreate(BaseModel):
    category: str  # 커피스토리, 커피꿀팁, 이벤트, 이달의커피
    title: str
    content: str
    thumbnail_url: Optional[str] = None
    # 이벤트 전용
    status: str = "공개"
    detail_image_url: Optional[str] = None
    reward_points: int = 0
    # 이달의커피 전용
    blend_id: Optional[int] = None
    month: Optional[str] = None  # YYYY-MM-DD
    banner_url: Optional[str] = None


class AdminPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None
    detail_image_url: Optional[str] = None
    reward_points: Optional[int] = None
    blend_id: Optional[int] = None
    month: Optional[str] = None
    banner_url: Optional[str] = None


class AdminPostDetailResponse(BaseModel):
    id: int
    category: str
    title: str
    content: str
    thumbnail_url: Optional[str] = None
    status: str
    created_at: datetime
    # 이벤트 전용
    detail_image_url: Optional[str] = None
    reward_points: Optional[int] = None
    # 이달의커피 전용
    blend_id: Optional[int] = None
    month: Optional[str] = None
    banner_url: Optional[str] = None


class AdminRewardResponse(BaseModel):
    id: int
    event_title: str
    reward_points: int
    status: str
    created_at: datetime


class AdminAccessLogResponse(BaseModel):
    id: int
    admin_id: int  # kept for frontend compatibility (actually user_id)
    user_name: Optional[str] = None
    is_admin: bool = False
    action: str
    ip_address: str
    created_at: datetime


class AdminAccessLogPaginatedResponse(BaseModel):
    items: List[AdminAccessLogResponse]
    total: int


class AdminSubscriptionResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    blend_id: int
    blend_name: Optional[str]
    status: str
    start_date: Optional[date]
    next_billing_date: Optional[date]
    delivery_address: Optional[dict]
    options: Optional[dict]
    quantity: int
    total_cycles: int
    current_cycle: int
    total_amount: Optional[float]


class AdminSubscriptionManagementResponse(BaseModel):
    subscription_id: int
    user_id: int
    user_name: Optional[str]
    blend_name: Optional[str]
    status: str
    last_payment_at: Optional[datetime]
    next_shipment_at: Optional[date]


class AdminSubscriptionCycleResponse(BaseModel):
    id: int
    subscription_id: int
    cycle_number: int
    status: str
    scheduled_date: Optional[date]
    billed_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    amount: Optional[float]
    payment_id: Optional[int]
    shipment_id: Optional[int]
    note: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class AdminSubscriptionCycleListResponse(BaseModel):
    """구독 내역 리스트 (구독+회원 정보 포함)"""
    id: int
    subscription_id: int
    cycle_number: int
    status: str
    scheduled_date: Optional[date]
    billed_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    amount: Optional[float]
    note: Optional[str]
    user_name: Optional[str]
    blend_name: Optional[str]
    subscription_status: Optional[str]


class AdminSubscriptionPaginatedResponse(BaseModel):
    items: List[AdminSubscriptionResponse]
    total: int


class AdminSubscriptionCyclePaginatedResponse(BaseModel):
    items: List[AdminSubscriptionCycleListResponse]
    total: int


class AdminSubscriptionDetailResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    blend_id: int
    blend_name: Optional[str]
    status: str
    start_date: Optional[date]
    next_billing_date: Optional[date]
    delivery_address: Optional[dict]
    options: Optional[dict]
    quantity: int
    total_cycles: int
    current_cycle: int
    total_amount: Optional[float]
    payment_method: Optional[str]
    created_at: Optional[datetime]
    cycles: List[AdminSubscriptionCycleResponse] = []


class AdminCycleUpdateRequest(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None
    scheduled_date: Optional[date] = None


class AdminPointsTransactionResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    change_amount: int
    transaction_type: str  # 1=적립, 2=사용, 3=취소/환불
    reason: str  # 01=회원가입, 02=리뷰작성, 03=구매적립, 04=이벤트, 05=관리자조정, 06=상품구매, 07=구독결제, 08=환불, 09=만료
    related_id: Optional[int] = None
    note: Optional[str]
    created_at: datetime


class AdminDashboardStats(BaseModel):
    today_sales: float
    today_orders: int
    today_deliveries: int
    new_members: int
    active_users: int
    shipping_in_progress: int


class AdminDashboardMonthlyChart(BaseModel):
    month: str  # YYYY-MM
    sales_amount: float
    order_count: int


class AdminNewMember(BaseModel):
    id: int
    name: Optional[str]
    provider: Optional[str]
    created_at: datetime


class AdminPopularCoffee(BaseModel):
    blend_id: int
    name: str
    order_count: int


class AdminSalesSummary(BaseModel):
    today_sales: float
    subscription_ratio: float
    single_ratio: float


class AdminDailySales(BaseModel):
    date: date
    total_amount: float


class AdminMonthlySales(BaseModel):
    month: str  # YYYY-MM
    total_amount: float


class AdminYearlySales(BaseModel):
    year: str  # YYYY
    total_amount: float


class AdminProductSales(BaseModel):
    blend_id: int
    name: str
    order_count: int
    total_amount: float = 0


class AdminTasteDistribution(BaseModel):
    aroma: float
    acidity: float
    sweetness: float
    body: float
    nuttiness: float


class AdminScoreScaleResponse(BaseModel):
    id: int
    attribute_key: str
    attribute_label: Optional[str]
    score: int
    description: Optional[str]


class AdminScoreScaleCreate(BaseModel):
    attribute_key: str
    attribute_label: Optional[str] = None
    score: int
    description: Optional[str] = None


class AdminScoreScaleUpdate(BaseModel):
    attribute_label: Optional[str] = None
    score: Optional[int] = None
    description: Optional[str] = None


class AdminReviewResponse(BaseModel):
    id: int
    blend_name: Optional[str]
    user_display_name: Optional[str]
    rating: Optional[int]
    content: Optional[str] = None
    photo_url: Optional[str] = None
    status: str
    created_at: datetime


class AdminReviewDetailResponse(BaseModel):
    id: int
    user_id: int
    user_display_name: Optional[str]
    user_email: Optional[str]
    blend_id: int
    blend_name: Optional[str]
    blend_thumbnail_url: Optional[str]
    order_item_id: Optional[int]
    rating: Optional[int]
    content: Optional[str]
    photo_url: Optional[str]
    status: str
    points_awarded: bool
    moderated_by: Optional[int]
    moderator_name: Optional[str]
    moderated_at: Optional[datetime]
    created_at: datetime


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(
    q: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    has_subscription: Optional[bool] = Query(None),
    created_from: Optional[date] = Query(None),
    created_to: Optional[date] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    # 관리자 제외, 회원만 조회
    query = db.query(User).filter(User.is_admin == False)  # noqa: E712
    if q:
        query = query.filter(User.email.ilike(f"%{q}%") | User.display_name.ilike(f"%{q}%"))
    if provider:
        query = query.filter(User.provider == provider)
    if created_from:
        query = query.filter(User.created_at >= datetime.combine(created_from, datetime.min.time()))
    if created_to:
        query = query.filter(User.created_at < datetime.combine(created_to + timedelta(days=1), datetime.min.time()))
    if has_subscription is True:
        query = query.filter(User.subscriptions.any())
    elif has_subscription is False:
        query = query.filter(~User.subscriptions.any())

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    # 주문건수 한번에 조회
    user_ids = [u.id for u in users]
    order_counts = {}
    if user_ids:
        rows = (
            db.query(Order.user_id, func.count(Order.id))
            .filter(Order.user_id.in_(user_ids))
            .group_by(Order.user_id)
            .all()
        )
        order_counts = {uid: cnt for uid, cnt in rows}

    return [
        AdminUserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            phone_number=user.phone_number,
            provider=user.provider,
            is_admin=user.is_admin,
            status=getattr(user, "status", "1") or "1",
            created_at=user.created_at,
            last_login_at=user.last_login_at,
            subscription_count=len(user.subscriptions),
            order_count=order_counts.get(user.id, 0),
            point_balance=user.point_balance or 0,
        )
        for user in users
    ]


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    order_count = db.query(func.count(Order.id)).filter(Order.user_id == user.id).scalar() or 0
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        phone_number=user.phone_number,
        provider=user.provider,
        is_admin=user.is_admin,
        status=getattr(user, "status", "1") or "1",
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        subscription_count=len(user.subscriptions),
        order_count=order_count,
        point_balance=user.point_balance or 0,
    )


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: AdminUserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="이미 존재하는 이메일입니다.")

    user = User(
        email=payload.email,
        phone_number=payload.phone_number,
        display_name=payload.display_name,
        provider=payload.provider,
        is_admin=payload.is_admin,
        status=payload.status,
        password_hash=get_password_hash(payload.password) if payload.password else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        phone_number=user.phone_number,
        provider=user.provider,
        is_admin=user.is_admin,
        status="1",
        created_at=user.created_at,
        last_login_at=None,
        subscription_count=0,
        order_count=0,
        point_balance=0,
    )


@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(user_id: int, payload: AdminUserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    payload_dict = payload.dict(exclude_unset=True)
    password = payload_dict.pop("password", None)
    for key, value in payload_dict.items():
        setattr(user, key, value)
    if password:
        user.password_hash = get_password_hash(password)
    db.commit()
    db.refresh(user)
    order_count = db.query(func.count(Order.id)).filter(Order.user_id == user.id).scalar() or 0
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        phone_number=user.phone_number,
        provider=user.provider,
        is_admin=user.is_admin,
        status=getattr(user, "status", "1") or "1",
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        subscription_count=len(user.subscriptions),
        order_count=order_count,
        point_balance=user.point_balance or 0,
    )


@router.get("/payments", response_model=List[AdminPaymentResponse])
async def list_payments(
    status_filter: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Payment)
        .outerjoin(Subscription, Payment.subscription_id == Subscription.id)
        .outerjoin(Order, Payment.order_id == Order.id)
    )
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    if user_id:
        query = query.filter(
            (Subscription.user_id == user_id) | (Order.user_id == user_id)
        )
    if q:
        query = query.filter(
            Payment.transaction_id.ilike(f"%{q}%")
            | Order.order_number.ilike(f"%{q}%")
        )

    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for payment in payments:
        sub = payment.subscription
        order = payment.order
        # 유저 정보: 구독 또는 주문에서 가져옴
        if sub:
            p_user = sub.user
            p_user_id = sub.user_id
        elif order:
            p_user = db.query(User).filter(User.id == order.user_id).first()
            p_user_id = order.user_id
        else:
            p_user = None
            p_user_id = 0
        # 상품명
        blend = None
        if sub and sub.blend_id:
            blend = db.query(Blend).filter(Blend.id == sub.blend_id).first()
        elif order:
            from app.models import OrderItem
            first_item = db.query(OrderItem).filter(OrderItem.order_id == order.id).first()
            if first_item and first_item.blend_id:
                blend = db.query(Blend).filter(Blend.id == first_item.blend_id).first()
        # 구독 회차 번호 조회
        cycle_number = None
        if payment.subscription_id:
            cycle = db.query(SubscriptionCycle).filter(
                SubscriptionCycle.payment_id == payment.id
            ).first()
            if cycle:
                cycle_number = cycle.cycle_number
        results.append(
            AdminPaymentResponse(
                id=payment.id,
                subscription_id=payment.subscription_id,
                order_id=payment.order_id,
                order_number=order.order_number if order else None,
                cycle_number=cycle_number,
                user_id=p_user_id,
                user_name=p_user.display_name if p_user else None,
                blend_name=blend.name if blend else None,
                amount=float(payment.amount),
                status=payment.status.value if hasattr(payment.status, "value") else str(payment.status),
                payment_method=payment.payment_method,
                transaction_id=payment.transaction_id,
                created_at=payment.created_at,
            )
        )
    return results


@router.get("/payments/{payment_id}", response_model=AdminPaymentResponse)
async def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다.")
    sub = payment.subscription
    order = payment.order
    user = sub.user if sub else (db.query(User).filter(User.id == order.user_id).first() if order else None)
    p_user_id = sub.user_id if sub else (order.user_id if order else 0)
    blend = None
    if sub and sub.blend_id:
        blend = db.query(Blend).filter(Blend.id == sub.blend_id).first()
    elif order:
        first_item = db.query(OrderItem).filter(OrderItem.order_id == order.id).first()
        if first_item and first_item.blend_id:
            blend = db.query(Blend).filter(Blend.id == first_item.blend_id).first()
    cycle_number = None
    if payment.subscription_id:
        cycle = db.query(SubscriptionCycle).filter(
            SubscriptionCycle.payment_id == payment.id
        ).first()
        if cycle:
            cycle_number = cycle.cycle_number
    return AdminPaymentResponse(
        id=payment.id,
        subscription_id=payment.subscription_id,
        order_id=payment.order_id,
        order_number=order.order_number if order else None,
        cycle_number=cycle_number,
        user_id=p_user_id,
        user_name=user.display_name if user else None,
        blend_name=blend.name if blend else None,
        amount=float(payment.amount),
        status=payment.status.value if hasattr(payment.status, "value") else str(payment.status),
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        created_at=payment.created_at,
    )


@router.get("/shipments")
async def list_shipments(
    status_filter: Optional[str] = Query(None),
    user_name: Optional[str] = Query(None),
    blend_name: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    """구독 배송 현황 (subscription_cycles 기반)"""
    query = (
        db.query(SubscriptionCycle, Subscription, User.display_name, Blend.name)
        .join(Subscription, SubscriptionCycle.subscription_id == Subscription.id)
        .join(User, Subscription.user_id == User.id)
        .outerjoin(Blend, Subscription.blend_id == Blend.id)
    )
    if status_filter:
        query = query.filter(SubscriptionCycle.status == status_filter)
    if user_name:
        query = query.filter(User.display_name.ilike(f"%{user_name}%"))
    if blend_name:
        query = query.filter(Blend.name.ilike(f"%{blend_name}%"))

    cycles = (
        query.order_by(SubscriptionCycle.scheduled_date.desc().nullslast(), SubscriptionCycle.id.desc())
        .offset(skip).limit(limit).all()
    )
    results = []
    for cycle, sub, u_name, b_name in cycles:
        results.append({
            "id": cycle.id,
            "subscription_id": cycle.subscription_id,
            "cycle_number": cycle.cycle_number,
            "user_id": sub.user_id,
            "user_name": u_name,
            "blend_name": b_name,
            "status": cycle.status.value if hasattr(cycle.status, "value") else str(cycle.status),
            "scheduled_date": str(cycle.scheduled_date) if cycle.scheduled_date else None,
            "shipped_at": cycle.shipped_at.isoformat() if cycle.shipped_at else None,
            "delivered_at": cycle.delivered_at.isoformat() if cycle.delivered_at else None,
            "amount": float(cycle.amount) if cycle.amount else None,
            "note": cycle.note,
            "created_at": cycle.created_at.isoformat() if cycle.created_at else None,
        })
    return results


@router.get("/orders", response_model=List[AdminOrderResponse])
async def list_orders(
    q: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    order_type: Optional[str] = Query(None),
    user_name: Optional[str] = Query(None),
    blend_name: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if q:
        query = query.filter(Order.order_number.ilike(f"%{q}%"))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if order_type:
        query = query.filter(Order.order_type == order_type)
    if user_name:
        query = query.join(User, Order.user_id == User.id).filter(User.display_name.ilike(f"%{user_name}%"))
    if blend_name:
        query = query.filter(
            Order.items.any(OrderItem.blend_id.in_(
                db.query(Blend.id).filter(Blend.name.ilike(f"%{blend_name}%"))
            ))
        )

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    results: List[AdminOrderResponse] = []
    for order in orders:
        items = []
        for item in order.items:
            blend_name = item.blend.name if item.blend else None
            items.append(
                AdminOrderItem(
                    id=item.id,
                    blend_name=blend_name,
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
            AdminOrderResponse(
                id=order.id,
                order_number=order.order_number,
                order_type=order.order_type,
                status=order.status,
                user_id=order.user_id,
                user_name=order.user.display_name if order.user else None,
                total_amount=float(order.total_amount) if order.total_amount else None,
                cycle_number=order.cycle_number,
                subscription_id=order.subscription_id,
                created_at=order.created_at,
                items=items,
                delivery_address=address,
                return_reason=order.return_reason,
                return_content=order.return_content,
                return_photos=order.return_photos,
                returned_at=order.returned_at,
            )
        )
    return results


@router.get("/orders/{order_id}", response_model=AdminOrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

    items = []
    for item in order.items:
        blend_name = item.blend.name if item.blend else None
        items.append(
            AdminOrderItem(
                id=item.id,
                blend_name=blend_name,
                collection_name=item.collection_name,
                quantity=item.quantity,
                unit_price=float(item.unit_price) if item.unit_price else None,
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
    return AdminOrderResponse(
        id=order.id,
        order_number=order.order_number,
        order_type=order.order_type,
        status=order.status,
        user_id=order.user_id,
        user_name=order.user.display_name if order.user else None,
        total_amount=float(order.total_amount) if order.total_amount else None,
        cycle_number=order.cycle_number,
        subscription_id=order.subscription_id,
        created_at=order.created_at,
        items=items,
        delivery_address=address,
        return_reason=order.return_reason,
        return_content=order.return_content,
        return_photos=order.return_photos,
        returned_at=order.returned_at,
    )


@router.put("/orders/{order_id}", response_model=AdminOrderResponse)
async def update_order(order_id: int, payload: AdminOrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

    if payload.status is not None:
        order.status = payload.status

    if payload.items:
        for item_update in payload.items:
            order_item = db.query(OrderItem).filter(
                OrderItem.id == item_update.id, OrderItem.order_id == order_id
            ).first()
            if order_item:
                if item_update.quantity is not None:
                    order_item.quantity = item_update.quantity
                if item_update.options is not None:
                    order_item.options = item_update.options

    if payload.delivery_address is not None and order.delivery_address:
        addr = order.delivery_address
        for key in ("recipient_name", "phone_number", "postal_code", "address_line1", "address_line2"):
            if key in payload.delivery_address:
                setattr(addr, key, payload.delivery_address[key])

    db.commit()
    db.refresh(order)

    items = []
    for item in order.items:
        blend_name = item.blend.name if item.blend else None
        items.append(
            AdminOrderItem(
                id=item.id,
                blend_name=blend_name,
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
    return AdminOrderResponse(
        id=order.id,
        order_number=order.order_number,
        order_type=order.order_type,
        status=order.status,
        user_id=order.user_id,
        user_name=order.user.display_name if order.user else None,
        total_amount=float(order.total_amount) if order.total_amount else None,
        created_at=order.created_at,
        items=items,
        delivery_address=address,
        return_reason=order.return_reason,
        return_content=order.return_content,
        return_photos=order.return_photos,
        returned_at=order.returned_at,
    )


@router.get("/subscriptions", response_model=AdminSubscriptionPaginatedResponse)
async def list_all_subscriptions(
    status: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None, description="회원명 검색"),
    start_date: Optional[str] = Query(None, description="시작일 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="종료일 (YYYY-MM-DD)"),
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    query = db.query(Subscription).join(User, Subscription.user_id == User.id)
    if status:
        query = query.filter(Subscription.status == status)
    if user_id:
        query = query.filter(Subscription.user_id == user_id)
    if q:
        query = query.filter(User.display_name.ilike(f"%{q}%"))
    if start_date:
        query = query.filter(Subscription.next_billing_date >= date.fromisoformat(start_date))
    if end_date:
        query = query.filter(Subscription.next_billing_date <= date.fromisoformat(end_date))

    total = query.count()
    subscriptions = query.order_by(Subscription.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for sub in subscriptions:
        blend = db.query(Blend).filter(Blend.id == sub.blend_id).first()
        address = None
        if sub.delivery_address:
            address = {
                "id": sub.delivery_address.id,
                "recipient_name": sub.delivery_address.recipient_name,
                "phone_number": sub.delivery_address.phone_number,
                "postal_code": sub.delivery_address.postal_code,
                "address_line1": sub.delivery_address.address_line1,
                "address_line2": sub.delivery_address.address_line2,
            }
        results.append(
            AdminSubscriptionResponse(
                id=sub.id,
                user_id=sub.user_id,
                user_name=sub.user.display_name if sub.user else None,
                blend_id=sub.blend_id,
                blend_name=blend.name if blend else None,
                status=sub.status.value if hasattr(sub.status, "value") else str(sub.status),
                start_date=sub.start_date,
                next_billing_date=sub.next_billing_date,
                delivery_address=address,
                options=sub.options,
                quantity=sub.quantity,
                total_cycles=sub.total_cycles,
                current_cycle=sub.current_cycle,
                total_amount=float(sub.total_amount) if sub.total_amount else None,
            )
        )
    return AdminSubscriptionPaginatedResponse(items=results, total=total)


@router.get("/points/transactions", response_model=List[AdminPointsTransactionResponse])
async def list_point_transactions(
    q: Optional[str] = Query(None, description="회원명 검색"),
    txn_type: Optional[str] = Query(None, description="1=적립, 2=사용, 3=취소/환불"),
    reason_code: Optional[str] = Query(None, description="사유 코드"),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db),
):
    query = db.query(PointsLedger, User.display_name).join(User, PointsLedger.user_id == User.id)

    if q:
        query = query.filter(User.display_name.ilike(f"%{q}%"))
    if txn_type:
        query = query.filter(PointsLedger.transaction_type == txn_type)
    if reason_code:
        query = query.filter(PointsLedger.reason == reason_code)

    results = query.order_by(PointsLedger.created_at.desc()).offset(skip).limit(limit).all()

    return [
        AdminPointsTransactionResponse(
            id=item.id,
            user_id=item.user_id,
            user_name=display_name,
            change_amount=item.change_amount,
            transaction_type=item.transaction_type,
            reason=item.reason or "",
            related_id=item.related_id,
            note=item.note,
            created_at=item.created_at,
        )
        for item, display_name in results
    ]


@router.get("/points/transactions/{transaction_id}", response_model=AdminPointsTransactionResponse)
async def get_point_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(PointsLedger, User.display_name)
        .join(User, PointsLedger.user_id == User.id)
        .filter(PointsLedger.id == transaction_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="포인트 내역을 찾을 수 없습니다.")
    item, display_name = result
    return AdminPointsTransactionResponse(
        id=item.id,
        user_id=item.user_id,
        user_name=display_name,
        change_amount=item.change_amount,
        transaction_type=item.transaction_type,
        reason=item.reason or "",
        related_id=item.related_id,
        note=item.note,
        created_at=item.created_at,
    )


@router.get("/points/users/{user_id}/transactions", response_model=List[AdminPointsTransactionResponse])
async def list_user_point_transactions(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    results = (
        db.query(PointsLedger)
        .filter(PointsLedger.user_id == user_id)
        .order_by(PointsLedger.created_at.desc())
        .all()
    )

    return [
        AdminPointsTransactionResponse(
            id=item.id,
            user_id=item.user_id,
            user_name=user.display_name,
            change_amount=item.change_amount,
            transaction_type=item.transaction_type,
            reason=item.reason or "",
            related_id=item.related_id,
            note=item.note,
            created_at=item.created_at,
        )
        for item in results
    ]


@router.get("/subscriptions/management", response_model=List[AdminSubscriptionManagementResponse])
async def list_subscription_management(
    status: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    query = db.query(Subscription)
    if status:
        query = query.filter(Subscription.status == status)
    if user_id:
        query = query.filter(Subscription.user_id == user_id)

    subscriptions = query.order_by(Subscription.created_at.desc()).offset(skip).limit(limit).all()
    results: List[AdminSubscriptionManagementResponse] = []
    for sub in subscriptions:
        blend = db.query(Blend).filter(Blend.id == sub.blend_id).first()
        last_payment = (
            db.query(Payment)
            .filter(Payment.subscription_id == sub.id)
            .order_by(Payment.created_at.desc())
            .first()
        )
        next_shipment = (
            db.query(Shipment)
            .filter(Shipment.subscription_id == sub.id)
            .order_by(Shipment.scheduled_date.desc().nullslast(), Shipment.created_at.desc())
            .first()
        )
        results.append(
            AdminSubscriptionManagementResponse(
                subscription_id=sub.id,
                user_id=sub.user_id,
                user_name=sub.user.display_name if sub.user else None,
                blend_name=blend.name if blend else None,
                status=sub.status.value if hasattr(sub.status, "value") else str(sub.status),
                last_payment_at=last_payment.created_at if last_payment else None,
                next_shipment_at=next_shipment.scheduled_date if next_shipment else None,
            )
        )
    return results


@router.get("/subscriptions/history", response_model=AdminSubscriptionCyclePaginatedResponse)
async def list_subscription_cycles(
    status: Optional[str] = Query(None),
    subscription_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None, description="회원명 검색"),
    start_date: Optional[str] = Query(None, description="시작일 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="종료일 (YYYY-MM-DD)"),
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    """모든 구독의 회차별 내역 리스트"""
    query = (
        db.query(SubscriptionCycle, Subscription, User.display_name, Blend.name)
        .join(Subscription, SubscriptionCycle.subscription_id == Subscription.id)
        .join(User, Subscription.user_id == User.id)
        .outerjoin(Blend, Subscription.blend_id == Blend.id)
    )
    if status:
        query = query.filter(SubscriptionCycle.status == status)
    if subscription_id:
        query = query.filter(SubscriptionCycle.subscription_id == subscription_id)
    if user_id:
        query = query.filter(Subscription.user_id == user_id)
    if q:
        query = query.filter(User.display_name.ilike(f"%{q}%"))
    if start_date:
        query = query.filter(SubscriptionCycle.scheduled_date >= date.fromisoformat(start_date))
    if end_date:
        query = query.filter(SubscriptionCycle.scheduled_date <= date.fromisoformat(end_date))

    total = query.count()
    rows = (
        query.order_by(SubscriptionCycle.subscription_id.desc(), SubscriptionCycle.cycle_number.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    items = [
        AdminSubscriptionCycleListResponse(
            id=cycle.id,
            subscription_id=cycle.subscription_id,
            cycle_number=cycle.cycle_number,
            status=cycle.status.value if hasattr(cycle.status, "value") else str(cycle.status),
            scheduled_date=cycle.scheduled_date,
            billed_at=cycle.billed_at,
            shipped_at=cycle.shipped_at,
            delivered_at=cycle.delivered_at,
            amount=float(cycle.amount) if cycle.amount else None,
            note=cycle.note,
            user_name=user_name,
            blend_name=blend_name,
            subscription_status=sub.status.value if hasattr(sub.status, "value") else str(sub.status),
        )
        for cycle, sub, user_name, blend_name in rows
    ]
    return AdminSubscriptionCyclePaginatedResponse(items=items, total=total)


@router.get("/subscriptions/{subscription_id}", response_model=AdminSubscriptionDetailResponse)
async def get_subscription_detail(
    subscription_id: int,
    db: Session = Depends(get_db),
):
    """구독 상세 + 회차 리스트"""
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="구독을 찾을 수 없습니다.")

    blend = db.query(Blend).filter(Blend.id == sub.blend_id).first()
    address = None
    if sub.delivery_address:
        address = {
            "id": sub.delivery_address.id,
            "recipient_name": sub.delivery_address.recipient_name,
            "phone_number": sub.delivery_address.phone_number,
            "postal_code": sub.delivery_address.postal_code,
            "address_line1": sub.delivery_address.address_line1,
            "address_line2": sub.delivery_address.address_line2,
        }

    cycles = (
        db.query(SubscriptionCycle)
        .filter(SubscriptionCycle.subscription_id == subscription_id)
        .order_by(SubscriptionCycle.cycle_number.asc())
        .all()
    )

    return AdminSubscriptionDetailResponse(
        id=sub.id,
        user_id=sub.user_id,
        user_name=sub.user.display_name if sub.user else None,
        blend_id=sub.blend_id,
        blend_name=blend.name if blend else None,
        status=sub.status.value if hasattr(sub.status, "value") else str(sub.status),
        start_date=sub.start_date,
        next_billing_date=sub.next_billing_date,
        delivery_address=address,
        options=sub.options,
        quantity=sub.quantity,
        total_cycles=sub.total_cycles,
        current_cycle=sub.current_cycle,
        total_amount=float(sub.total_amount) if sub.total_amount else None,
        payment_method=sub.payment_method,
        created_at=sub.created_at,
        cycles=[
            AdminSubscriptionCycleResponse(
                id=c.id,
                subscription_id=c.subscription_id,
                cycle_number=c.cycle_number,
                status=c.status.value if hasattr(c.status, "value") else str(c.status),
                scheduled_date=c.scheduled_date,
                billed_at=c.billed_at,
                shipped_at=c.shipped_at,
                delivered_at=c.delivered_at,
                amount=float(c.amount) if c.amount else None,
                payment_id=c.payment_id,
                shipment_id=c.shipment_id,
                note=c.note,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in cycles
        ],
    )


@router.put("/subscriptions/cycles/{cycle_id}", response_model=AdminSubscriptionCycleResponse)
async def update_subscription_cycle(
    cycle_id: int,
    payload: AdminCycleUpdateRequest,
    db: Session = Depends(get_db),
):
    """구독 회차 상태/메모 수정"""
    cycle = db.query(SubscriptionCycle).filter(SubscriptionCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="회차를 찾을 수 없습니다.")

    if payload.status is not None:
        cycle.status = payload.status
    if payload.note is not None:
        cycle.note = payload.note
    if payload.scheduled_date is not None:
        cycle.scheduled_date = payload.scheduled_date

    db.commit()
    db.refresh(cycle)

    return AdminSubscriptionCycleResponse(
        id=cycle.id,
        subscription_id=cycle.subscription_id,
        cycle_number=cycle.cycle_number,
        status=cycle.status.value if hasattr(cycle.status, "value") else str(cycle.status),
        scheduled_date=cycle.scheduled_date,
        billed_at=cycle.billed_at,
        shipped_at=cycle.shipped_at,
        delivered_at=cycle.delivered_at,
        amount=float(cycle.amount) if cycle.amount else None,
        payment_id=cycle.payment_id,
        shipment_id=cycle.shipment_id,
        note=cycle.note,
        created_at=cycle.created_at,
        updated_at=cycle.updated_at,
    )


@router.get("/blends", response_model=List[AdminBlendResponse])
async def list_blends(
    q: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    query = db.query(Blend)
    if q:
        query = query.filter(Blend.name.ilike(f"%{q}%"))
    if status_filter:
        query = query.filter(Blend.status == status_filter)

    blends = query.order_by(Blend.created_at.desc()).offset(skip).limit(limit).all()
    return [
        AdminBlendResponse(
            id=blend.id,
            name=blend.name,
            summary=blend.summary,
            aroma=blend.aroma,
            acidity=blend.acidity,
            sweetness=blend.sweetness,
            body=blend.body,
            nuttiness=blend.nuttiness,
            price=float(blend.price) if blend.price is not None else None,
            stock=blend.stock,
            thumbnail_url=blend.thumbnail_url,
            status=blend.status,
            created_at=blend.created_at,
        )
        for blend in blends
    ]


@router.get("/blends/{blend_id}", response_model=AdminBlendResponse)
async def get_blend(blend_id: int, db: Session = Depends(get_db)):
    blend = db.query(Blend).filter(Blend.id == blend_id).first()
    if not blend:
        raise HTTPException(status_code=404, detail="커피 상품을 찾을 수 없습니다.")
    return AdminBlendResponse(
        id=blend.id,
        name=blend.name,
        summary=blend.summary,
        aroma=blend.aroma,
        acidity=blend.acidity,
        sweetness=blend.sweetness,
        body=blend.body,
        nuttiness=blend.nuttiness,
        price=float(blend.price) if blend.price is not None else None,
        stock=blend.stock,
        thumbnail_url=blend.thumbnail_url,
        status=blend.status,
        created_at=blend.created_at,
    )


@router.post("/blends", response_model=AdminBlendResponse, status_code=status.HTTP_201_CREATED)
async def create_blend(payload: AdminBlendCreate, db: Session = Depends(get_db)):
    blend = Blend(
        name=payload.name,
        summary=payload.summary,
        aroma=payload.aroma,
        acidity=payload.acidity,
        sweetness=payload.sweetness,
        body=payload.body,
        nuttiness=payload.nuttiness,
        price=payload.price,
        stock=payload.stock,
        thumbnail_url=payload.thumbnail_url,
        status=payload.status,
    )
    db.add(blend)
    db.commit()
    db.refresh(blend)
    return AdminBlendResponse(
        id=blend.id,
        name=blend.name,
        summary=blend.summary,
        aroma=blend.aroma,
        acidity=blend.acidity,
        sweetness=blend.sweetness,
        body=blend.body,
        nuttiness=blend.nuttiness,
        price=float(blend.price) if blend.price is not None else None,
        stock=blend.stock,
        thumbnail_url=blend.thumbnail_url,
        status=blend.status,
        created_at=blend.created_at,
    )


@router.put("/blends/{blend_id}", response_model=AdminBlendResponse)
async def update_blend(blend_id: int, payload: AdminBlendUpdate, db: Session = Depends(get_db)):
    blend = db.query(Blend).filter(Blend.id == blend_id).first()
    if not blend:
        raise HTTPException(status_code=404, detail="커피 상품을 찾을 수 없습니다.")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(blend, key, value)
    db.commit()
    db.refresh(blend)
    return AdminBlendResponse(
        id=blend.id,
        name=blend.name,
        summary=blend.summary,
        aroma=blend.aroma,
        acidity=blend.acidity,
        sweetness=blend.sweetness,
        body=blend.body,
        nuttiness=blend.nuttiness,
        price=float(blend.price) if blend.price is not None else None,
        stock=blend.stock,
        thumbnail_url=blend.thumbnail_url,
        status=blend.status,
        created_at=blend.created_at,
    )


@router.get("/posts", response_model=List[AdminPostResponse])
async def list_posts(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    results: List[AdminPostResponse] = []

    if not category or category == "커피스토리":
        for story in db.query(CoffeeStory).order_by(CoffeeStory.created_at.desc()).all():
            results.append(AdminPostResponse(
                id=story.id, category="커피스토리", title=story.title,
                content=story.content, thumbnail_url=story.thumbnail_url,
                status="공개", created_at=story.created_at,
            ))

    if not category or category == "커피꿀팁":
        for tip in db.query(CoffeeTip).order_by(CoffeeTip.created_at.desc()).all():
            results.append(AdminPostResponse(
                id=tip.id, category="커피꿀팁", title=tip.title,
                content=tip.content, thumbnail_url=tip.thumbnail_url,
                status="공개", created_at=tip.created_at,
            ))

    if not category or category == "이벤트":
        for event in db.query(Event).order_by(Event.created_at.desc()).all():
            results.append(AdminPostResponse(
                id=event.id, category="이벤트", title=event.title,
                content=event.content, thumbnail_url=event.thumbnail_url,
                status=event.status, created_at=event.created_at,
            ))

    if not category or category == "이달의커피":
        for mc in db.query(MonthlyCoffee).order_by(MonthlyCoffee.created_at.desc()).all():
            blend_name = mc.blend.name if mc.blend else ""
            results.append(AdminPostResponse(
                id=mc.id, category="이달의커피", title=blend_name,
                content=mc.desc, thumbnail_url=mc.banner_url,
                status="노출" if mc.is_visible else "미노출", created_at=mc.created_at,
            ))

    return sorted(results, key=lambda item: item.created_at, reverse=True)


@router.get("/posts/{category}/{post_id}", response_model=AdminPostDetailResponse)
async def get_post(category: str, post_id: int, db: Session = Depends(get_db)):
    if category == "커피스토리":
        row = db.query(CoffeeStory).filter(CoffeeStory.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif category == "커피꿀팁":
        row = db.query(CoffeeTip).filter(CoffeeTip.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif category == "이벤트":
        row = db.query(Event).filter(Event.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status=row.status, created_at=row.created_at,
            detail_image_url=row.detail_image_url, reward_points=row.reward_points,
        )
    elif category == "이달의커피":
        row = db.query(MonthlyCoffee).filter(MonthlyCoffee.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.comment or "",
            content=row.desc or "", thumbnail_url=row.banner_url,
            status="노출" if row.is_visible else "미노출", created_at=row.created_at,
            blend_id=row.blend_id, month=str(row.month) if row.month else None,
            banner_url=row.banner_url,
        )
    raise HTTPException(status_code=400, detail="잘못된 카테고리입니다.")


@router.post("/posts", response_model=AdminPostDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_post(payload: AdminPostCreate, db: Session = Depends(get_db)):
    if payload.category == "커피스토리":
        row = CoffeeStory(title=payload.title, content=payload.content, thumbnail_url=payload.thumbnail_url)
        db.add(row)
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=payload.category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif payload.category == "커피꿀팁":
        row = CoffeeTip(title=payload.title, content=payload.content, thumbnail_url=payload.thumbnail_url)
        db.add(row)
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=payload.category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif payload.category == "이벤트":
        row = Event(
            title=payload.title, content=payload.content, thumbnail_url=payload.thumbnail_url,
            detail_image_url=payload.detail_image_url, status=payload.status,
            reward_points=payload.reward_points,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=payload.category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status=row.status, created_at=row.created_at,
            detail_image_url=row.detail_image_url, reward_points=row.reward_points,
        )
    elif payload.category == "이달의커피":
        if not payload.blend_id or not payload.month:
            raise HTTPException(status_code=400, detail="이달의커피는 blend_id와 month가 필수입니다.")
        row = MonthlyCoffee(
            blend_id=payload.blend_id, month=date.fromisoformat(payload.month),
            comment=payload.title, desc=payload.content, banner_url=payload.thumbnail_url,
            is_visible=payload.status != "미노출",
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=payload.category, title=row.comment or "",
            content=row.desc or "", thumbnail_url=row.banner_url,
            status="노출" if row.is_visible else "미노출", created_at=row.created_at,
            blend_id=row.blend_id, month=str(row.month), banner_url=row.banner_url,
        )
    raise HTTPException(status_code=400, detail="잘못된 카테고리입니다.")


@router.put("/posts/{category}/{post_id}", response_model=AdminPostDetailResponse)
async def update_post(category: str, post_id: int, payload: AdminPostUpdate, db: Session = Depends(get_db)):
    if category == "커피스토리":
        row = db.query(CoffeeStory).filter(CoffeeStory.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        if payload.title is not None:
            row.title = payload.title
        if payload.content is not None:
            row.content = payload.content
        if payload.thumbnail_url is not None:
            row.thumbnail_url = payload.thumbnail_url
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif category == "커피꿀팁":
        row = db.query(CoffeeTip).filter(CoffeeTip.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        if payload.title is not None:
            row.title = payload.title
        if payload.content is not None:
            row.content = payload.content
        if payload.thumbnail_url is not None:
            row.thumbnail_url = payload.thumbnail_url
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status="공개", created_at=row.created_at,
        )
    elif category == "이벤트":
        row = db.query(Event).filter(Event.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        if payload.title is not None:
            row.title = payload.title
        if payload.content is not None:
            row.content = payload.content
        if payload.thumbnail_url is not None:
            row.thumbnail_url = payload.thumbnail_url
        if payload.detail_image_url is not None:
            row.detail_image_url = payload.detail_image_url
        if payload.status is not None:
            row.status = payload.status
        if payload.reward_points is not None:
            row.reward_points = payload.reward_points
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.title, content=row.content,
            thumbnail_url=row.thumbnail_url, status=row.status, created_at=row.created_at,
            detail_image_url=row.detail_image_url, reward_points=row.reward_points,
        )
    elif category == "이달의커피":
        row = db.query(MonthlyCoffee).filter(MonthlyCoffee.id == post_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        if payload.title is not None:
            row.comment = payload.title
        if payload.content is not None:
            row.desc = payload.content
        if payload.thumbnail_url is not None:
            row.banner_url = payload.thumbnail_url
        if payload.blend_id is not None:
            row.blend_id = payload.blend_id
        if payload.month is not None:
            row.month = date.fromisoformat(payload.month)
        if payload.status is not None:
            row.is_visible = payload.status != "미노출"
        db.commit()
        db.refresh(row)
        return AdminPostDetailResponse(
            id=row.id, category=category, title=row.comment or "",
            content=row.desc or "", thumbnail_url=row.banner_url,
            status="노출" if row.is_visible else "미노출", created_at=row.created_at,
            blend_id=row.blend_id, month=str(row.month), banner_url=row.banner_url,
        )
    raise HTTPException(status_code=400, detail="잘못된 카테고리입니다.")


@router.get("/rewards/events", response_model=List[AdminRewardResponse])
async def list_event_rewards(db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.created_at.desc()).all()
    return [
        AdminRewardResponse(
            id=event.id,
            event_title=event.title,
            reward_points=event.reward_points or 0,
            status=event.status,
            created_at=event.created_at,
        )
        for event in events
    ]


class RewardDistributeRequest(BaseModel):
    event_id: int
    user_ids: List[int]
    custom_points: Optional[int] = None


@router.post("/rewards/events/distribute")
async def distribute_event_rewards(
    payload: RewardDistributeRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """이벤트 리워드 일괄 지급"""
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="이벤트를 찾을 수 없습니다.")

    points = payload.custom_points if payload.custom_points and payload.custom_points > 0 else event.reward_points
    if not points or points <= 0:
        raise HTTPException(status_code=400, detail="지급할 포인트가 설정되어 있지 않습니다.")

    users = db.query(User).filter(User.id.in_(payload.user_ids), User.status == "1").all()
    if not users:
        raise HTTPException(status_code=400, detail="지급 대상 회원이 없습니다.")

    distributed_count = 0
    for user in users:
        ledger = PointsLedger(
            user_id=user.id,
            change_amount=points,
            transaction_type="1",  # 적립
            reason="04",  # 이벤트
            related_id=event.id,
            note=f"이벤트 리워드: {event.title}",
        )
        db.add(ledger)
        user.point_balance = (user.point_balance or 0) + points
        distributed_count += 1

    db.commit()
    return {
        "message": f"{distributed_count}명에게 {points}P를 지급했습니다.",
        "distributed_count": distributed_count,
        "points_per_user": points,
    }


@router.get("/admins", response_model=List[AdminUserResponse])
async def list_admins(db: Session = Depends(get_db)):
    admin_rows = db.query(Admin).join(User, Admin.user_id == User.id).order_by(Admin.created_at.desc()).all()
    return [
        AdminUserResponse(
            id=admin_row.user.id,
            email=admin_row.user.email,
            display_name=admin_row.user.display_name,
            phone_number=admin_row.user.phone_number,
            provider=admin_row.user.provider,
            is_admin=True,
            created_at=admin_row.user.created_at,
            subscription_count=len(admin_row.user.subscriptions),
        )
        for admin_row in admin_rows
    ]


@router.post("/admins", status_code=status.HTTP_201_CREATED)
async def create_admin_user(payload: AdminUserCreate, db: Session = Depends(get_db)):
    """신규 관리자 계정 생성 (회원 + 관리자 동시 등록)"""
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="이미 존재하는 이메일입니다.")
    user = User(
        email=payload.email,
        phone_number=payload.phone_number,
        display_name=payload.display_name,
        provider=payload.provider,
        is_admin=True,
        status=payload.status,
        password_hash=get_password_hash(payload.password) if payload.password else None,
    )
    db.add(user)
    db.flush()
    admin_row = Admin(user_id=user.id, role="admin")
    db.add(admin_row)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.post("/admins/promote/{user_id}", status_code=status.HTTP_201_CREATED)
async def promote_to_admin(user_id: int, db: Session = Depends(get_db)):
    """기존 회원을 관리자로 등록"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    existing = db.query(Admin).filter(Admin.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="이미 관리자로 등록된 사용자입니다.")
    user.is_admin = True
    admin_row = Admin(user_id=user.id, role="admin")
    db.add(admin_row)
    db.commit()
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.get("/admins/{user_id}", response_model=AdminUserResponse)
async def get_admin_detail(user_id: int, db: Session = Depends(get_db)):
    """관리자 상세 조회"""
    admin_row = db.query(Admin).filter(Admin.user_id == user_id).first()
    if not admin_row:
        raise HTTPException(status_code=404, detail="관리자를 찾을 수 없습니다.")
    user = admin_row.user
    return AdminUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        phone_number=user.phone_number,
        provider=user.provider,
        is_admin=True,
        status=user.status,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        subscription_count=len(user.subscriptions),
    )


@router.put("/admins/{user_id}")
async def update_admin(user_id: int, payload: AdminUserUpdate, db: Session = Depends(get_db)):
    """관리자 정보 수정"""
    admin_row = db.query(Admin).filter(Admin.user_id == user_id).first()
    if not admin_row:
        raise HTTPException(status_code=404, detail="관리자를 찾을 수 없습니다.")
    user = admin_row.user
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.email is not None:
        existing = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다.")
        user.email = payload.email
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number
    if payload.provider is not None:
        user.provider = payload.provider
    if payload.status is not None:
        user.status = payload.status
    if payload.password:
        user.password_hash = get_password_hash(payload.password)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.get("/access-logs", response_model=AdminAccessLogPaginatedResponse)
async def list_access_logs(
    q: Optional[str] = Query(None, description="회원명 검색"),
    role: Optional[str] = Query(None, description="회원구분: admin=관리자, user=일반회원"),
    start_date: Optional[str] = Query(None, description="시작일 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="종료일 (YYYY-MM-DD)"),
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    query = db.query(AccessLog, User.display_name, User.is_admin).outerjoin(
        User, AccessLog.user_id == User.id
    )

    if q:
        query = query.filter(User.display_name.ilike(f"%{q}%"))

    if role == "admin":
        query = query.filter(User.is_admin == True)
    elif role == "user":
        query = query.filter(User.is_admin == False)

    if start_date:
        query = query.filter(AccessLog.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        query = query.filter(AccessLog.created_at < end_dt)

    total = query.count()
    results = query.order_by(AccessLog.created_at.desc()).offset(skip).limit(limit).all()
    items = [
        AdminAccessLogResponse(
            id=log.id,
            admin_id=log.user_id,
            user_name=display_name,
            is_admin=is_admin,
            action=log.action,
            ip_address=log.ip_address,
            created_at=log.created_at,
        )
        for log, display_name, is_admin in results
    ]
    return AdminAccessLogPaginatedResponse(items=items, total=total)


@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    now = datetime.now()
    start_today = datetime.combine(now.date(), datetime.min.time())
    seven_days_ago = now - timedelta(days=7)
    one_day_ago = now - timedelta(days=1)

    today_sales = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= start_today)
        .scalar()
    )
    today_orders = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= start_today)
        .scalar()
    )
    today_deliveries = (
        db.query(func.count(Shipment.id))
        .filter(
            Shipment.status.in_(["shipped", "delivered"]),
            Shipment.shipped_at >= start_today,
        )
        .scalar()
    )
    new_members = (
        db.query(func.count(User.id))
        .filter(User.created_at >= one_day_ago)
        .scalar()
    )
    active_users = (
        db.query(func.count(User.id))
        .filter(User.last_login_at.isnot(None), User.last_login_at >= seven_days_ago)
        .scalar()
    )
    shipping_in_progress = (
        db.query(func.count(Shipment.id))
        .filter(Shipment.status.in_(["pending", "processing", "shipped"]))
        .scalar()
    )

    return AdminDashboardStats(
        today_sales=float(today_sales or 0),
        today_orders=int(today_orders or 0),
        today_deliveries=int(today_deliveries or 0),
        new_members=int(new_members or 0),
        active_users=int(active_users or 0),
        shipping_in_progress=int(shipping_in_progress or 0),
    )


@router.get("/dashboard/new-members", response_model=List[AdminNewMember])
async def get_new_members(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    return [
        AdminNewMember(
            id=user.id,
            name=user.display_name,
            provider=user.provider,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.get("/dashboard/popular-coffee", response_model=List[AdminPopularCoffee])
async def get_popular_coffee(db: Session = Depends(get_db)):
    results = (
        db.query(OrderItem.blend_id, Blend.name, func.count(OrderItem.id))
        .join(Blend, OrderItem.blend_id == Blend.id)
        .group_by(OrderItem.blend_id, Blend.name)
        .order_by(func.count(OrderItem.id).desc())
        .limit(5)
        .all()
    )
    return [
        AdminPopularCoffee(
            blend_id=blend_id,
            name=name,
            order_count=count,
        )
        for blend_id, name, count in results
    ]


@router.get("/dashboard/monthly-chart", response_model=List[AdminDashboardMonthlyChart])
async def get_dashboard_monthly_chart(db: Session = Depends(get_db)):
    """최근 3개월 월별 매출/주문건수"""
    now = datetime.now()
    # 3개월 전 1일부터
    if now.month <= 3:
        start = datetime(now.year - 1, now.month + 9, 1)
    else:
        start = datetime(now.year, now.month - 3, 1)

    results = (
        db.query(
            func.date_format(Order.created_at, "%Y-%m").label("month"),
            func.coalesce(func.sum(Order.total_amount), 0),
            func.count(Order.id),
        )
        .filter(Order.created_at >= start)
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        AdminDashboardMonthlyChart(
            month=m,
            sales_amount=float(amt or 0),
            order_count=int(cnt or 0),
        )
        for m, amt, cnt in results
    ]


@router.get("/sales/summary", response_model=AdminSalesSummary)
async def get_sales_summary(db: Session = Depends(get_db)):
    now = datetime.now()
    start_today = datetime.combine(now.date(), datetime.min.time())
    thirty_days_ago = now - timedelta(days=30)

    today_sales = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= start_today)
        .scalar()
    )

    total_orders = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= thirty_days_ago)
        .scalar()
    )
    subscription_orders = (
        db.query(func.count(Order.id))
        .filter(Order.created_at >= thirty_days_ago, Order.order_type == "subscription")
        .scalar()
    )

    total_orders = total_orders or 0
    subscription_orders = subscription_orders or 0
    single_orders = max(total_orders - subscription_orders, 0)
    subscription_ratio = (subscription_orders / total_orders * 100) if total_orders else 0
    single_ratio = (single_orders / total_orders * 100) if total_orders else 0

    return AdminSalesSummary(
        today_sales=float(today_sales or 0),
        subscription_ratio=round(subscription_ratio, 1),
        single_ratio=round(single_ratio, 1),
    )


@router.get("/sales/daily", response_model=List[AdminDailySales])
async def get_daily_sales(db: Session = Depends(get_db)):
    today = datetime.now().date()
    start_date = today - timedelta(days=13)
    results = (
        db.query(func.date(Order.created_at), func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    sales_map = {item[0]: float(item[1] or 0) for item in results}
    return [
        AdminDailySales(date=day, total_amount=sales_map.get(day, 0))
        for day in (start_date + timedelta(days=i) for i in range(14))
    ]


@router.get("/sales/monthly", response_model=List[AdminMonthlySales])
async def get_monthly_sales(db: Session = Depends(get_db)):
    """최근 12개월 월별 매출"""
    now = datetime.now()
    start = datetime(now.year - 1, now.month, 1)
    results = (
        db.query(
            func.date_format(Order.created_at, "%Y-%m").label("month"),
            func.coalesce(func.sum(Order.total_amount), 0),
        )
        .filter(Order.created_at >= start)
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        AdminMonthlySales(month=m, total_amount=float(amt or 0))
        for m, amt in results
    ]


@router.get("/sales/yearly", response_model=List[AdminYearlySales])
async def get_yearly_sales(db: Session = Depends(get_db)):
    """최근 5년 연별 매출"""
    now = datetime.now()
    start = datetime(now.year - 4, 1, 1)
    results = (
        db.query(
            func.date_format(Order.created_at, "%Y").label("year"),
            func.coalesce(func.sum(Order.total_amount), 0),
        )
        .filter(Order.created_at >= start)
        .group_by("year")
        .order_by("year")
        .all()
    )
    return [
        AdminYearlySales(year=y, total_amount=float(amt or 0))
        for y, amt in results
    ]


@router.get("/sales/products", response_model=List[AdminProductSales])
async def get_product_sales(
    period: Optional[str] = Query(None, description="daily|monthly|yearly"),
    db: Session = Depends(get_db),
):
    """상품별 매출 (기간 필터 선택 가능)"""
    query = (
        db.query(
            OrderItem.blend_id,
            Blend.name,
            func.count(OrderItem.id),
            func.coalesce(func.sum(OrderItem.unit_price * OrderItem.quantity), 0),
        )
        .join(Blend, OrderItem.blend_id == Blend.id)
        .join(Order, OrderItem.order_id == Order.id)
    )

    now = datetime.now()
    if period == "daily":
        query = query.filter(Order.created_at >= datetime.combine(now.date(), datetime.min.time()))
    elif period == "monthly":
        query = query.filter(Order.created_at >= datetime(now.year, now.month, 1))
    elif period == "yearly":
        query = query.filter(Order.created_at >= datetime(now.year, 1, 1))

    results = (
        query.group_by(OrderItem.blend_id, Blend.name)
        .order_by(func.count(OrderItem.id).desc())
        .limit(10)
        .all()
    )
    return [
        AdminProductSales(
            blend_id=blend_id,
            name=name,
            order_count=count,
            total_amount=float(amt or 0),
        )
        for blend_id, name, count, amt in results
    ]


@router.get("/sales/taste-distribution", response_model=AdminTasteDistribution)
async def get_taste_distribution(db: Session = Depends(get_db)):
    row = db.query(
        func.coalesce(func.avg(AnalysisResult.aroma), 0),
        func.coalesce(func.avg(AnalysisResult.acidity), 0),
        func.coalesce(func.avg(AnalysisResult.sweetness), 0),
        func.coalesce(func.avg(AnalysisResult.body), 0),
        func.coalesce(func.avg(AnalysisResult.nuttiness), 0),
    ).first()
    return AdminTasteDistribution(
        aroma=float(row[0] or 0),
        acidity=float(row[1] or 0),
        sweetness=float(row[2] or 0),
        body=float(row[3] or 0),
        nuttiness=float(row[4] or 0),
    )


@router.get("/score-scales", response_model=List[AdminScoreScaleResponse])
async def list_score_scales(db: Session = Depends(get_db)):
    scales = db.query(ScoreScale).order_by(ScoreScale.attribute_key, ScoreScale.score).all()
    return [
        AdminScoreScaleResponse(
            id=scale.id,
            attribute_key=scale.attribute_key,
            attribute_label=scale.attribute_label,
            score=scale.score,
            description=scale.description,
        )
        for scale in scales
    ]


@router.post("/score-scales", response_model=AdminScoreScaleResponse, status_code=status.HTTP_201_CREATED)
async def create_score_scale(payload: AdminScoreScaleCreate, db: Session = Depends(get_db)):
    scale = ScoreScale(**payload.dict())
    db.add(scale)
    db.commit()
    db.refresh(scale)
    return AdminScoreScaleResponse(
        id=scale.id,
        attribute_key=scale.attribute_key,
        attribute_label=scale.attribute_label,
        score=scale.score,
        description=scale.description,
    )


@router.put("/score-scales/{scale_id}", response_model=AdminScoreScaleResponse)
async def update_score_scale(scale_id: int, payload: AdminScoreScaleUpdate, db: Session = Depends(get_db)):
    scale = db.query(ScoreScale).filter(ScoreScale.id == scale_id).first()
    if not scale:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다.")

    payload_dict = payload.dict(exclude_unset=True)
    for key, value in payload_dict.items():
        setattr(scale, key, value)
    db.commit()
    db.refresh(scale)
    return AdminScoreScaleResponse(
        id=scale.id,
        attribute_key=scale.attribute_key,
        attribute_label=scale.attribute_label,
        score=scale.score,
        description=scale.description,
    )


class AdminReviewStatusUpdate(BaseModel):
    status: str  # 2=승인, 3=반려


@router.get("/reviews", response_model=List[AdminReviewResponse])
async def list_admin_reviews(
    status_filter: Optional[str] = Query(None),
    user_name: Optional[str] = Query(None),
    blend_name: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Review, Blend.name.label("blend_name"), User.display_name.label("user_display_name"))
        .join(Blend, Review.blend_id == Blend.id)
        .join(User, Review.user_id == User.id)
    )
    if status_filter:
        query = query.filter(Review.status == status_filter)
    if user_name:
        query = query.filter(User.display_name.ilike(f"%{user_name}%"))
    if blend_name:
        query = query.filter(Blend.name.ilike(f"%{blend_name}%"))
    if rating is not None:
        query = query.filter(Review.rating == rating)

    results = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return [
        AdminReviewResponse(
            id=review.id,
            blend_name=bn,
            user_display_name=udn,
            rating=review.rating,
            content=review.content,
            photo_url=review.photo_url,
            status=review.status,
            created_at=review.created_at,
        )
        for review, bn, udn in results
    ]


@router.get("/reviews/{review_id}", response_model=AdminReviewDetailResponse)
async def get_review_detail(
    review_id: int,
    db: Session = Depends(get_db),
):
    """리뷰 상세 조회"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")

    blend = db.query(Blend).filter(Blend.id == review.blend_id).first()
    user = db.query(User).filter(User.id == review.user_id).first()
    moderator = None
    if review.moderated_by:
        moderator = db.query(User).filter(User.id == review.moderated_by).first()

    return AdminReviewDetailResponse(
        id=review.id,
        user_id=review.user_id,
        user_display_name=user.display_name if user else None,
        user_email=user.email if user else None,
        blend_id=review.blend_id,
        blend_name=blend.name if blend else None,
        blend_thumbnail_url=blend.thumbnail_url if blend else None,
        order_item_id=review.order_item_id,
        rating=review.rating,
        content=review.content,
        photo_url=review.photo_url,
        status=review.status,
        points_awarded=review.points_awarded or False,
        moderated_by=review.moderated_by,
        moderator_name=moderator.display_name if moderator else None,
        moderated_at=review.moderated_at,
        created_at=review.created_at,
    )


@router.put("/reviews/{review_id}/status")
async def update_review_status(
    review_id: int,
    payload: AdminReviewStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """리뷰 상태 변경 (승인/반려) - 승인 시 1000P 지급"""
    if payload.status not in ("1", "2", "3"):
        raise HTTPException(status_code=400, detail="유효하지 않은 상태값입니다. (1=대기, 2=승인, 3=반려)")
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")

    old_status = review.status
    review.status = payload.status
    review.moderated_by = admin.id
    review.moderated_at = datetime.utcnow()

    # 승인 시 포인트 지급 (이전에 지급하지 않은 경우만)
    if payload.status == "2" and old_status != "2" and not review.points_awarded:
        user = db.query(User).filter(User.id == review.user_id).with_for_update().first()
        if user:
            ledger = PointsLedger(
                user_id=review.user_id,
                transaction_type="1",
                change_amount=1000,
                reason="02",
                related_id=review.id,
                note="리뷰 승인 포인트",
            )
            db.add(ledger)
            user.point_balance = (user.point_balance or 0) + 1000
            review.points_awarded = True

    # 반려 시 포인트 차감 (이전에 승인 포인트를 지급한 경우만)
    if payload.status == "3" and review.points_awarded:
        user = db.query(User).filter(User.id == review.user_id).with_for_update().first()
        if user:
            ledger = PointsLedger(
                user_id=review.user_id,
                transaction_type="2",
                change_amount=-1000,
                reason="02",
                related_id=review.id,
                note="리뷰 반려 포인트 차감",
            )
            db.add(ledger)
            user.point_balance = (user.point_balance or 0) - 1000
            review.points_awarded = False

    db.commit()
    return {"message": "상태가 변경되었습니다.", "review_id": review_id, "status": payload.status}


@router.get("/banners", response_model=List[BannerResponse])
async def list_admin_banners(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
):
    """배너 목록"""
    items = db.query(Banner).order_by(Banner.sort_order.asc(), Banner.created_at.desc()).offset(skip).limit(limit).all()
    return items


@router.post("/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_banner(
    payload: BannerCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """배너 등록"""
    row = Banner(
        title=payload.title,
        comment=payload.comment,
        desc=payload.desc,
        banner_url=payload.banner_url,
        is_visible=payload.is_visible,
        sort_order=payload.sort_order,
        created_by=admin.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/banners/{banner_id}", response_model=BannerResponse)
async def get_admin_banner(
    banner_id: int,
    db: Session = Depends(get_db),
):
    """배너 1건 조회"""
    row = db.query(Banner).filter(Banner.id == banner_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="배너를 찾을 수 없습니다.")
    return row


@router.put("/banners/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: int,
    payload: BannerUpdate,
    db: Session = Depends(get_db),
):
    """배너 수정"""
    row = db.query(Banner).filter(Banner.id == banner_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="배너를 찾을 수 없습니다.")
    if payload.title is not None:
        row.title = payload.title
    if payload.comment is not None:
        row.comment = payload.comment
    if payload.desc is not None:
        row.desc = payload.desc
    if payload.banner_url is not None:
        row.banner_url = payload.banner_url
    if payload.is_visible is not None:
        row.is_visible = payload.is_visible
    if payload.sort_order is not None:
        row.sort_order = payload.sort_order
    db.commit()
    db.refresh(row)
    return row


# ── 약관 관리 ──────────────────────────────────────────────────


@router.get("/terms", response_model=List[TermsListItem])
async def list_admin_terms(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
):
    """약관 목록 (관리자)"""
    items = db.query(Terms).order_by(Terms.sort_order.asc(), Terms.created_at.desc()).offset(skip).limit(limit).all()
    return items


@router.get("/terms/{terms_id}", response_model=TermsResponse)
async def get_admin_terms(
    terms_id: int,
    db: Session = Depends(get_db),
):
    """약관 1건 조회 (관리자)"""
    row = db.query(Terms).filter(Terms.id == terms_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="약관을 찾을 수 없습니다.")
    return row


@router.post("/terms", response_model=TermsResponse, status_code=status.HTTP_201_CREATED)
async def create_terms(
    payload: TermsCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """약관 등록 (관리자)"""
    row = Terms(
        slug=payload.slug,
        title=payload.title,
        content=payload.content,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
        effective_date=payload.effective_date,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/terms/{terms_id}", response_model=TermsResponse)
async def update_terms(
    terms_id: int,
    payload: TermsUpdate,
    db: Session = Depends(get_db),
):
    """약관 수정 (관리자)"""
    row = db.query(Terms).filter(Terms.id == terms_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="약관을 찾을 수 없습니다.")
    if payload.slug is not None:
        row.slug = payload.slug
    if payload.title is not None:
        row.title = payload.title
    if payload.content is not None:
        row.content = payload.content
    if payload.is_active is not None:
        row.is_active = payload.is_active
    if payload.sort_order is not None:
        row.sort_order = payload.sort_order
    if payload.effective_date is not None:
        row.effective_date = payload.effective_date
    db.commit()
    db.refresh(row)
    return row


# ── 회원 커피 컬렉션 ──────────────────────────────────────────
class AdminCollectionResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    blend_id: int
    blend_name: Optional[str] = None
    collection_name: Optional[str] = None
    personal_comment: Optional[str] = None
    created_at: datetime


@router.get("/collections", response_model=List[AdminCollectionResponse])
async def list_user_collections(
    q: Optional[str] = Query(None, description="회원이름 또는 상품명 검색"),
    user_id: Optional[int] = Query(None),
    created_from: Optional[date] = Query(None),
    created_to: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """회원 커피 컬렉션 목록"""
    query = (
        db.query(
            UserCollection,
            User.display_name.label("user_name"),
            Blend.name.label("blend_name"),
        )
        .join(User, UserCollection.user_id == User.id)
        .join(Blend, UserCollection.blend_id == Blend.id)
    )
    if user_id:
        query = query.filter(UserCollection.user_id == user_id)
    if q:
        query = query.filter(
            User.display_name.ilike(f"%{q}%") | Blend.name.ilike(f"%{q}%")
        )
    if created_from:
        query = query.filter(UserCollection.created_at >= datetime.combine(created_from, datetime.min.time()))
    if created_to:
        query = query.filter(UserCollection.created_at < datetime.combine(created_to + timedelta(days=1), datetime.min.time()))

    results = query.order_by(UserCollection.created_at.desc()).offset(skip).limit(limit).all()
    return [
        AdminCollectionResponse(
            id=coll.id,
            user_id=coll.user_id,
            user_name=uname,
            blend_id=coll.blend_id,
            blend_name=bname,
            collection_name=coll.collection_name,
            personal_comment=coll.personal_comment,
            created_at=coll.created_at,
        )
        for coll, uname, bname in results
    ]


# ── 컬렉션 분석 ──────────────────────────────────────────────

class TasteProfileRank(BaseModel):
    rank: int
    aroma: int
    acidity: int
    sweetness: int
    body: int
    nuttiness: int
    count: int


class BlendRank(BaseModel):
    rank: int
    blend_id: int
    blend_name: str
    aroma: int
    acidity: int
    sweetness: int
    body: int
    nuttiness: int
    count: int


class CollectionAnalysisResponse(BaseModel):
    popular_profiles: List[TasteProfileRank]
    popular_blends: List[BlendRank]
    total_collections: int


@router.get("/collections/analysis", response_model=CollectionAnalysisResponse)
async def get_collection_analysis(db: Session = Depends(get_db)):
    """커피 컬렉션 분석: 인기 취향 프로필 Top5, 인기 블렌드 Top5"""
    from sqlalchemy import desc

    total = db.query(func.count(UserCollection.id)).scalar() or 0

    # 인기 취향 프로필 Top5 (동일 분석 수치 그룹)
    profile_rows = (
        db.query(
            AnalysisResult.aroma,
            AnalysisResult.acidity,
            AnalysisResult.sweetness,
            AnalysisResult.body,
            AnalysisResult.nuttiness,
            func.count(UserCollection.id).label("cnt"),
        )
        .join(UserCollection, UserCollection.analysis_result_id == AnalysisResult.id)
        .group_by(
            AnalysisResult.aroma,
            AnalysisResult.acidity,
            AnalysisResult.sweetness,
            AnalysisResult.body,
            AnalysisResult.nuttiness,
        )
        .order_by(desc("cnt"))
        .limit(5)
        .all()
    )
    popular_profiles = [
        TasteProfileRank(
            rank=i + 1,
            aroma=row.aroma,
            acidity=row.acidity,
            sweetness=row.sweetness,
            body=row.body,
            nuttiness=row.nuttiness,
            count=row.cnt,
        )
        for i, row in enumerate(profile_rows)
    ]

    # 인기 블렌드 Top5
    blend_rows = (
        db.query(
            Blend.id,
            Blend.name,
            Blend.aroma,
            Blend.acidity,
            Blend.sweetness,
            Blend.body,
            Blend.nuttiness,
            func.count(UserCollection.id).label("cnt"),
        )
        .join(UserCollection, UserCollection.blend_id == Blend.id)
        .group_by(Blend.id)
        .order_by(desc("cnt"))
        .limit(5)
        .all()
    )
    popular_blends = [
        BlendRank(
            rank=i + 1,
            blend_id=row.id,
            blend_name=row.name,
            aroma=row.aroma or 1,
            acidity=row.acidity or 1,
            sweetness=row.sweetness or 1,
            body=row.body or 1,
            nuttiness=row.nuttiness or 1,
            count=row.cnt,
        )
        for i, row in enumerate(blend_rows)
    ]

    return CollectionAnalysisResponse(
        popular_profiles=popular_profiles,
        popular_blends=popular_blends,
        total_collections=total,
    )


# ── 1:1 문의 관리 ──────────────────────────────────────────────


class AdminInquiryListItem(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    inquiry_type: str
    status: str
    title: Optional[str] = None
    message: str
    created_at: datetime
    answered_at: Optional[datetime] = None


class AdminInquiryDetail(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    order_id: Optional[int] = None
    order_item_id: Optional[int] = None
    blend_name: Optional[str] = None
    inquiry_type: str
    status: str
    title: Optional[str] = None
    message: str
    image_url: Optional[str] = None
    answer: Optional[str] = None
    created_at: datetime
    answered_at: Optional[datetime] = None


class AdminInquiryAnswerRequest(BaseModel):
    answer: str


@router.get("/inquiries", response_model=List[AdminInquiryListItem])
async def get_admin_inquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """관리자 문의 목록 조회"""
    q = db.query(Inquiry, User.display_name).join(User, User.id == Inquiry.user_id)
    if status_filter:
        q = q.filter(Inquiry.status == status_filter)
    q = q.order_by(Inquiry.created_at.desc())
    rows = q.offset(skip).limit(limit).all()
    return [
        AdminInquiryListItem(
            id=inq.id,
            user_id=inq.user_id,
            user_name=uname,
            inquiry_type=inq.inquiry_type,
            status=inq.status,
            title=inq.title,
            message=inq.message[:50] if inq.message else "",
            created_at=inq.created_at,
            answered_at=inq.answered_at,
        )
        for inq, uname in rows
    ]


@router.get("/inquiries/{inquiry_id}", response_model=AdminInquiryDetail)
async def get_admin_inquiry_detail(
    inquiry_id: int,
    db: Session = Depends(get_db),
):
    """관리자 문의 상세 조회"""
    row = (
        db.query(Inquiry, User.display_name)
        .join(User, User.id == Inquiry.user_id)
        .filter(Inquiry.id == inquiry_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="문의를 찾을 수 없습니다.")
    inq, uname = row

    blend_name = None
    if inq.order_item_id:
        oi = db.query(OrderItem).filter(OrderItem.id == inq.order_item_id).first()
        if oi and oi.blend_id:
            blend = db.query(Blend).filter(Blend.id == oi.blend_id).first()
            if blend:
                blend_name = blend.name

    return AdminInquiryDetail(
        id=inq.id,
        user_id=inq.user_id,
        user_name=uname,
        order_id=inq.order_id,
        order_item_id=inq.order_item_id,
        blend_name=blend_name,
        inquiry_type=inq.inquiry_type,
        status=inq.status,
        title=inq.title,
        message=inq.message,
        image_url=inq.image_url,
        answer=inq.answer,
        created_at=inq.created_at,
        answered_at=inq.answered_at,
    )


@router.put("/inquiries/{inquiry_id}/answer")
async def answer_inquiry(
    inquiry_id: int,
    body: AdminInquiryAnswerRequest,
    db: Session = Depends(get_db),
):
    """문의 답변 작성/수정"""
    inq = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inq:
        raise HTTPException(status_code=404, detail="문의를 찾을 수 없습니다.")
    inq.answer = body.answer
    inq.status = "answered"
    inq.answered_at = datetime.now()
    db.commit()
    db.refresh(inq)
    return {"message": "답변이 저장되었습니다.", "id": inq.id}


# ── 대시보드 최근 현황 ─────────────────────────────────────────


class RecentOrderItem(BaseModel):
    id: int
    order_number: str
    user_name: Optional[str] = None
    total_amount: Optional[float] = None
    status: str
    created_at: datetime


class RecentInquiryItem(BaseModel):
    id: int
    user_name: Optional[str] = None
    title: Optional[str] = None
    message: str
    status: str
    created_at: datetime


@router.get("/dashboard/recent-orders", response_model=List[RecentOrderItem])
async def get_dashboard_recent_orders(db: Session = Depends(get_db)):
    """최근 주문 5건"""
    rows = (
        db.query(Order, User.display_name)
        .join(User, User.id == Order.user_id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )
    return [
        RecentOrderItem(
            id=order.id,
            order_number=order.order_number,
            user_name=uname,
            total_amount=float(order.total_amount) if order.total_amount else None,
            status=order.status,
            created_at=order.created_at,
        )
        for order, uname in rows
    ]


@router.get("/dashboard/recent-inquiries", response_model=List[RecentInquiryItem])
async def get_dashboard_recent_inquiries(db: Session = Depends(get_db)):
    """최근 문의 5건"""
    rows = (
        db.query(Inquiry, User.display_name)
        .join(User, User.id == Inquiry.user_id)
        .order_by(Inquiry.created_at.desc())
        .limit(5)
        .all()
    )
    return [
        RecentInquiryItem(
            id=inq.id,
            user_name=uname,
            title=inq.title,
            message=inq.message[:30] if inq.message else "",
            status=inq.status,
            created_at=inq.created_at,
        )
        for inq, uname in rows
    ]


# ── DB 마이그레이션 ──────────────────────────────────────────────

@router.post("/migrate")
async def run_migration(
    db: Session = Depends(get_db),
):
    """DB 스키마를 모델과 동기화합니다."""
    from sqlalchemy import text
    results = []

    def col_exists(table: str, column: str) -> bool:
        row = db.execute(text(
            "SELECT COUNT(*) AS cnt FROM information_schema.columns "
            "WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c"
        ), {"t": table, "c": column}).fetchone()
        return row[0] > 0

    def table_exists(table: str) -> bool:
        row = db.execute(text(
            "SELECT COUNT(*) AS cnt FROM information_schema.tables "
            "WHERE table_schema = DATABASE() AND table_name = :t"
        ), {"t": table}).fetchone()
        return row[0] > 0

    # ── 1. blends: is_active → status ──
    if col_exists("blends", "is_active") and not col_exists("blends", "status"):
        db.execute(text("ALTER TABLE blends ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT '1' AFTER thumbnail_url"))
        db.execute(text("UPDATE blends SET status = CASE WHEN is_active = 1 THEN '1' ELSE '2' END"))
        db.execute(text("ALTER TABLE blends DROP COLUMN is_active"))
        db.execute(text("ALTER TABLE blends ADD INDEX idx_blends_status (status)"))
        results.append("blends: is_active → status 마이그레이션 완료")
    elif not col_exists("blends", "status"):
        db.execute(text("ALTER TABLE blends ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT '1' AFTER thumbnail_url"))
        db.execute(text("ALTER TABLE blends ADD INDEX idx_blends_status (status)"))
        results.append("blends: status 컬럼 추가 완료")
    else:
        results.append("blends: 변경 불필요")

    # ── 2. orders: status 값 코드 전환 ──
    # 기존 문자열 값이 있는지 확인 후 변환
    row = db.execute(text(
        "SELECT COUNT(*) FROM orders WHERE status IN ('pending','preparing','shipping','delivered','cancelled','returned')"
    )).fetchone()
    if row[0] > 0:
        db.execute(text("""
            UPDATE orders SET status = CASE
                WHEN status = 'pending' THEN '1'
                WHEN status = 'preparing' THEN '2'
                WHEN status = 'shipping' THEN '3'
                WHEN status = 'delivered' THEN '4'
                WHEN status = 'cancelled' THEN '5'
                WHEN status = 'returned' THEN '6'
                ELSE status
            END
        """))
        results.append(f"orders: {row[0]}건 status 코드 전환 완료")
    else:
        results.append("orders: 변경 불필요")

    # ── 3. reviews: order_item_id 추가, status Enum → String ──
    if not col_exists("reviews", "order_item_id"):
        db.execute(text("ALTER TABLE reviews ADD COLUMN order_item_id INT NULL AFTER blend_id"))
        db.execute(text("ALTER TABLE reviews ADD INDEX idx_reviews_order_item_id (order_item_id)"))
        results.append("reviews: order_item_id 컬럼 추가 완료")
    else:
        results.append("reviews: order_item_id 이미 존재")

    # reviews status: enum → varchar
    col_info = db.execute(text(
        "SELECT COLUMN_TYPE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'reviews' AND column_name = 'status'"
    )).fetchone()
    if col_info and "enum" in str(col_info[0]).lower():
        db.execute(text("ALTER TABLE reviews MODIFY COLUMN status VARCHAR(24) NOT NULL DEFAULT 'pending'"))
        db.execute(text("""
            UPDATE reviews SET status = CASE
                WHEN status = 'pending' THEN '1'
                WHEN status = 'approved' THEN '2'
                WHEN status = 'rejected' THEN '3'
                ELSE '1'
            END
        """))
        db.execute(text("ALTER TABLE reviews MODIFY COLUMN status VARCHAR(1) NOT NULL DEFAULT '1'"))
        results.append("reviews: status enum → varchar(1) 전환 완료")
    else:
        results.append("reviews: status 변경 불필요")

    # ── 4. points_ledger: 구조 변경 ──
    if col_exists("points_ledger", "points") and not col_exists("points_ledger", "change_amount"):
        # points → change_amount 이름 변경
        db.execute(text("ALTER TABLE points_ledger CHANGE COLUMN points change_amount INT NOT NULL"))
        results.append("points_ledger: points → change_amount 이름 변경")

    # transaction_type: enum → varchar
    col_info = db.execute(text(
        "SELECT COLUMN_TYPE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'points_ledger' AND column_name = 'transaction_type'"
    )).fetchone()
    if col_info and "enum" in str(col_info[0]).lower():
        db.execute(text("ALTER TABLE points_ledger MODIFY COLUMN transaction_type VARCHAR(24) NOT NULL DEFAULT 'earned'"))
        db.execute(text("""
            UPDATE points_ledger SET transaction_type = CASE
                WHEN transaction_type = 'earned' THEN '1'
                WHEN transaction_type = 'spent' THEN '2'
                WHEN transaction_type = 'expired' THEN '3'
                ELSE '1'
            END
        """))
        db.execute(text("ALTER TABLE points_ledger MODIFY COLUMN transaction_type VARCHAR(1) NOT NULL DEFAULT '1'"))
        results.append("points_ledger: transaction_type enum → varchar(1) 전환")

    # reason: varchar(255) → varchar(2) + 기본값
    col_info = db.execute(text(
        "SELECT CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'points_ledger' AND column_name = 'reason'"
    )).fetchone()
    if col_info and col_info[0] and col_info[0] > 2:
        # 기존 텍스트 reason을 코드로 변환
        db.execute(text("ALTER TABLE points_ledger ADD COLUMN reason_new VARCHAR(2) NOT NULL DEFAULT '05' AFTER transaction_type"))
        db.execute(text("ALTER TABLE points_ledger DROP COLUMN reason"))
        db.execute(text("ALTER TABLE points_ledger CHANGE COLUMN reason_new reason VARCHAR(2) NOT NULL DEFAULT '05'"))
        results.append("points_ledger: reason varchar(255) → varchar(2) 전환")

    # 새 컬럼: related_id, note
    if not col_exists("points_ledger", "related_id"):
        db.execute(text("ALTER TABLE points_ledger ADD COLUMN related_id BIGINT NULL AFTER reason"))
        results.append("points_ledger: related_id 추가")
    if not col_exists("points_ledger", "note"):
        db.execute(text("ALTER TABLE points_ledger ADD COLUMN note TEXT NULL AFTER related_id"))
        results.append("points_ledger: note 추가")

    # expire_at 컬럼 제거
    if col_exists("points_ledger", "expire_at"):
        db.execute(text("ALTER TABLE points_ledger DROP COLUMN expire_at"))
        results.append("points_ledger: expire_at 컬럼 제거")

    # ── 5. subscription_cycles: 새 테이블 ──
    if not table_exists("subscription_cycles"):
        db.execute(text("""
            CREATE TABLE subscription_cycles (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                subscription_id BIGINT NOT NULL,
                cycle_number INT NOT NULL,
                status ENUM('scheduled','payment_pending','paid','preparing','shipped','delivered','failed','skipped','cancelled') DEFAULT 'scheduled' NOT NULL,
                scheduled_date DATE NULL,
                billed_at DATETIME NULL,
                shipped_at DATETIME NULL,
                delivered_at DATETIME NULL,
                amount DECIMAL(10, 2) NULL,
                payment_id BIGINT NULL,
                shipment_id BIGINT NULL,
                note TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_sc_subscription_id (subscription_id),
                INDEX idx_sc_status (status),
                INDEX idx_sc_scheduled_date (scheduled_date)
            )
        """))
        results.append("subscription_cycles: 테이블 생성 완료")
    else:
        results.append("subscription_cycles: 이미 존재")

    # ── 6. user_collections: 누락 컬럼 추가 ──
    if not col_exists("user_collections", "analysis_result_id"):
        db.execute(text(
            "ALTER TABLE user_collections ADD COLUMN analysis_result_id INT NULL AFTER blend_id"
        ))
        db.execute(text(
            "ALTER TABLE user_collections ADD INDEX idx_uc_analysis_result_id (analysis_result_id)"
        ))
        results.append("user_collections: analysis_result_id 컬럼 추가 완료")
    else:
        results.append("user_collections: analysis_result_id 이미 존재")

    if not col_exists("user_collections", "collection_name"):
        db.execute(text(
            "ALTER TABLE user_collections ADD COLUMN collection_name VARCHAR(128) NULL AFTER analysis_result_id"
        ))
        results.append("user_collections: collection_name 컬럼 추가 완료")
    else:
        results.append("user_collections: collection_name 이미 존재")

    if not col_exists("user_collections", "personal_comment"):
        db.execute(text(
            "ALTER TABLE user_collections ADD COLUMN personal_comment TEXT NULL AFTER collection_name"
        ))
        results.append("user_collections: personal_comment 컬럼 추가 완료")
    else:
        results.append("user_collections: personal_comment 이미 존재")

    if not col_exists("user_collections", "updated_at"):
        db.execute(text(
            "ALTER TABLE user_collections ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"
        ))
        results.append("user_collections: updated_at 컬럼 추가 완료")
    else:
        results.append("user_collections: updated_at 이미 존재")

    # ── 7. shipments: 누락 컬럼 + status enum 수정 ──
    for scol, sdef in [
        ("carrier", "ALTER TABLE shipments ADD COLUMN carrier VARCHAR(64) NULL AFTER tracking_number"),
        ("delivered_at", "ALTER TABLE shipments ADD COLUMN delivered_at DATETIME NULL AFTER shipped_at"),
        ("address", "ALTER TABLE shipments ADD COLUMN address TEXT NULL AFTER delivered_at"),
        ("recipient_name", "ALTER TABLE shipments ADD COLUMN recipient_name VARCHAR(128) NULL AFTER address"),
        ("recipient_phone", "ALTER TABLE shipments ADD COLUMN recipient_phone VARCHAR(20) NULL AFTER recipient_name"),
    ]:
        if not col_exists("shipments", scol):
            db.execute(text(sdef))
            results.append(f"shipments: {scol} 컬럼 추가 완료")
        else:
            results.append(f"shipments: {scol} 이미 존재")

    ship_col = db.execute(text(
        "SELECT COLUMN_TYPE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'shipments' AND column_name = 'status'"
    )).fetchone()
    if ship_col and "processing" not in str(ship_col[0]):
        db.execute(text(
            "ALTER TABLE shipments MODIFY COLUMN status "
            "ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending'"
        ))
        results.append("shipments: status enum에 processing 추가 완료")
    else:
        results.append("shipments: status enum 변경 불필요")

    # ── 8. blends: 누락 컬럼 추가 ──
    if not col_exists("blends", "aroma"):
        db.execute(text(
            "ALTER TABLE blends ADD COLUMN aroma TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER summary"
        ))
        results.append("blends: aroma 컬럼 추가 완료")
    else:
        results.append("blends: aroma 이미 존재")

    # ── 8. users: 누락 컬럼 추가 ──
    if not col_exists("users", "status"):
        db.execute(text(
            "ALTER TABLE users ADD COLUMN status VARCHAR(1) NOT NULL DEFAULT '1' COMMENT '회원상태: 1=가입, 0=탈퇴' AFTER is_admin"
        ))
        results.append("users: status 컬럼 추가 완료")
    else:
        results.append("users: status 이미 존재")

    if not col_exists("users", "point_balance"):
        db.execute(text(
            "ALTER TABLE users ADD COLUMN point_balance INT NOT NULL DEFAULT 0 AFTER last_login_at"
        ))
        results.append("users: point_balance 컬럼 추가 완료")
    else:
        results.append("users: point_balance 이미 존재")

    if not col_exists("users", "auto_login_enabled"):
        db.execute(text(
            "ALTER TABLE users ADD COLUMN auto_login_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER point_balance"
        ))
        results.append("users: auto_login_enabled 컬럼 추가 완료")
    else:
        results.append("users: auto_login_enabled 이미 존재")

    if not col_exists("users", "auto_login_token"):
        db.execute(text(
            "ALTER TABLE users ADD COLUMN auto_login_token VARCHAR(255) NULL AFTER auto_login_enabled"
        ))
        results.append("users: auto_login_token 컬럼 추가 완료")
    else:
        results.append("users: auto_login_token 이미 존재")

    # ── payments: order_id 컬럼 추가, subscription_id nullable ──
    if not col_exists("payments", "order_id"):
        db.execute(text(
            "ALTER TABLE payments ADD COLUMN order_id INT NULL AFTER subscription_id"
        ))
        db.execute(text("ALTER TABLE payments ADD INDEX idx_payments_order_id (order_id)"))
        results.append("payments: order_id 컬럼 추가 완료")
    else:
        results.append("payments: order_id 이미 존재")

    # subscription_id nullable로 변경
    pay_col = db.execute(text(
        "SELECT IS_NULLABLE FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'payments' AND column_name = 'subscription_id'"
    )).fetchone()
    if pay_col and pay_col[0] == "NO":
        db.execute(text(
            "ALTER TABLE payments MODIFY COLUMN subscription_id INT NULL"
        ))
        results.append("payments: subscription_id nullable로 변경 완료")
    else:
        results.append("payments: subscription_id 변경 불필요")

    # ── orders: cycle_number 컬럼 추가 ──
    if not col_exists("orders", "cycle_number"):
        db.execute(text(
            "ALTER TABLE orders ADD COLUMN cycle_number INT NULL AFTER subscription_id"
        ))
        results.append("orders: cycle_number 컬럼 추가 완료")
    else:
        results.append("orders: cycle_number 이미 존재")

    # ── orders: tracking_number, carrier, cancel_reason, cancelled_at ──
    for col_name, col_def in [
        ("tracking_number", "VARCHAR(128) NULL"),
        ("carrier", "VARCHAR(64) NULL DEFAULT 'hanjin'"),
        ("cancel_reason", "TEXT NULL"),
        ("cancelled_at", "DATETIME NULL"),
    ]:
        if not col_exists("orders", col_name):
            db.execute(text(
                f"ALTER TABLE orders ADD COLUMN {col_name} {col_def}"
            ))
            results.append(f"orders: {col_name} 컬럼 추가 완료")
        else:
            results.append(f"orders: {col_name} 이미 존재")

    # ── users: push_enabled 컬럼 추가 ──
    if not col_exists("users", "push_enabled"):
        db.execute(text(
            "ALTER TABLE users ADD COLUMN push_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER agreed_marketing_at"
        ))
        results.append("users: push_enabled 컬럼 추가 완료")
    else:
        results.append("users: push_enabled 이미 존재")

    db.commit()
    return {"message": "마이그레이션 완료", "results": results}

