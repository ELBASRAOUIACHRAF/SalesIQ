from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import all routers
from app.api.routes import (
    sales_forecast,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Microservice for analytics and machine learning",
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(sales_forecast.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": settings.APP_NAME,
        "creators": ["AMEUR Abdelkarim", "EL BASRAOUI Achraf"],
        "version": settings.APP_VERSION,
        "status": "running",
        "endpoints": {
            "sales_forecasting": "/api/v1/sales",
        }
    }

# just for testing ajemi
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "sales_forecasting": "operational",
            "customer_segmentation": "pending",
            "churn_prediction": "pending",
            "recommendations": "pending"
        }
    }