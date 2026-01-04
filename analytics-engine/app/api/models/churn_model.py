from pydantic import BaseModel
from typing import List

class ChurnInputData(BaseModel):
    userId: int
    daysSinceLastPurchase: int
    totalPurchases: int
    totalSpent: float
    avgOrderValue: float
    purchaseFrequency: int

class ChurnPredictionResponse(BaseModel):
    userId: int
    churnProbability: float
    riskLevel: str
    daysSinceLastPurchase: int
    totalPurchases: int
    totalSpent: float