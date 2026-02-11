"""Event model"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.models import Base


class Event(Base):
    """Event table model"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    thumbnail_url = Column(String(1024), nullable=True)
    detail_image_url = Column(String(1024), nullable=True)
    status = Column(String(20), nullable=False, server_default="진행중")
    push_on_publish = Column(Boolean, nullable=False, server_default="0")
    reward_points = Column(Integer, nullable=False, server_default="0")
    reward_coupon_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title})>"
