"""Order model"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text, JSON
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
    status = Column(String(24), nullable=False, default="1", comment="주문상태: 1=주문접수, 2=배송준비, 3=배송중, 4=배송완료, 5=취소, 6=반품요청, 7=반품처리중, 8=반품완료")
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    cycle_number = Column(Integer, nullable=True, comment="구독 회차 번호")
    delivery_address_id = Column(Integer, ForeignKey("delivery_addresses.id", ondelete="SET NULL"), nullable=True)
    payment_method = Column(String(64), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    discount_amount = Column(Numeric(10, 2), nullable=True)
    points_used = Column(Integer, default=0)
    delivery_fee = Column(Numeric(10, 2), nullable=True)
    tracking_number = Column(String(128), nullable=True, comment="송장번호")
    carrier = Column(String(64), nullable=True, default="hanjin", comment="택배사")
    cancel_reason = Column(Text, nullable=True, comment="취소 사유")
    cancelled_at = Column(DateTime, nullable=True, comment="취소 일시")
    return_reason = Column(String(32), nullable=True, comment="반품 사유 카테고리")
    return_content = Column(Text, nullable=True, comment="반품 상세 사유")
    return_photos = Column(JSON, nullable=True, comment="반품 사진 URL 배열")
    returned_at = Column(DateTime, nullable=True, comment="반품 신청 일시")
    agree_personal_info = Column(Boolean, default=False, nullable=False, comment="개인정보 수집 동의 여부")
    agree_personal_info_at = Column(DateTime, nullable=True, comment="개인정보 수집 동의 일시")
    agree_terms = Column(Boolean, default=False, nullable=False, comment="이용약관 동의 여부")
    agree_terms_at = Column(DateTime, nullable=True, comment="이용약관 동의 일시")
    agree_marketing = Column(Boolean, default=False, nullable=False, comment="마케팅 활용 동의 여부")
    agree_marketing_at = Column(DateTime, nullable=True, comment="마케팅 활용 동의 일시")
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    histories = relationship("OrderHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderHistory.created_at")
    delivery_address = relationship("DeliveryAddress")
    subscription = relationship("Subscription")

    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number})>"
