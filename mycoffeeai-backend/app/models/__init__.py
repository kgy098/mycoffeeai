"""SQLAlchemy ORM Models"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here to register them with Base
from app.models.user import User
from app.models.blend import Blend
from app.models.taste_history import TasteHistory
from app.models.analysis_result import AnalysisResult
from app.models.subscription import Subscription
from app.models.payment import Payment
from app.models.shipment import Shipment
from app.models.review import Review
from app.models.coupon import Coupon
from app.models.points_ledger import PointsLedger
from app.models.score_scale import ScoreScale

__all__ = [
    "Base",
    "User",
    "Blend",
    "TasteHistory",
    "AnalysisResult",
    "Subscription",
    "Payment",
    "Shipment",
    "Review",
    "Coupon",
    "PointsLedger",
    "ScoreScale",
]
