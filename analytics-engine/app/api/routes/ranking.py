from fastapi import APIRouter, HTTPException
from app.api.models.ranking_model import RankingPredictionRequest, RankingPredictionResponse
from app.services.ranking_service import predict_ranking

router = APIRouter(
    prefix="/analytics",
    tags=["Ranking Prediction"]
)

@router.post("/predict-ranking", response_model=RankingPredictionResponse)
def predict_ranking_endpoint(request: RankingPredictionRequest):
    try:
        return predict_ranking(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ranking prediction failed: {str(e)}"
        )