"""Banner model"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models import Base


class Banner(Base):
    """Banner table model (메인 배너)"""
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True, comment="배너 제목(부제)")
    comment = Column(String(255), nullable=True, comment="한줄평")
    desc = Column(Text, nullable=True, comment="설명")
    banner_url = Column(String(1024), nullable=True)
    is_visible = Column(Boolean, default=True, index=True)
    sort_order = Column(Integer, default=0, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Banner(id={self.id})>"
