"""Order Item model"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class OrderItem(Base):
    """Order Item table model"""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    blend_id = Column(Integer, ForeignKey("blends.id", ondelete="SET NULL"), nullable=True, index=True)
    collection_id = Column(Integer, ForeignKey("user_collections.id", ondelete="SET NULL"), nullable=True, index=True)
    collection_name = Column(String(128), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=True)
    options = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="items")
    blend = relationship("Blend")
    collection = relationship("UserCollection")

    def __repr__(self):
        return f"<OrderItem(id={self.id}, order_id={self.order_id})>"
