from fastapi import APIRouter, HTTPException
from typing import List
from app.api.models.stockout_model import StockoutInput, StockoutPredictionResponse
from app.services.stockout_service import predict_stockouts

router = APIRouter(
    prefix="/analytics",
    tags=["Stockout Prediction"]
)

@router.post("/predict-stockouts", response_model=List[StockoutPredictionResponse])
def predict_stockouts_endpoint(products: List[StockoutInput]):
    try:
        return predict_stockouts(products)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Stockout prediction failed: {str(e)}"
        )