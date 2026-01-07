from pydantic import BaseModel
from typing import List
from datetime import date

class DailySales(BaseModel):
    date: date
    sales: float

class StockoutInput(BaseModel):
    productId: int
    productName: str
    currentStock: int
    recentSales: List[DailySales]
    daysAhead: int

class StockoutPredictionResponse(BaseModel):
    productId: int
    productName: str
    currentStock: int
    avgDailySales: float
    daysUntilStockout: int
    stockoutProbability: float
    riskLevel: str
    predictedDemand: float
    recommendedRestock: int