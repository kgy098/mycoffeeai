"""Inquiry routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Inquiry, OrderItem, Order, Blend
from pydantic import BaseModel

router = APIRouter()


class InquiryCreateRequest(BaseModel):
    user_id: int
    inquiry_type: str = "product"
    title: Optional[str] = None
    message: str
    image_url: Optional[str] = None
    order_item_id: Optional[int] = None


class InquiryResponse(BaseModel):
    id: int
    user_id: int
    inquiry_type: str
    status: str
    title: Optional[str]
    message: str
    image_url: Optional[str]
    answer: Optional[str]
    created_at: datetime
    answered_at: Optional[datetime]
    order_item_id: Optional[int]
    blend_name: Optional[str]

    class Config:
        from_attributes = True


@router.get("/inquiries", response_model=List[InquiryResponse])
async def list_inquiries(
    user_id: int = Query(...),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Inquiry, Blend.name.label("blend_name")).outerjoin(
        OrderItem, Inquiry.order_item_id == OrderItem.id
    ).outerjoin(
        Blend, OrderItem.blend_id == Blend.id
    ).filter(Inquiry.user_id == user_id)

    if status:
        query = query.filter(Inquiry.status == status)

    results = query.order_by(Inquiry.created_at.desc()).all()
    items = []
    for inquiry, blend_name in results:
        items.append(
            InquiryResponse(
                id=inquiry.id,
                user_id=inquiry.user_id,
                inquiry_type=inquiry.inquiry_type,
                status=inquiry.status,
                title=inquiry.title,
                message=inquiry.message,
                image_url=inquiry.image_url,
                answer=inquiry.answer,
                created_at=inquiry.created_at,
                answered_at=inquiry.answered_at,
                order_item_id=inquiry.order_item_id,
                blend_name=blend_name,
            )
        )
    return items


@router.get("/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def get_inquiry_detail(
    inquiry_id: int,
    db: Session = Depends(get_db)
):
    result = db.query(Inquiry, Blend.name.label("blend_name")).outerjoin(
        OrderItem, Inquiry.order_item_id == OrderItem.id
    ).outerjoin(
        Blend, OrderItem.blend_id == Blend.id
    ).filter(Inquiry.id == inquiry_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="문의 내역을 찾을 수 없습니다.")

    inquiry, blend_name = result
    return InquiryResponse(
        id=inquiry.id,
        user_id=inquiry.user_id,
        inquiry_type=inquiry.inquiry_type,
        status=inquiry.status,
        title=inquiry.title,
        message=inquiry.message,
        image_url=inquiry.image_url,
        answer=inquiry.answer,
        created_at=inquiry.created_at,
        answered_at=inquiry.answered_at,
        order_item_id=inquiry.order_item_id,
        blend_name=blend_name,
    )


@router.post("/inquiries", response_model=InquiryResponse)
async def create_inquiry(
    payload: InquiryCreateRequest,
    db: Session = Depends(get_db)
):
    inquiry = Inquiry(
        user_id=payload.user_id,
        inquiry_type=payload.inquiry_type,
        title=payload.title,
        message=payload.message,
        image_url=payload.image_url,
        order_item_id=payload.order_item_id,
        status="pending",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    blend_name = None
    if inquiry.order_item_id:
        order_item = db.query(OrderItem).filter(OrderItem.id == inquiry.order_item_id).first()
        if order_item and order_item.blend_id:
            blend = db.query(Blend).filter(Blend.id == order_item.blend_id).first()
            blend_name = blend.name if blend else None

    return InquiryResponse(
        id=inquiry.id,
        user_id=inquiry.user_id,
        inquiry_type=inquiry.inquiry_type,
        status=inquiry.status,
        title=inquiry.title,
        message=inquiry.message,
        image_url=inquiry.image_url,
        answer=inquiry.answer,
        created_at=inquiry.created_at,
        answered_at=inquiry.answered_at,
        order_item_id=inquiry.order_item_id,
        blend_name=blend_name,
    )
