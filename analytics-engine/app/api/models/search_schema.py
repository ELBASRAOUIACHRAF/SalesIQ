from pydantic import BaseModel
from typing import Optional

class ProductIndex(BaseModel):
    id: int
    name: str
    description: str
    price: float
    mark: Optional[str] = None
    category_name: str 
    image_url: Optional[str] = None

    class Config:
        from_attributes = True