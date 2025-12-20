from fastapi import APIRouter, HTTPException
from app.api.models.salesforecast_model import (
    SalesForecastRequest,
    SalesForecastResponse
)
from app.services.forecasting_service import forecast_sales

router = APIRouter(
    prefix="/analytics",
    tags=["Sales Forecasting"]
)

@router.post("/forecastSales", response_model=SalesForecastResponse)
async def forecast_sales_endpoint(request: SalesForecastRequest):
    """
    ARIMA-based sales forecasting
    
    Receives historical sales data and predicts future sales
    """
    try:
        forecast = forecast_sales(request)
        return forecast
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Forecasting failed: {str(e)}"
        )

# just for testing
@router.get("/forecast/health")
async def forecast_health():
    """Health check for forecasting service"""
    return {
        "service": "sales_forecasting",
        "status": "operational"
    }