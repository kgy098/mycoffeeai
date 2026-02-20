"""Review routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Review, Blend, User, OrderItem, Order, PointsLedger
from app.models.points_ledger import PointsTransactionType
from app.models.subscription import Subscription, SubscriptionStatus
from pydantic import BaseModel

router = APIRouter()


class ReviewCreateRequest(BaseModel):
    user_id: int
    blend_id: int
    rating: int
    content: str
    photo_url: Optional[str] = None
    order_item_id: Optional[int] = None


class ReviewUpdateRequest(BaseModel):
    user_id: int
    rating: int
    content: str
    photo_url: Optional[str] = None


class ReviewListItem(BaseModel):
    id: int
    user_id: int
    user_display_name: Optional[str]
    rating: Optional[int]
    content: Optional[str]
    photo_url: Optional[str]
    blend_id: int
    blend_name: Optional[str]
    created_at: datetime
    likes: int = 0

    class Config:
        from_attributes = True


class ReviewDetailResponse(ReviewListItem):
    status: str
    points_awarded: bool


class ReviewableOrderItem(BaseModel):
    order_item_id: Optional[int] = None
    order_id: Optional[int] = None
    subscription_id: Optional[int] = None
    order_number: str
    order_date: datetime
    blend_id: Optional[int]
    blend_name: Optional[str]
    options: Optional[dict]
    quantity: int
    unit_price: Optional[float] = None


@router.get("/reviews", response_model=List[ReviewListItem])
async def list_reviews(
    sort: str = Query("latest", description="latest|popular|rating_desc|rating_asc"),
    photo_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(Review, Blend.name.label("blend_name"), User.display_name.label("user_display_name")).join(
        Blend, Review.blend_id == Blend.id
    ).join(
        User, Review.user_id == User.id
    )

    if photo_only:
        query = query.filter(Review.photo_url.isnot(None))

    if sort == "rating_desc":
        query = query.order_by(desc(Review.rating))
    elif sort == "rating_asc":
        query = query.order_by(asc(Review.rating))
    else:
        query = query.order_by(desc(Review.created_at))

    results = query.all()
    items = []
    for review, blend_name, user_display_name in results:
        items.append(
            ReviewListItem(
                id=review.id,
                user_id=review.user_id,
                user_display_name=user_display_name,
                rating=review.rating,
                content=review.content,
                photo_url=review.photo_url,
                blend_id=review.blend_id,
                blend_name=blend_name,
                created_at=review.created_at,
                likes=0,
            )
        )
    return items


@router.get("/reviews/user/{user_id}", response_model=List[ReviewDetailResponse])
async def list_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):
    results = (
        db.query(Review, Blend.name.label("blend_name"), User.display_name.label("user_display_name"))
        .join(Blend, Review.blend_id == Blend.id)
        .join(User, Review.user_id == User.id)
        .filter(Review.user_id == user_id)
        .order_by(desc(Review.created_at))
        .all()
    )

    items = []
    for review, blend_name, user_display_name in results:
        items.append(
            ReviewDetailResponse(
                id=review.id,
                user_id=review.user_id,
                user_display_name=user_display_name,
                rating=review.rating,
                content=review.content,
                photo_url=review.photo_url,
                blend_id=review.blend_id,
                blend_name=blend_name,
                created_at=review.created_at,
                likes=0,
                status=review.status.value if hasattr(review.status, "value") else str(review.status),
                points_awarded=review.points_awarded,
            )
        )
    return items


@router.get("/reviews/reviewable", response_model=List[ReviewableOrderItem])
async def list_reviewable_order_items(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    # Order-based reviewable items (delivered orders)
    order_results = (
        db.query(OrderItem, Order.order_number, Order.created_at, Blend.name.label("blend_name"))
        .join(Order, OrderItem.order_id == Order.id)
        .join(Blend, OrderItem.blend_id == Blend.id)
        .filter(Order.user_id == user_id, Order.status == "delivered")
        .order_by(desc(Order.created_at))
        .all()
    )

    reviewable = []
    order_blend_ids = set()

    for item, order_number, created_at, blend_name in order_results:
        order_blend_ids.add(item.blend_id)
        already_reviewed = (
            db.query(Review)
            .filter(Review.user_id == user_id, Review.blend_id == item.blend_id)
            .first()
        )
        if already_reviewed:
            continue
        reviewable.append(
            ReviewableOrderItem(
                order_item_id=item.id,
                order_id=item.order_id,
                order_number=order_number,
                order_date=created_at,
                blend_id=item.blend_id,
                blend_name=blend_name,
                options=item.options,
                quantity=item.quantity,
                unit_price=float(item.unit_price) if item.unit_price else None,
            )
        )

    # Subscription-based reviewable items
    sub_results = (
        db.query(Subscription, Blend.name.label("blend_name"))
        .join(Blend, Subscription.blend_id == Blend.id)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status.in_([
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.PAUSED,
                SubscriptionStatus.CANCELLED,
                SubscriptionStatus.EXPIRED,
            ])
        )
        .order_by(desc(Subscription.created_at))
        .all()
    )

    for sub, blend_name in sub_results:
        # Skip blends already covered by orders (reviewed or not)
        if sub.blend_id in order_blend_ids:
            continue
        already_reviewed = (
            db.query(Review)
            .filter(Review.user_id == user_id, Review.blend_id == sub.blend_id)
            .first()
        )
        if already_reviewed:
            continue
        reviewable.append(
            ReviewableOrderItem(
                subscription_id=sub.id,
                order_number=f"구독 #{sub.id}",
                order_date=sub.created_at,
                blend_id=sub.blend_id,
                blend_name=blend_name,
                options=sub.options,
                quantity=sub.quantity or 1,
                unit_price=float(sub.total_amount) if sub.total_amount else None,
            )
        )

    return reviewable


@router.get("/reviews/{review_id}", response_model=ReviewDetailResponse)
async def get_review_detail(
    review_id: int,
    db: Session = Depends(get_db)
):
    result = (
        db.query(Review, Blend.name.label("blend_name"), User.display_name.label("user_display_name"))
        .join(Blend, Review.blend_id == Blend.id)
        .join(User, Review.user_id == User.id)
        .filter(Review.id == review_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")

    review, blend_name, user_display_name = result
    return ReviewDetailResponse(
        id=review.id,
        user_id=review.user_id,
        user_display_name=user_display_name,
        rating=review.rating,
        content=review.content,
        photo_url=review.photo_url,
        blend_id=review.blend_id,
        blend_name=blend_name,
        created_at=review.created_at,
        likes=0,
        status=review.status.value if hasattr(review.status, "value") else str(review.status),
        points_awarded=review.points_awarded,
    )


@router.post("/reviews", response_model=ReviewDetailResponse)
async def create_review(
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db)
):
    try:
        review = Review(
            user_id=payload.user_id,
            blend_id=payload.blend_id,
            rating=payload.rating,
            content=payload.content,
            photo_url=payload.photo_url,
        )
        db.add(review)
        db.flush()

        if payload.photo_url:
            user = db.query(User).filter(User.id == payload.user_id).with_for_update().first()
            if not user:
                db.rollback()
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
            ledger = PointsLedger(
                user_id=payload.user_id,
                transaction_type=PointsTransactionType.EARNED,
                change_amount=1000,
                reason="review",
            )
            db.add(ledger)
            user.point_balance = (user.point_balance or 0) + 1000
            review.points_awarded = True

        db.commit()
        db.refresh(review)
    except Exception:
        db.rollback()
        raise

    blend = db.query(Blend).filter(Blend.id == review.blend_id).first()
    user = db.query(User).filter(User.id == review.user_id).first()

    return ReviewDetailResponse(
        id=review.id,
        user_id=review.user_id,
        user_display_name=user.display_name if user else None,
        rating=review.rating,
        content=review.content,
        photo_url=review.photo_url,
        blend_id=review.blend_id,
        blend_name=blend.name if blend else None,
        created_at=review.created_at,
        likes=0,
        status=review.status.value if hasattr(review.status, "value") else str(review.status),
        points_awarded=review.points_awarded,
    )


@router.put("/reviews/{review_id}", response_model=ReviewDetailResponse)
async def update_review(
    review_id: int,
    payload: ReviewUpdateRequest,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")
    if review.user_id != payload.user_id:
        raise HTTPException(status_code=403, detail="수정 권한이 없습니다.")

    old_photo_url = review.photo_url
    review.rating = payload.rating
    review.content = payload.content
    review.photo_url = payload.photo_url

    # Award points if photo was newly added and not yet awarded
    if payload.photo_url and not old_photo_url and not review.points_awarded:
        user = db.query(User).filter(User.id == payload.user_id).with_for_update().first()
        if user:
            ledger = PointsLedger(
                user_id=payload.user_id,
                transaction_type=PointsTransactionType.EARNED,
                change_amount=1000,
                reason="review",
            )
            db.add(ledger)
            user.point_balance = (user.point_balance or 0) + 1000
            review.points_awarded = True

    db.commit()
    db.refresh(review)

    blend = db.query(Blend).filter(Blend.id == review.blend_id).first()
    user = db.query(User).filter(User.id == review.user_id).first()

    return ReviewDetailResponse(
        id=review.id,
        user_id=review.user_id,
        user_display_name=user.display_name if user else None,
        rating=review.rating,
        content=review.content,
        photo_url=review.photo_url,
        blend_id=review.blend_id,
        blend_name=blend.name if blend else None,
        created_at=review.created_at,
        likes=0,
        status=review.status.value if hasattr(review.status, "value") else str(review.status),
        points_awarded=review.points_awarded,
    )


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")
    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")

    db.delete(review)
    db.commit()
    return {"message": "리뷰가 삭제되었습니다."}
