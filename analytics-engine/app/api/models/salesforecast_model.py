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
    daysAhead : int
    forecast: List[ForecastPoint]

class CustomerData(BaseModel):
    usersId: int
    totalSales: int
    totalReviews: int
    avgReviewRating: float
    searchCount: int
    totalSpent: float
    avgBasketSpent: float

class SegmentationRequest(BaseModel):
    n_segments: int
    customers: List[CustomerData]

class ProductReviews(BaseModel):
    productId: int
    productReviews: List[str]  

class SentimentAnalysisRequest(BaseModel):
    products: List[ProductReviews]

class SentimentStats(BaseModel):
    positive: int
    negative: int
    neutral: int

class ProductSentimentResponse(BaseModel):
    productId: int
    sentimentStats: SentimentStats