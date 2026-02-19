"""Banner routes"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Banner
from app.schemas.banner import BannerResponse

router = APIRouter()


@router.get("/visible", response_model=List[BannerResponse])
async def get_visible_banners(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
):
    """메인 배너용: 노출된 배너 목록"""
    items = (
        db.query(Banner)
        .filter(Banner.is_visible == True)
        .order_by(Banner.sort_order.asc(), Banner.created_at.desc())
        .limit(limit)
        .all()
    )
    return items


@router.get("/current", response_model=List[BannerResponse])
async def get_current_banners(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
):
    """노출된 배너 목록 (visible과 동일)"""
    return await get_visible_banners(db=db, limit=limit)


@router.get("/", response_model=List[BannerResponse])
async def list_banners(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """배너 목록 (전체)"""
    return (
        db.query(Banner)
        .order_by(Banner.sort_order.asc(), Banner.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{banner_id}", response_model=BannerResponse)
async def get_banner(
    banner_id: int,
    db: Session = Depends(get_db),
):
    """배너 1건 조회"""
    row = db.query(Banner).filter(Banner.id == banner_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="배너를 찾을 수 없습니다.")
    return row
