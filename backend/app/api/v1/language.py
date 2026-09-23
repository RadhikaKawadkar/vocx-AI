from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.language_service import language_service

router = APIRouter()


class LanguageDetectRequest(BaseModel):
    text: str


class BulkLanguageDetectRequest(BaseModel):
    texts: List[str]


class LanguageDetectResponse(BaseModel):
    language_code: str
    language_name: str
    confidence: float
    script: str
    is_code_mixed: bool
    distribution: Dict[str, float]


@router.post("/detect", response_model=LanguageDetectResponse)
def detect_language(request: LanguageDetectRequest):
    """Real-time FastText language detection endpoint."""
    return language_service.detect_single(request.text)


@router.post("/bulk-detect", response_model=List[LanguageDetectResponse])
def bulk_detect_language(request: BulkLanguageDetectRequest):
    """Bulk text FastText language detection."""
    return language_service.detect_bulk(request.texts)


@router.post("/reclassify-db")
def reclassify_database(db: Session = Depends(get_db)):
    """Reclassify all feedback items stored in database with latest language model."""
    return language_service.reclassify_database_records(db)


@router.get("/stats")
def get_language_stats(db: Session = Depends(get_db)):
    """Get language distribution and model confidence statistics."""
    return language_service.get_language_statistics(db)
