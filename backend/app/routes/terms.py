"""Public Terms routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.terms import Terms
from app.schemas.terms import TermsResponse, TermsListItem

router = APIRouter()


@router.get("/terms/", response_model=List[TermsListItem])
async def list_terms(db: Session = Depends(get_db)):
    """활성 약관 목록 (공개)"""
    items = db.query(Terms).filter(Terms.is_active == True).order_by(Terms.sort_order.asc()).all()
    return items


@router.get("/terms/{slug}", response_model=TermsResponse)
async def get_terms_by_slug(slug: str, db: Session = Depends(get_db)):
    """slug로 약관 조회 (공개)"""
    row = db.query(Terms).filter(Terms.slug == slug, Terms.is_active == True).first()
    if not row:
        raise HTTPException(status_code=404, detail="약관을 찾을 수 없습니다.")
    return row
