from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.sentiment_service import sentiment_service

router = APIRouter()


class SentimentPredictRequest(BaseModel):
    text: str


class SentimentPredictResponse(BaseModel):
    text: str
    sentiment: str
    sentiment_score: float
    confidence_score: float


@router.post("/predict", response_model=SentimentPredictResponse)
def predict_sentiment(request: SentimentPredictRequest):
    """Real-time sentiment prediction for regional customer feedback."""
    return sentiment_service.predict_sentiment(request.text)


@router.post("/bulk-analyze")
def bulk_analyze_sentiment(db: Session = Depends(get_db)):
    """Bulk recalculate sentiment scores across all stored feedback records."""
    return sentiment_service.bulk_analyze_database(db)


@router.get("/stats")
def get_sentiment_stats(db: Session = Depends(get_db)):
    """Get overall sentiment counts, percentages, NPS score, and confidence ratios."""
    return sentiment_service.get_sentiment_statistics(db)


@router.get("/trends")
def get_sentiment_trends(db: Session = Depends(get_db)):
    """Get daily time-series sentiment trend data."""
    return sentiment_service.get_sentiment_trends(db)
