"""Points Ledger model"""
from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class PointsLedger(Base):
    """Points Ledger table model"""
    __tablename__ = "points_ledger"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    change_amount = Column(Integer, nullable=False, comment="변동량: 양수=적립, 음수=사용/환불")
    transaction_type = Column(String(1), nullable=False, default="1", comment="구분: 1=적립, 2=사용, 3=취소/환불")
    reason = Column(String(2), nullable=False, default="05", comment="사유: 01=회원가입, 02=리뷰작성, 03=구매적립, 04=이벤트, 05=관리자조정, 06=상품구매, 07=구독결제, 08=환불, 09=만료")
    related_id = Column(BigInteger, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="points")

    def __repr__(self):
        return f"<PointsLedger(id={self.id}, type={self.transaction_type}, reason={self.reason})>"
