"""Blend model"""
from sqlalchemy import Column, Integer, String, JSON, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class Blend(Base):
    """Blend (커피 상품) table model"""
    __tablename__ = "blends"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    origin_ratios = Column(JSON, nullable=False)
    summary = Column(String(512), nullable=True)
    attributes = Column(JSON, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    stock = Column(Integer, default=0)
    thumbnail_url = Column(String(1024), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    subscriptions = relationship("Subscription", back_populates="blend")
    reviews = relationship("Review", back_populates="blend")
    collections = relationship("UserCollection", back_populates="blend")
    monthly_features = relationship("MonthlyFeature", back_populates="blend")
    analysis_results = relationship("AnalysisResult", back_populates="blend")

    def __repr__(self):
        return f"<Blend(id={self.id}, name={self.name})>"
