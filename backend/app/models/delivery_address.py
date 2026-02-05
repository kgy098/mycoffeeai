"""Delivery Address model"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class DeliveryAddress(Base):
    """Delivery Address table model"""
    __tablename__ = "delivery_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_name = Column(String(64), nullable=False)
    phone_number = Column(String(20), nullable=False)
    postal_code = Column(String(12), nullable=True)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    is_default = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="delivery_addresses")

    def __repr__(self):
        return f"<DeliveryAddress(id={self.id}, user_id={self.user_id})>"
