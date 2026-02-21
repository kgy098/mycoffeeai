"""SubscriptionCycle model – 구독 회차별 내역"""
from sqlalchemy import Column, BigInteger, Integer, String, Date, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from app.models import Base


class CycleStatus(str, PyEnum):
    """구독 회차 상태"""
    SCHEDULED = "scheduled"              # 예정
    PAYMENT_PENDING = "payment_pending"  # 결제 대기
    PAID = "paid"                        # 결제 완료
    PREPARING = "preparing"              # 배송 준비
    SHIPPED = "shipped"                  # 배송중
    DELIVERED = "delivered"              # 배송 완료
    FAILED = "failed"                    # 실패
    SKIPPED = "skipped"                  # 건너뜀
    CANCELLED = "cancelled"              # 취소


class SubscriptionCycle(Base):
    """구독 회차별 내역 테이블"""
    __tablename__ = "subscription_cycles"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    subscription_id = Column(
        BigInteger,
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cycle_number = Column(Integer, nullable=False)
    status = Column(
        Enum(CycleStatus, values_callable=lambda x: [e.value for e in x]),
        default=CycleStatus.SCHEDULED,
        index=True,
    )
    scheduled_date = Column(Date, nullable=True, index=True)
    billed_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    amount = Column(Numeric(10, 2), nullable=True)
    payment_id = Column(BigInteger, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    shipment_id = Column(BigInteger, ForeignKey("shipments.id", ondelete="SET NULL"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    subscription = relationship("Subscription", back_populates="cycles")
    payment = relationship("Payment", foreign_keys=[payment_id])
    shipment = relationship("Shipment", foreign_keys=[shipment_id])

    def __repr__(self):
        return f"<SubscriptionCycle(id={self.id}, sub={self.subscription_id}, cycle={self.cycle_number})>"
