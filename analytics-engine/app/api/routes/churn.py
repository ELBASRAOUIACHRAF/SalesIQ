from fastapi import APIRouter, HTTPException
from typing import List
from app.api.models.churn_model import ChurnInputData, ChurnPredictionResponse
from app.services.churn_service import predict_churn

router = APIRouter(
    prefix="/analytics",
    tags=["Churn Prediction"]
)

@router.post("/predict-churn", response_model=List[ChurnPredictionResponse])
def predict_churn_endpoint(customers: List[ChurnInputData]):
    try:
        return predict_churn(customers)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Churn prediction failed: {str(e)}"
        )