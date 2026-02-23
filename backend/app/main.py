"""Main FastAPI application"""
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from app.config import get_settings
from app.database import engine
from app.routes import blends, health, score_scales, taste_histories, auth, banners, recommendations, analysis_results, analytics
from app.routes import collections, points, delivery_addresses, orders, subscriptions, payments, reviews, community, inquiries, user_consents, admin
from app.routes import monthly_coffees, uploads

# [PERF] 등 앱 로그가 journalctl에 보이도록 stdout 핸들러 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
    force=True,
)
# uvicorn 접근 로그 레벨은 그대로 두기 위해
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

settings = get_settings()

logger = logging.getLogger(__name__)


def _apply_schema_migrations():
    """앱 시작 시 누락된 컬럼을 자동으로 추가"""
    migrations = [
        ("orders", "cycle_number", "INTEGER"),
        ("payments", "order_id", "INTEGER"),
    ]
    insp = inspect(engine)
    with engine.begin() as conn:
        for table, column, col_type in migrations:
            existing = [c["name"] for c in insp.get_columns(table)]
            if column not in existing:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                logger.info("Added column %s.%s", table, column)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _apply_schema_migrations()
    yield


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description="MyCoffee.AI Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only - allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(blends.router, prefix="/api/blends", tags=["blends"])
app.include_router(score_scales.router, prefix="/api/score-scales", tags=["score-scales"])
app.include_router(taste_histories.router, prefix="/api/taste-histories", tags=["taste-histories"])
app.include_router(banners.router, prefix="/api/banners", tags=["banners"])
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
app.include_router(analysis_results.router, prefix="/api", tags=["analysis-results"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(collections.router, prefix="/api", tags=["collections"])
app.include_router(points.router, prefix="/api", tags=["points"])
app.include_router(delivery_addresses.router, prefix="/api", tags=["delivery-addresses"])
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(subscriptions.router, prefix="/api", tags=["subscriptions"])
app.include_router(payments.router, prefix="/api", tags=["payments"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(community.router, prefix="/api", tags=["community"])
app.include_router(inquiries.router, prefix="/api", tags=["inquiries"])
app.include_router(user_consents.router, prefix="/api", tags=["user-consents"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(monthly_coffees.router, prefix="/api/monthly-coffees", tags=["monthly-coffees"])
app.include_router(uploads.router, prefix="/api", tags=["uploads"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to MyCoffee.AI API",
        "version": "0.1.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.api_host,
        port=settings.api_port,
    )

