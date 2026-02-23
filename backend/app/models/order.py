"""Order model"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class Order(Base):
    """Order table model"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(32), nullable=False, unique=True, index=True)
    order_type = Column(String(16), nullable=False, default="single", comment="주문유형: single=단품, subscription=구독")
    status = Column(String(24), nullable=False, default="1", comment="주문상태: 1=주문접수, 2=배송준비, 3=배송중, 4=배송완료, 5=취소, 6=반품")
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    cycle_number = Column(Integer, nullable=True, comment="구독 회차 번호")
    delivery_address_id = Column(Integer, ForeignKey("delivery_addresses.id", ondelete="SET NULL"), nullable=True)
    payment_method = Column(String(64), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    discount_amount = Column(Numeric(10, 2), nullable=True)
    points_used = Column(Integer, default=0)
    delivery_fee = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery_address = relationship("DeliveryAddress")
    subscription = relationship("Subscription")

    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number})>"
