from pydantic import BaseModel
from typing import List
from datetime import date

class ForecastPoint(BaseModel):
    date: date
    predictedSales: float

class SalesForecastRequest(BaseModel):
    model: str
    forecast: List[ForecastPoint]
    daysAhead: int

class SalesForecastResponse(BaseModel):
    model: str
    forecast: List[ForecastPoint]

