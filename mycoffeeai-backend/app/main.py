"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import blends, health, score_scales, taste_histories

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description="MyCoffee.AI Backend API",
    version="0.1.0",
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
app.include_router(blends.router, prefix="/api/blends", tags=["blends"])
app.include_router(score_scales.router, prefix="/api/score-scales", tags=["score-scales"])
app.include_router(taste_histories.router, prefix="/api/taste-histories", tags=["taste-histories"])

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
