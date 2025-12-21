from fastapi import APIRouter, HTTPException
from app.api.models.recommendation_model import RecoRequest, RecoResponse
from app.services.recommendation_service import reco_service

router = APIRouter()

@router.post("/predict", response_model=RecoResponse)
async def predict_recommendations(payload: RecoRequest):
    
    recos = reco_service.get_recommendations(payload.product_id)
    
    if not recos:
        
        return RecoResponse(product_id=payload.product_id, recommendations=[])
    
    return RecoResponse(product_id=payload.product_id, recommendations=recos)