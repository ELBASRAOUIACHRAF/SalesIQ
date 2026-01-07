from pydantic import BaseModel
from typing import List
from datetime import date


class RFMRequest(BaseModel):
    customerId: int
    lastPurchaseDate: date
    purchaseCount: int
    totalAmount: float


class RFMSegment(BaseModel):
    customerId: int

    recency: int
    frequency: int
    monetary: float

    rScore: int
    fScore: int
    mScore: int

    segment: str


class RFMResponse(BaseModel):
    results: List[RFMSegment]
