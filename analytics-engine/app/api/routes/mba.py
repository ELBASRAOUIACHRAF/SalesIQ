from app.services.mba_service import market_basket_analysis
from fastapi import APIRouter, HTTPException
from app.api.models.mba_model import (
    MarketBasketRequest,
    AssociationRule
)
from typing import List

router = APIRouter(
    prefix="/analytics",
    tags=["Market Basket Analysis"]
)

@router.post("/marketBasketAnalysis", response_model=List[AssociationRule])
def mba_analysis(request: MarketBasketRequest):
    """Market Basket Analysis endpoint placeholder"""
    try:
        mba = market_basket_analysis(request)
        return mba
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Market Basket Analysis failed: {str(e)}"
        )
