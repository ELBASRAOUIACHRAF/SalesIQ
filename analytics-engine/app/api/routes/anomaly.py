from fastapi import APIRouter, HTTPException
from typing import List
from app.api.models.anomaly_model import AnomalyDetectionRequest, AnomalyDetectionResponse
from app.services.anomaly_service import detect_anomalies

router = APIRouter(
    prefix="/analytics",
    tags=["Anomaly Detection"]
)

@router.post("/detect-anomalies", response_model=List[AnomalyDetectionResponse])
def detect_anomalies_endpoint(request: AnomalyDetectionRequest):
    try:
        return detect_anomalies(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly detection failed: {str(e)}"
        )