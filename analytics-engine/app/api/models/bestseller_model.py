from pydantic import BaseModel
from typing import List
from datetime import date

class DailySales(BaseModel):
    date: date
    sales: float

class BestSellerInput(BaseModel):
    productId: int
    productName: str
    categoryName: str
    totalReviews: int
    avgRating: float
    daysOnMarket: int
    recentSales: List[DailySales]

class PotentialBestSellerResponse(BaseModel):
    productId: int
    productName: str
    categoryName: str
    currentSales: float
    salesGrowthRate: float
    potentialScore: float
    potentialLevel: str
    totalReviews: int
    avgRating: float
    daysOnMarket: int