from fastapi import APIRouter
from typing import List
from app.api.models.rfm import (
    RFMRequest,
    RFMResponse
)
from app.services.rfm_service import rfm_service

router = APIRouter(
    prefix="/analytics",
    tags=["RFM Analysis"]
)

@router.post(
    "/rfm",
    response_model=RFMResponse
)
async def perform_rfm_analysis(
    payload: List[RFMRequest]
):

    results = rfm_service.perform_rfm_analysis(payload)

    return RFMResponse(results=results)
