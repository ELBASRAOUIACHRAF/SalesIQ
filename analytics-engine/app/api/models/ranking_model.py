from pydantic import BaseModel
from typing import List
from datetime import date

class DailySales(BaseModel):
    date: date
    sales: float

class ProductSalesInput(BaseModel):
    productId: int
    productName: str
    historicalSales: List[DailySales]
    daysAhead: int

class RankingPredictionRequest(BaseModel):
    targetProductId: int
    daysAhead: int
    allProducts: List[ProductSalesInput]

class RankingPredictionResponse(BaseModel):
    productId: int
    productName: str
    currentRank: int
    predictedRank: int
    currentSales: float
    predictedSales: float
    trend: str
    daysAhead: int