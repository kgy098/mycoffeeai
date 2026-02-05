"""Points routes"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import PointsLedger
from pydantic import BaseModel

router = APIRouter()


class PointsBalanceResponse(BaseModel):
    user_id: int
    balance: int


class PointsTransactionResponse(BaseModel):
    id: int
    user_id: int
    change_amount: int
    reason: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/points/balance", response_model=PointsBalanceResponse)
async def get_points_balance(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    balance = db.query(PointsLedger).filter(PointsLedger.user_id == user_id).all()
    total = sum(item.change_amount for item in balance)
    return PointsBalanceResponse(user_id=user_id, balance=total)


@router.get("/points/transactions", response_model=List[PointsTransactionResponse])
async def get_points_transactions(
    user_id: int = Query(...),
    txn_type: str = Query("all", description="all|earned|used|canceled"),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PointsLedger).filter(PointsLedger.user_id == user_id)

    if year:
        query = query.filter(PointsLedger.created_at >= datetime(year, 1, 1)).filter(
            PointsLedger.created_at < datetime(year + 1, 1, 1)
        )

    if txn_type == "earned":
        query = query.filter(PointsLedger.change_amount > 0)
    elif txn_type == "used":
        query = query.filter(PointsLedger.change_amount < 0)
    elif txn_type == "canceled":
        query = query.filter(PointsLedger.reason == "refund")

    results = query.order_by(PointsLedger.created_at.desc()).all()
    return results
