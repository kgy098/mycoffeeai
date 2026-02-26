"""OrderHistory model - 주문 상태 변경 이력"""
from sqlalchemy import Column, BigInteger, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class OrderHistory(Base):
    """주문 상태 변경 이력 테이블"""
    __tablename__ = "order_histories"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    prev_status = Column(String(24), nullable=True, comment="이전 상태")
    new_status = Column(String(24), nullable=False, comment="변경된 상태")
    changed_by = Column(String(64), nullable=True, comment="변경 주체: user, admin, system")
    note = Column(Text, nullable=True, comment="비고")
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="histories")

    def __repr__(self):
        return f"<OrderHistory(id={self.id}, order_id={self.order_id}, {self.prev_status}->{self.new_status})>"
