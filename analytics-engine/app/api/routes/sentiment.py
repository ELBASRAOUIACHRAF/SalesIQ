from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

router = APIRouter()


class ReviewDto(BaseModel):
    id: Optional[int] = None
    rating: float
    comment: Optional[str] = None
    reviewDate: Optional[str] = None


class ProductSentimentRequest(BaseModel):
    productId: int
    productReviews: List[ReviewDto] = []


class SentimentAnalysisRequest(BaseModel):
    products: List[ProductSentimentRequest]


class SentimentStats(BaseModel):
    positive: int = 0
    negative: int = 0
    neutral: int = 0


class ReviewsSentimentAnalysisDto(BaseModel):
    productId: int
    totalReviews: int
    positiveCount: int
    neutralCount: int
    negativeCount: int
    overallSentiment: str


@router.post("/analytics/analyze-sentiment", response_model=List[ReviewsSentimentAnalysisDto])
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """
    Analyze sentiment for reviews across multiple products.
    Uses a simple rule-based approach based on ratings.
    """
    try:
        results = []
        
        for product in request.products:
            product_id = product.productId
            reviews = product.productReviews
            
            total_reviews = len(reviews)
            positive_count = 0
            neutral_count = 0
            negative_count = 0
            sentiment_sum = 0.0
            
            for review in reviews:
                rating = review.rating
                
                # Classify based on rating
                if rating >= 4:
                    positive_count += 1
                    sentiment_sum += 1.0
                elif rating >= 3:
                    neutral_count += 1
                    sentiment_sum += 0.0
                else:
                    negative_count += 1
                    sentiment_sum += -1.0
            
            avg_sentiment = sentiment_sum / total_reviews if total_reviews > 0 else 0.0
            
            # Determine overall sentiment label
            if avg_sentiment > 0.3:
                overall_sentiment = "POSITIVE"
            elif avg_sentiment < -0.3:
                overall_sentiment = "NEGATIVE"
            else:
                overall_sentiment = "NEUTRAL"
            
            results.append(ReviewsSentimentAnalysisDto(
                productId=product_id,
                totalReviews=total_reviews,
                positiveCount=positive_count,
                neutralCount=neutral_count,
                negativeCount=negative_count,
                overallSentiment=overall_sentiment
            ))
        
        return results
        
    except Exception as e:
        logging.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
