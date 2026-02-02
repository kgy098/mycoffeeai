"""Taste History model"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class TasteHistory(Base):
    """Taste History (취향분석 이력) table model"""
    __tablename__ = "taste_histories"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=True, index=True)
    anonymous_id = Column(String(128), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True, index=True)
    user_agent = Column(String(512), nullable=True)
    user_id = Column(Integer, nullable=True, index=True)
    
    acidity = Column(Integer, nullable=False)
    sweetness = Column(Integer, nullable=False)
    body = Column(Integer, nullable=False)
    nuttiness = Column(Integer, nullable=False)
    bitterness = Column(Integer, nullable=False)
    
    note = Column(Text, nullable=True)
    expire_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    analysis_results = relationship("AnalysisResult", back_populates="taste_history")

    def __repr__(self):
        return f"<TasteHistory(id={self.id}, user_id={self.user_id})>"
