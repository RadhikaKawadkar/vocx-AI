import csv
import json
import io
import hashlib
import uuid
import datetime
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.feedback import FeedbackItem
from app.schemas.feedback import FeedbackCreate, IngestionSummaryResponse, IngestionStatsResponse
from app.services.nlp_engine import nlp_engine
from app.services.automation_service import automation_service
from app.utils.logger import logger


class IngestionService:
    @staticmethod
    def compute_content_hash(text: str) -> str:
        """Compute SHA-256 hash of normalized text for duplicate detection."""
        normalized = " ".join(text.strip().lower().split())
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @staticmethod
    def check_duplicate(db: Session, content_hash: str) -> Tuple[bool, Optional[int]]:
        """Check if feedback content hash already exists in database."""
        existing = db.query(FeedbackItem).filter(FeedbackItem.content_hash == content_hash).first()
        if existing:
            return True, existing.id
        return False, None

    @staticmethod
    def ingest_single(db: Session, feedback_in: FeedbackCreate) -> FeedbackItem:
        """Ingest a single feedback entry with duplicate detection and NLP processing."""
        content_hash = IngestionService.compute_content_hash(feedback_in.original_text)
        is_dup, dup_of_id = IngestionService.check_duplicate(db, content_hash)

        nlp_result = nlp_engine.process_feedback(feedback_in.original_text, source=feedback_in.source)

        db_item = FeedbackItem(
            customer_id=feedback_in.customer_id,
            source=feedback_in.source,
            original_text=feedback_in.original_text,
            english_translation=nlp_result["english_translation"],
            detected_language=nlp_result["detected_language"],
            language_name=nlp_result["language_name"],
            sentiment=nlp_result["sentiment"],
            sentiment_score=nlp_result["sentiment_score"],
            confidence_score=nlp_result["confidence_score"],
            aspect_category=nlp_result["aspect_category"],
            urgency_level=nlp_result["urgency_level"],
            is_escalated=(nlp_result["urgency_level"] == "Critical"),
            location_state=feedback_in.location_state or "Maharashtra",
            tags=nlp_result["tags"],
            content_hash=content_hash,
            batch_id=feedback_in.batch_id or f"manual-{uuid.uuid4().hex[:8]}",
            is_duplicate=is_dup,
            duplicate_of_id=dup_of_id,
            metadata_info=feedback_in.metadata_info or {}
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # Trigger automation rules if not a skipped duplicate
        if not is_dup:
            automation_service.evaluate_and_trigger(db, db_item)

        return db_item

    @staticmethod
    def ingest_csv(
        db: Session,
        csv_bytes: bytes,
        filename: str,
        source: str = "CSV_Import",
        skip_duplicates: bool = True
    ) -> IngestionSummaryResponse:
        """Process CSV file upload with validation, batch tracking, and duplicate detection."""
        batch_id = f"csv-{uuid.uuid4().hex[:8]}"
        imported_count = 0
        duplicates_skipped = 0
        errors: List[str] = []

        try:
            content_str = csv_bytes.decode('utf-8-sig', errors='replace')
            reader = csv.DictReader(io.StringIO(content_str))
            
            if not reader.fieldnames:
                return IngestionSummaryResponse(
                    batch_id=batch_id,
                    source=source,
                    total_records=0,
                    imported_count=0,
                    duplicates_skipped=0,
                    errors_count=1,
                    error_details=["CSV file is empty or missing headers"],
                    created_at=datetime.datetime.utcnow().isoformat()
                )

            # Detect text column name
            text_candidates = ["text", "original_text", "feedback", "content", "review", "comment", "message"]
            text_col = next((col for col in reader.fieldnames if col.lower().strip() in text_candidates), None)

            if not text_col:
                text_col = reader.fieldnames[0]  # Fallback to first column

            customer_col = next((col for col in reader.fieldnames if "customer" in col.lower() or "user" in col.lower() or "id" in col.lower()), None)
            state_col = next((col for col in reader.fieldnames if "state" in col.lower() or "location" in col.lower() or "region" in col.lower()), None)
            source_col = next((col for col in reader.fieldnames if "source" in col.lower() or "channel" in col.lower()), None)

            rows = list(reader)
            total_records = len(rows)

            for idx, row in enumerate(rows, start=1):
                raw_text = row.get(text_col, "").strip()
                if not raw_text:
                    errors.append(f"Row #{idx}: Empty text content skipped")
                    continue

                c_hash = IngestionService.compute_content_hash(raw_text)
                is_dup, dup_of_id = IngestionService.check_duplicate(db, c_hash)

                if is_dup and skip_duplicates:
                    duplicates_skipped += 1
                    continue

                cust_id = row.get(customer_col) if customer_col else None
                loc_state = row.get(state_col) if state_col else "Maharashtra"
                row_source = row.get(source_col) if source_col else source

                meta = {k: v for k, v in row.items() if k not in [text_col, customer_col, state_col, source_col]}
                meta["filename"] = filename

                nlp_res = nlp_engine.process_feedback(raw_text, source=row_source)

                db_item = FeedbackItem(
                    customer_id=cust_id,
                    source=row_source,
                    original_text=raw_text,
                    english_translation=nlp_res["english_translation"],
                    detected_language=nlp_res["detected_language"],
                    language_name=nlp_res["language_name"],
                    sentiment=nlp_res["sentiment"],
                    sentiment_score=nlp_res["sentiment_score"],
                    confidence_score=nlp_res["confidence_score"],
                    aspect_category=nlp_res["aspect_category"],
                    urgency_level=nlp_res["urgency_level"],
                    is_escalated=(nlp_res["urgency_level"] == "Critical"),
                    location_state=loc_state,
                    tags=nlp_res["tags"],
                    content_hash=c_hash,
                    batch_id=batch_id,
                    is_duplicate=is_dup,
                    duplicate_of_id=dup_of_id,
                    metadata_info=meta
                )
                db.add(db_item)
                imported_count += 1

                if not is_dup:
                    automation_service.evaluate_and_trigger(db, db_item)

            db.commit()

            return IngestionSummaryResponse(
                batch_id=batch_id,
                source=source,
                total_records=total_records,
                imported_count=imported_count,
                duplicates_skipped=duplicates_skipped,
                errors_count=len(errors),
                error_details=errors[:10],
                created_at=datetime.datetime.utcnow().isoformat()
            )

        except Exception as e:
            logger.error(f"Error parsing CSV file {filename}: {e}")
            return IngestionSummaryResponse(
                batch_id=batch_id,
                source=source,
                total_records=0,
                imported_count=0,
                duplicates_skipped=0,
                errors_count=1,
                error_details=[f"CSV Parsing Error: {str(e)}"],
                created_at=datetime.datetime.utcnow().isoformat()
            )

    @staticmethod
    def ingest_json(
        db: Session,
        json_bytes: bytes,
        filename: str,
        source: str = "JSON_Import",
        skip_duplicates: bool = True
    ) -> IngestionSummaryResponse:
        """Process JSON array file upload with validation and NLP processing."""
        batch_id = f"json-{uuid.uuid4().hex[:8]}"
        imported_count = 0
        duplicates_skipped = 0
        errors: List[str] = []

        try:
            data = json.loads(json_bytes.decode('utf-8'))
            if isinstance(data, dict):
                items = data.get("items", data.get("feedbacks", [data]))
            elif isinstance(data, list):
                items = data
            else:
                items = []

            total_records = len(items)

            for idx, item in enumerate(items, start=1):
                if not isinstance(item, dict):
                    errors.append(f"Item #{idx}: Invalid JSON object structure")
                    continue

                raw_text = (
                    item.get("original_text") or item.get("text") or item.get("content") or item.get("feedback") or ""
                ).strip()

                if not raw_text:
                    errors.append(f"Item #{idx}: Missing text field")
                    continue

                c_hash = IngestionService.compute_content_hash(raw_text)
                is_dup, dup_of_id = IngestionService.check_duplicate(db, c_hash)

                if is_dup and skip_duplicates:
                    duplicates_skipped += 1
                    continue

                row_source = item.get("source", source)
                cust_id = item.get("customer_id")
                loc_state = item.get("location_state", "Maharashtra")

                meta = {k: v for k, v in item.items() if k not in ["original_text", "text", "content", "feedback", "source", "customer_id", "location_state"]}
                meta["filename"] = filename

                nlp_res = nlp_engine.process_feedback(raw_text, source=row_source)

                db_item = FeedbackItem(
                    customer_id=cust_id,
                    source=row_source,
                    original_text=raw_text,
                    english_translation=nlp_res["english_translation"],
                    detected_language=nlp_res["detected_language"],
                    language_name=nlp_res["language_name"],
                    sentiment=nlp_res["sentiment"],
                    sentiment_score=nlp_res["sentiment_score"],
                    confidence_score=nlp_res["confidence_score"],
                    aspect_category=nlp_res["aspect_category"],
                    urgency_level=nlp_res["urgency_level"],
                    is_escalated=(nlp_res["urgency_level"] == "Critical"),
                    location_state=loc_state,
                    tags=nlp_res["tags"],
                    content_hash=c_hash,
                    batch_id=batch_id,
                    is_duplicate=is_dup,
                    duplicate_of_id=dup_of_id,
                    metadata_info=meta
                )
                db.add(db_item)
                imported_count += 1

                if not is_dup:
                    automation_service.evaluate_and_trigger(db, db_item)

            db.commit()

            return IngestionSummaryResponse(
                batch_id=batch_id,
                source=source,
                total_records=total_records,
                imported_count=imported_count,
                duplicates_skipped=duplicates_skipped,
                errors_count=len(errors),
                error_details=errors[:10],
                created_at=datetime.datetime.utcnow().isoformat()
            )

        except Exception as e:
            logger.error(f"Error parsing JSON file {filename}: {e}")
            return IngestionSummaryResponse(
                batch_id=batch_id,
                source=source,
                total_records=0,
                imported_count=0,
                duplicates_skipped=0,
                errors_count=1,
                error_details=[f"JSON Parsing Error: {str(e)}"],
                created_at=datetime.datetime.utcnow().isoformat()
            )

    @staticmethod
    def get_ingestion_stats(db: Session) -> IngestionStatsResponse:
        """Calculate ingestion statistics by source, batch, and duplicates."""
        total = db.query(FeedbackItem).count()
        dup_count = db.query(FeedbackItem).filter(FeedbackItem.is_duplicate == True).count()

        source_counts = (
            db.query(FeedbackItem.source, func.count(FeedbackItem.id))
            .group_by(FeedbackItem.source)
            .all()
        )
        by_source = {s: c for s, c in source_counts}

        batch_counts = (
            db.query(FeedbackItem.batch_id, func.count(FeedbackItem.id))
            .filter(FeedbackItem.batch_id != None)
            .group_by(FeedbackItem.batch_id)
            .limit(10)
            .all()
        )
        by_batch = {b: c for b, c in batch_counts if b}

        return IngestionStatsResponse(
            total_ingested=total,
            by_source=by_source,
            by_batch=by_batch,
            duplicates_flagged_count=dup_count
        )


ingestion_service = IngestionService()
