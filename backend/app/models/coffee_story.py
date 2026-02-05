"""Coffee Story model"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.models import Base


class CoffeeStory(Base):
    """Coffee Story table model"""
    __tablename__ = "coffee_stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    thumbnail_url = Column(String(1024), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<CoffeeStory(id={self.id}, title={self.title})>"
