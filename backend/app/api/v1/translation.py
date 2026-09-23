from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app.services.translation_service import translation_service

router = APIRouter()


class SingleTranslateRequest(BaseModel):
    text: str
    source_language: str = "hi"


class SingleTranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    provider: str
    latency_ms: int
    status: str


class TranslationRecordOut(BaseModel):
    id: int
    feedback_id: int
    source_language: str
    original_text: str
    translated_text: Optional[str] = None
    status: str
    provider: str
    latency_ms: int
    retry_count: int
    error_message: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


@router.post("/translate", response_model=SingleTranslateResponse)
def translate_text(request: SingleTranslateRequest):
    """Real-time translation endpoint for Indic text into English."""
    translated, provider, latency, status_code = translation_service.translate(
        request.text, request.source_language
    )
    return SingleTranslateResponse(
        original_text=request.text,
        translated_text=translated,
        source_language=request.source_language,
        provider=provider,
        latency_ms=latency,
        status=status_code
    )


@router.post("/bulk-translate")
def bulk_translate(limit: int = 100, db: Session = Depends(get_db)):
    """Background bulk translation process for database records."""
    return translation_service.bulk_translate_database(db, limit)


@router.post("/retry-failed")
def retry_failed(db: Session = Depends(get_db)):
    """Retry failed translation records."""
    return translation_service.retry_failed_translations(db)


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get translation throughput, success rate, average latency, and provider stats."""
    return translation_service.get_translation_statistics(db)


@router.get("/history", response_model=List[TranslationRecordOut])
def get_history(limit: int = 50, db: Session = Depends(get_db)):
    """Get translation history audit records."""
    return translation_service.get_history(db, limit)
