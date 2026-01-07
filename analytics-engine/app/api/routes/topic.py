from fastapi import APIRouter, HTTPException
from typing import List
from app.api.models.topic_model import TopicExtractionRequest, TopicResponse
from app.services.topic_service import extract_topics

router = APIRouter(
    prefix="/analytics",
    tags=["Topic Modeling"]
)

@router.post("/extract-topics", response_model=List[TopicResponse])
def extract_topics_endpoint(request: TopicExtractionRequest):
    try:
        return extract_topics(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Topic extraction failed: {str(e)}"
        )