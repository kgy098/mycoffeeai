"""Delivery address routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import DeliveryAddress
from pydantic import BaseModel

router = APIRouter()


class DeliveryAddressRequest(BaseModel):
    user_id: int
    recipient_name: str
    phone_number: str
    postal_code: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    is_default: bool = False


class DeliveryAddressResponse(BaseModel):
    id: int
    user_id: int
    recipient_name: str
    phone_number: str
    postal_code: Optional[str]
    address_line1: str
    address_line2: Optional[str]
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/delivery-addresses", response_model=List[DeliveryAddressResponse])
async def list_delivery_addresses(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return (
        db.query(DeliveryAddress)
        .filter(DeliveryAddress.user_id == user_id, DeliveryAddress.deleted_at.is_(None))
        .order_by(DeliveryAddress.is_default.desc(), DeliveryAddress.created_at.desc())
        .all()
    )


@router.get("/delivery-addresses/default", response_model=Optional[DeliveryAddressResponse])
async def get_default_delivery_address(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return (
        db.query(DeliveryAddress)
        .filter(
            DeliveryAddress.user_id == user_id,
            DeliveryAddress.deleted_at.is_(None),
            DeliveryAddress.is_default == True,
        )
        .first()
    )


@router.post("/delivery-addresses", response_model=DeliveryAddressResponse)
async def create_delivery_address(
    payload: DeliveryAddressRequest,
    db: Session = Depends(get_db)
):
    if payload.is_default:
        db.query(DeliveryAddress).filter(
            DeliveryAddress.user_id == payload.user_id,
            DeliveryAddress.deleted_at.is_(None),
            DeliveryAddress.is_default == True,
        ).update({DeliveryAddress.is_default: False})

    address = DeliveryAddress(**payload.dict())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/delivery-addresses/{address_id}", response_model=DeliveryAddressResponse)
async def update_delivery_address(
    address_id: int,
    payload: DeliveryAddressRequest,
    db: Session = Depends(get_db)
):
    address = db.query(DeliveryAddress).filter(DeliveryAddress.id == address_id).first()
    if not address or address.deleted_at is not None:
        raise HTTPException(status_code=404, detail="배송지를 찾을 수 없습니다.")

    if payload.is_default:
        db.query(DeliveryAddress).filter(
            DeliveryAddress.user_id == payload.user_id,
            DeliveryAddress.deleted_at.is_(None),
            DeliveryAddress.is_default == True,
            DeliveryAddress.id != address_id,
        ).update({DeliveryAddress.is_default: False})

    for key, value in payload.dict().items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)
    return address


@router.put("/delivery-addresses/{address_id}/set-default", response_model=DeliveryAddressResponse)
async def set_default_delivery_address(
    address_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    address = db.query(DeliveryAddress).filter(DeliveryAddress.id == address_id).first()
    if not address or address.deleted_at is not None:
        raise HTTPException(status_code=404, detail="배송지를 찾을 수 없습니다.")

    db.query(DeliveryAddress).filter(
        DeliveryAddress.user_id == user_id,
        DeliveryAddress.deleted_at.is_(None),
        DeliveryAddress.is_default == True,
    ).update({DeliveryAddress.is_default: False})

    address.is_default = True
    db.commit()
    db.refresh(address)
    return address


@router.delete("/delivery-addresses/{address_id}")
async def delete_delivery_address(
    address_id: int,
    db: Session = Depends(get_db)
):
    address = db.query(DeliveryAddress).filter(DeliveryAddress.id == address_id).first()
    if not address or address.deleted_at is not None:
        raise HTTPException(status_code=404, detail="배송지를 찾을 수 없습니다.")

    address.deleted_at = datetime.utcnow()
    address.is_default = False
    db.commit()
    return {"message": "배송지가 삭제되었습니다.", "id": address_id}
