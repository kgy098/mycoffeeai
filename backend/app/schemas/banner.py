"""Banner schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BannerBase(BaseModel):
    """Base Banner schema"""
    title: Optional[str] = None
    comment: Optional[str] = None
    desc: Optional[str] = None
    banner_url: Optional[str] = None
    is_visible: bool = True
    sort_order: int = 0


class BannerCreate(BannerBase):
    """Banner creation schema"""
    pass


class BannerUpdate(BaseModel):
    """Banner update schema"""
    title: Optional[str] = None
    comment: Optional[str] = None
    desc: Optional[str] = None
    banner_url: Optional[str] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


class BannerResponse(BannerBase):
    """Banner response schema"""
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
