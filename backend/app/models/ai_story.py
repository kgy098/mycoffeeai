"""AI 스토리 저장 (취향분석 상세 진입 시 1회 생성·저장, 컬렉션은 analysis_result_id로 조회)"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.sql import func
from app.models import Base


class AiStory(Base):
    __tablename__ = "ai_stories"

    id = Column(Integer, primary_key=True, index=True)
    analysis_result_id = Column(
        Integer,
        ForeignKey("analysis_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="SET NULL"), nullable=True, index=True)
    sections = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<AiStory(id={self.id}, analysis_result_id={self.analysis_result_id})>"
