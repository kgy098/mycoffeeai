"""Terms model"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.models import Base


class Terms(Base):
    """Terms table model (약관)"""
    __tablename__ = "terms"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, comment="약관 고유 식별자")
    title = Column(String(255), nullable=False, comment="약관 제목")
    content = Column(Text, nullable=False, comment="약관 내용 (HTML)")
    is_active = Column(Boolean, default=True, index=True, comment="활성 여부")
    sort_order = Column(Integer, default=0, nullable=False, comment="정렬 순서")
    effective_date = Column(String(20), nullable=True, comment="시행일")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Terms(id={self.id}, slug={self.slug})>"
