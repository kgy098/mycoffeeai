"""Review model"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class Review(Base):
    """Review table model"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="SET NULL"), nullable=True, index=True)

    rating = Column(Integer, nullable=True)
    content = Column(Text, nullable=True)
    photo_url = Column(String(1024), nullable=True)

    status = Column(String(1), nullable=False, default="1", index=True)  # 1=대기, 2=승인, 3=반려
    points_awarded = Column(Boolean, default=False)

    moderated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    moderated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="reviews")
    blend = relationship("Blend", back_populates="reviews")
    moderator = relationship("User", foreign_keys=[moderated_by])

    def __repr__(self):
        return f"<Review(id={self.id}, status={self.status})>"
