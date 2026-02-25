"""Payment model"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


# 결제 상태 코드: 1=대기, 2=결제완료, 3=결제실패, 4=환불완료
PAYMENT_STATUS_CODES = {
    "1": "대기",
    "2": "결제완료",
    "3": "결제실패",
    "4": "환불완료",
}


class Payment(Base):
    """Payment table model"""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="KRW")
    payment_method = Column(String(64), nullable=True)
    transaction_id = Column("provider_transaction_id", String(255), unique=True, nullable=True, index=True)
    status = Column(String(32), default="1", index=True, comment="결제상태: 1=대기, 2=결제완료, 3=결제실패, 4=환불완료")
    attempts = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    subscription = relationship("Subscription", back_populates="payments")
    order = relationship("Order", foreign_keys=[order_id])

    def __repr__(self):
        return f"<Payment(id={self.id}, status={self.status})>"
