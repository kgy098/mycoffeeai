"""Notification settings routes"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models import User
from pydantic import BaseModel

router = APIRouter()


# ── 알림 설정 (users 테이블 기반) ──


class NotificationSettingsResponse(BaseModel):
    push_enabled: bool
    marketing_agreed: bool
    marketing_agreed_at: Optional[datetime] = None


class NotificationSettingsUpdateRequest(BaseModel):
    user_id: int
    push_enabled: Optional[bool] = None
    marketing_agreed: Optional[bool] = None


@router.get("/notification-settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return NotificationSettingsResponse(
        push_enabled=user.push_enabled or False,
        marketing_agreed=user.agreed_marketing or False,
        marketing_agreed_at=user.agreed_marketing_at,
    )


@router.put("/notification-settings", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    payload: NotificationSettingsUpdateRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if payload.push_enabled is not None:
        user.push_enabled = payload.push_enabled

    if payload.marketing_agreed is not None:
        user.agreed_marketing = payload.marketing_agreed
        user.agreed_marketing_at = datetime.utcnow() if payload.marketing_agreed else user.agreed_marketing_at

    db.commit()
    db.refresh(user)
    return NotificationSettingsResponse(
        push_enabled=user.push_enabled or False,
        marketing_agreed=user.agreed_marketing or False,
        marketing_agreed_at=user.agreed_marketing_at,
    )
