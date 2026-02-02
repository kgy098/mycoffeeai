"""Routes for taste history operations"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.schemas import TasteHistoryCreate, TasteHistoryResponse
from app.models.taste_history import TasteHistory

router = APIRouter()


@router.post("/", response_model=TasteHistoryResponse)
def create_taste_history(payload: TasteHistoryCreate, request: Request, db: Session = Depends(get_db)):
    """Create a taste history record and return it."""
    now = datetime.now(timezone.utc)
    expire_at = now + timedelta(hours=24)

    ip_address = payload.ip_address or (request.client.host if request.client else None)
    user_agent = request.headers.get("user-agent")

    th = TasteHistory(
        anonymous_id=payload.anonymous_id,
        ip_address=ip_address,
        user_agent=user_agent,
        acidity=payload.acidity,
        sweetness=payload.sweetness,
        body=payload.body,
        nuttiness=payload.nuttiness,
        bitterness=payload.bitterness,
        note=payload.note,
        expire_at=expire_at,
    )

    db.add(th)
    db.commit()
    db.refresh(th)

    return th
