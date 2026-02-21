"""Inquiry model"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class Inquiry(Base):
    """Inquiry table model"""
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="SET NULL"), nullable=True, index=True)
    inquiry_type = Column(String(32), nullable=False, default="product", comment="문의유형: product=상품문의, order=주문문의, delivery=배송문의, etc=기타")
    status = Column(String(16), nullable=False, default="pending", comment="문의상태: pending=대기, answered=답변완료")
    title = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    image_url = Column(String(1024), nullable=True)
    answer = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    answered_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="inquiries")
    order = relationship("Order")
    order_item = relationship("OrderItem")

    def __repr__(self):
        return f"<Inquiry(id={self.id}, user_id={self.user_id})>"
