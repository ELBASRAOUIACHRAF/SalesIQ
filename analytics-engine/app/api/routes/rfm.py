from fastapi import APIRouter
from typing import List
from app.api.models.rfm import (
    RFMRequest,
    RFMSegment
)
from app.services.rfm_service import rfm_service

router = APIRouter(
    prefix="/analytics",
    tags=["RFM Analysis"]
)

@router.post(
    "/rfm",
    response_model=List[RFMSegment]
)
async def perform_rfm_analysis(
    payload: List[RFMRequest]
):
    """
    Perform RFM (Recency, Frequency, Monetary) analysis on customer data.
    Returns a list of RFM segments directly (not wrapped in a response object).
    """
    print(f"🔥 RFM ENDPOINT CALLED - Received {len(payload)} customers")
    results = rfm_service.perform_rfm_analysis(payload)
    print(f"✅ RFM Analysis complete - Returning {len(results)} segments")
    return results
