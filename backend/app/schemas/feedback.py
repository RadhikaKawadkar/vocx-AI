import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class TextAnalyzeRequest(BaseModel):
    text: str
    source: Optional[str] = "Manual Sandbox"
    location_state: Optional[str] = "Maharashtra"


class TextAnalyzeResponse(BaseModel):
    original_text: str
    english_translation: str
    detected_language: str
    language_name: str
    sentiment: str
    sentiment_score: float
    confidence_score: float
    aspect_category: str
    urgency_level: str
    tags: List[str]


class FeedbackCreate(BaseModel):
    original_text: str
    source: str = "Webhook"
    customer_id: Optional[str] = None
    location_state: Optional[str] = "Maharashtra"
    metadata_info: Optional[Dict[str, Any]] = None
    batch_id: Optional[str] = None


class BatchFeedbackCreate(BaseModel):
    items: List[FeedbackCreate]
    source: Optional[str] = "Batch_Import"
    skip_duplicates: bool = True


class FeedbackOut(BaseModel):
    id: int
    customer_id: Optional[str] = None
    source: str
    original_text: str
    english_translation: Optional[str] = None
    detected_language: str
    language_name: str
    sentiment: str
    sentiment_score: float
    confidence_score: float
    aspect_category: str
    urgency_level: str
    is_escalated: bool
    location_state: Optional[str] = None
    tags: List[str] = []
    content_hash: Optional[str] = None
    batch_id: Optional[str] = None
    is_duplicate: bool = False
    duplicate_of_id: Optional[int] = None
    metadata_info: Dict[str, Any] = {}
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackFilterParams(BaseModel):
    source: Optional[str] = None
    language: Optional[str] = None
    sentiment: Optional[str] = None
    aspect: Optional[str] = None
    urgency: Optional[str] = None
    is_duplicate: Optional[bool] = None
    batch_id: Optional[str] = None
    search: Optional[str] = None
    page: int = 1
    limit: int = 50


class FeedbackListResponse(BaseModel):
    items: List[FeedbackOut]
    total: int
    page: int
    limit: int
    pages: int


class IngestionSummaryResponse(BaseModel):
    batch_id: str
    source: str
    total_records: int
    imported_count: int
    duplicates_skipped: int
    errors_count: int
    error_details: List[str] = []
    created_at: str


class IngestionStatsResponse(BaseModel):
    total_ingested: int
    by_source: Dict[str, int]
    by_batch: Dict[str, int]
    duplicates_flagged_count: int
