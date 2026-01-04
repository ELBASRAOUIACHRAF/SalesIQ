from pydantic import BaseModel
from typing import List
from datetime import date

class DailySales(BaseModel):
    date: date
    sales: float

class AnomalyDetectionRequest(BaseModel):
    salesData: List[DailySales]
    sensitivityThreshold: float = 2.0

class AnomalyDetectionResponse(BaseModel):
    date: date
    salesValue: float
    expectedValue: float
    deviation: float
    zScore: float
    anomalyType: str
    severity: str
    isAnomaly: bool