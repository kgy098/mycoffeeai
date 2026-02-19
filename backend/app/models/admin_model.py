"""Admin model - admins table (운영자 관리)"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class Admin(Base):
    """admins table: user_id가 관리자 권한을 가진 사용자"""
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    role = Column(String(64), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", backref="admin_record")

    def __repr__(self):
        return f"<Admin(id={self.id}, user_id={self.user_id})>"
