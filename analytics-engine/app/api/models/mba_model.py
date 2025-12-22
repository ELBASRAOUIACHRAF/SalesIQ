from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# DTOs
class MarketBasketRequest(BaseModel):
    minSupport: float
    minConfidence: float
    transactions: List[Dict[int, int]]

class AssociationRule(BaseModel):
    productA: str
    productB: str
    support: float
    confidence: float