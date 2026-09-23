from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.feedback import (
    FeedbackCreate, BatchFeedbackCreate, FeedbackOut, FeedbackListResponse, FeedbackFilterParams,
    IngestionSummaryResponse, IngestionStatsResponse
)
from app.services.feedback_service import feedback_service
from app.services.ingestion_service import ingestion_service
from app.utils.sample_seeder import seed_database

router = APIRouter()


@router.post("/", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(feedback_in: FeedbackCreate, db: Session = Depends(get_db)):
    """Ingest a single customer feedback item into VOCX AI with duplicate checking."""
    return ingestion_service.ingest_single(db, feedback_in)


@router.post("/manual", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def manual_ingest(feedback_in: FeedbackCreate, db: Session = Depends(get_db)):
    """Manual feedback entry endpoint."""
    return ingestion_service.ingest_single(db, feedback_in)


@router.post("/upload/csv", response_model=IngestionSummaryResponse)
async def upload_csv(
    file: UploadFile = File(...),
    source: str = Form("CSV_Import"),
    skip_duplicates: bool = Form(True),
    db: Session = Depends(get_db)
):
    """Upload and parse CSV dataset file for batch ingestion."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")
    
    content = await file.read()
    return ingestion_service.ingest_csv(db, content, file.filename, source, skip_duplicates)


@router.post("/upload/json", response_model=IngestionSummaryResponse)
async def upload_json(
    file: UploadFile = File(...),
    source: str = Form("JSON_Import"),
    skip_duplicates: bool = Form(True),
    db: Session = Depends(get_db)
):
    """Upload and parse JSON dataset file for batch ingestion."""
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .json file.")
    
    content = await file.read()
    return ingestion_service.ingest_json(db, content, file.filename, source, skip_duplicates)


@router.post("/batch-import", response_model=IngestionSummaryResponse)
def batch_import_json(batch_in: BatchFeedbackCreate, db: Session = Depends(get_db)):
    """Batch import structured feedback JSON items."""
    imported_count = 0
    duplicates_skipped = 0

    for item in batch_in.items:
        c_hash = ingestion_service.compute_content_hash(item.original_text)
        is_dup, _ = ingestion_service.check_duplicate(db, c_hash)
        if is_dup and batch_in.skip_duplicates:
            duplicates_skipped += 1
            continue
        ingestion_service.ingest_single(db, item)
        imported_count += 1

    return IngestionSummaryResponse(
        batch_id=f"batch-{imported_count}",
        source=batch_in.source or "Batch_Import",
        total_records=len(batch_in.items),
        imported_count=imported_count,
        duplicates_skipped=duplicates_skipped,
        errors_count=0,
        error_details=[],
        created_at=feedback_service.get_by_id.__name__
    )


@router.get("/ingestion/stats", response_model=IngestionStatsResponse)
def get_ingestion_stats(db: Session = Depends(get_db)):
    """Get ingestion statistics across sources, batches, and duplicate counts."""
    return ingestion_service.get_ingestion_stats(db)


@router.get("/", response_model=FeedbackListResponse)
def list_feedback(
    source: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    aspect: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    is_duplicate: Optional[bool] = Query(None),
    batch_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List customer feedback with filtering, pagination, and multi-lingual text search."""
    params = FeedbackFilterParams(
        source=source,
        language=language,
        sentiment=sentiment,
        aspect=aspect,
        urgency=urgency,
        is_duplicate=is_duplicate,
        batch_id=batch_id,
        search=search,
        page=page,
        limit=limit
    )
    items, total, pages = feedback_service.list_feedback(db, params)
    return FeedbackListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )


@router.get("/{feedback_id}", response_model=FeedbackOut)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Get single feedback item by ID."""
    item = feedback_service.get_by_id(db, feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback item not found")
    return item


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Delete feedback item."""
    success = feedback_service.delete_feedback(db, feedback_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback item not found")
    return None


@router.post("/seed/sample-data", status_code=status.HTTP_200_OK)
def seed_sample_data(db: Session = Depends(get_db)):
    """Seed sample regional Indian feedback dataset for testing and demonstration."""
    seed_database(db)
    return {"message": "Sample regional dataset seeded successfully into database."}
