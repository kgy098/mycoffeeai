"""User model"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class User(Base):
    """User table model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(128), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    subscriptions = relationship("Subscription", back_populates="user")
    reviews = relationship("Review", foreign_keys="Review.user_id", back_populates="user")
    collections = relationship("UserCollection", back_populates="user")
    points = relationship("PointsLedger", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
