"""Shipment model"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from app.models import Base


class ShipmentStatus(str, PyEnum):
    """Shipment status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Shipment(Base):
    """Shipment table model"""
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_number = Column(String(128), unique=True, nullable=True, index=True)
    carrier = Column(String(64), nullable=True)
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.PENDING, index=True, comment="배송상태: pending=배송준비중, processing=처리중, shipped=배송중, delivered=배송완료, cancelled=취소")
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    address = Column(Text, nullable=True)
    recipient_name = Column(String(128), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    scheduled_date = Column(Date, nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    subscription = relationship("Subscription", back_populates="shipments")

    def __repr__(self):
        return f"<Shipment(id={self.id}, status={self.status})>"
