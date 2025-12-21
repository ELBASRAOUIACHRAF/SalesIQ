from pydantic import BaseModel
from typing import List

class RecoRequest(BaseModel):
    product_id: int

class RecoResponse(BaseModel):
    product_id: int
    recommendations: List[int]
    