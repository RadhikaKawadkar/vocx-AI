from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.category_service import category_service

router = APIRouter()


class CategoryClassifyRequest(BaseModel):
    text: str
    sentiment: Optional[str] = "Neutral"


class SecondaryCategoryOut(BaseModel):
    category: str
    score: float


class CategoryClassifyResponse(BaseModel):
    primary_category: str
    confidence: float
    secondary_categories: List[SecondaryCategoryOut]


@router.post("/classify", response_model=CategoryClassifyResponse)
def classify_text(request: CategoryClassifyRequest):
    """Classify text into one of 8 XLM-RoBERTa categories."""
    return category_service.classify_text(request.text, request.sentiment or "Neutral")


@router.post("/bulk-classify")
def bulk_classify_db(db: Session = Depends(get_db)):
    """Bulk classify all feedback records in database."""
    return category_service.bulk_classify_database(db)


@router.get("/analytics")
def get_category_analytics(db: Session = Depends(get_db)):
    """Get category distribution analytics and issue breakdown."""
    return category_service.get_category_analytics(db)
