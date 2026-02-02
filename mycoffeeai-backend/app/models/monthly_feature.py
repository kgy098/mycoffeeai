"""Monthly Feature model"""
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class MonthlyFeature(Base):
    """Monthly Feature table model"""
    __tablename__ = "monthly_features"

    id = Column(Integer, primary_key=True, index=True)
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="CASCADE"), nullable=False, index=True)
    month = Column(Date, nullable=False, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    banner_url = Column(String(1024), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    blend = relationship("Blend", back_populates="monthly_features")

    def __repr__(self):
        return f"<MonthlyFeature(id={self.id})>"
