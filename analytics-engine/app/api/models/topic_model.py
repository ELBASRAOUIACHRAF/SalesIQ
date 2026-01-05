from pydantic import BaseModel
from typing import List

class ReviewText(BaseModel):
    reviewId: int
    comment: str
    rating: float

class TopicExtractionRequest(BaseModel):
    productId: int
    productName: str
    reviews: List[ReviewText]
    numTopics: int = 5

class TopicResponse(BaseModel):
    topicId: int
    topicName: str
    keywords: List[str]
    weight: float
    reviewCount: int
    avgSentiment: float
    sentimentLabel: str