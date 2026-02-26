"""User model"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class User(Base):
    """User table model (social login + email)"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(128), nullable=True)
    provider = Column(String(32), nullable=True, comment="가입채널: email=이메일, kakao=카카오, naver=네이버, apple=애플")
    provider_id = Column(String(255), nullable=True)
    profile_image_url = Column(String(1024), nullable=True)
    phone_number = Column(String(20), nullable=False)
    is_phone_verified = Column(Boolean, default=False, nullable=False, comment="본인인증 완료 여부")
    birth_date = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True, comment="성별: male=남성, female=여성, other=기타")
    signup_purpose = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    status = Column(String(1), default="1", nullable=False, comment="회원상태: 1=가입, 0=탈퇴")
    last_login_at = Column(DateTime, nullable=True)
    point_balance = Column(Integer, default=0, nullable=False)  # 현재 포인트 잔액
    # 자동로그인: 체크 여부 + 쿠키와 비교할 토큰
    auto_login_enabled = Column(Boolean, default=False, nullable=False)
    auto_login_token = Column(String(255), nullable=True)
    agreed_terms = Column(Boolean, default=False, nullable=False)
    agreed_terms_at = Column(DateTime, nullable=True)
    agreed_privacy = Column(Boolean, default=False, nullable=False)
    agreed_privacy_at = Column(DateTime, nullable=True)
    agreed_marketing = Column(Boolean, default=False, nullable=False)
    agreed_marketing_at = Column(DateTime, nullable=True)
    push_enabled = Column(Boolean, default=False, nullable=False, comment="앱 푸시 알림 수신 여부")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    subscriptions = relationship("Subscription", back_populates="user")
    reviews = relationship("Review", foreign_keys="Review.user_id", back_populates="user")
    collections = relationship("UserCollection", back_populates="user")
    points = relationship("PointsLedger", back_populates="user")
    delivery_addresses = relationship("DeliveryAddress", back_populates="user")
    orders = relationship("Order", back_populates="user")
    inquiries = relationship("Inquiry", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, provider={self.provider})>"
