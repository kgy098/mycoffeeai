"""Terms schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TermsBase(BaseModel):
    """Base Terms schema"""
    slug: str
    title: str
    content: str
    is_active: bool = True
    sort_order: int = 0
    effective_date: Optional[str] = None


class TermsCreate(TermsBase):
    """Terms creation schema"""
    pass


class TermsUpdate(BaseModel):
    """Terms update schema"""
    slug: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    effective_date: Optional[str] = None


class TermsResponse(TermsBase):
    """Terms response schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TermsListItem(BaseModel):
    """Terms list item (without full content)"""
    id: int
    slug: str
    title: str
    is_active: bool
    sort_order: int
    effective_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
