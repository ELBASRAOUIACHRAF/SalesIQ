from fastapi import APIRouter, HTTPException
from typing import List
from app.api.models.bestseller_model import BestSellerInput, PotentialBestSellerResponse
from app.services.bestseller_service import identify_bestsellers

router = APIRouter(
    prefix="/analytics",
    tags=["Best Seller Identification"]
)

@router.post("/identify-bestsellers", response_model=List[PotentialBestSellerResponse])
def identify_bestsellers_endpoint(products: List[BestSellerInput]):
    try:
        return identify_bestsellers(products)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Best seller identification failed: {str(e)}"
        )