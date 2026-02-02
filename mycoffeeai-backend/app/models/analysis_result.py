"""Analysis Result model"""
from sqlalchemy import Column, Integer, JSON, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class AnalysisResult(Base):
    """Analysis Result table model"""
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    taste_history_id = Column(Integer, ForeignKey("taste_histories.id", ondelete="CASCADE"), nullable=False)
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="SET NULL"), nullable=True)
    score = Column(JSON, nullable=True)
    interpretation = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    taste_history = relationship("TasteHistory", back_populates="analysis_results")
    blend = relationship("Blend", back_populates="analysis_results")

    def __repr__(self):
        return f"<AnalysisResult(id={self.id})>"
