"""User Collection model"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class UserCollection(Base):
    """User Collection table model"""
    __tablename__ = "user_collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_result_id = Column(Integer, ForeignKey("analysis_results.id", ondelete="SET NULL"), nullable=True, index=True)
    collection_name = Column(String(128), nullable=True)
    personal_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="collections")
    blend = relationship("Blend", back_populates="collections")
    analysis_result = relationship("AnalysisResult")

    def __repr__(self):
        return f"<UserCollection(id={self.id})>"
