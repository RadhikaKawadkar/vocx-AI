from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
import math
from app.models.feedback import FeedbackItem
from app.schemas.feedback import FeedbackCreate, FeedbackFilterParams
from app.services.nlp_engine import nlp_engine
from app.services.automation_service import automation_service


class FeedbackService:
    @staticmethod
    def create_feedback(db: Session, feedback_in: FeedbackCreate) -> FeedbackItem:
        # Run NLP engine on input text
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
            metadata_info=feedback_in.metadata_info or {}
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # Evaluate automation rules asynchronously/immediately
        automation_service.evaluate_and_trigger(db, db_item)

        return db_item

    @staticmethod
    def list_feedback(db: Session, params: FeedbackFilterParams) -> Tuple[List[FeedbackItem], int, int]:
        query = db.query(FeedbackItem)

        if params.source:
            query = query.filter(FeedbackItem.source == params.source)
        if params.language:
            query = query.filter(FeedbackItem.detected_language == params.language)
        if params.sentiment:
            query = query.filter(FeedbackItem.sentiment == params.sentiment)
        if params.aspect:
            query = query.filter(FeedbackItem.aspect_category == params.aspect)
        if params.urgency:
            query = query.filter(FeedbackItem.urgency_level == params.urgency)
        if params.search:
            search_pattern = f"%{params.search}%"
            query = query.filter(
                or_(
                    FeedbackItem.original_text.ilike(search_pattern),
                    FeedbackItem.english_translation.ilike(search_pattern),
                    FeedbackItem.customer_id.ilike(search_pattern)
                )
            )

        total = query.count()
        pages = math.ceil(total / params.limit) if params.limit > 0 else 1
        offset = (params.page - 1) * params.limit

        items = query.order_by(desc(FeedbackItem.created_at)).offset(offset).limit(params.limit).all()
        return items, total, pages

    @staticmethod
    def get_by_id(db: Session, feedback_id: int) -> Optional[FeedbackItem]:
        return db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()

    @staticmethod
    def delete_feedback(db: Session, feedback_id: int) -> bool:
        item = db.query(FeedbackItem).filter(FeedbackItem.id == feedback_id).first()
        if item:
            db.delete(item)
            db.commit()
            return True
        return False


feedback_service = FeedbackService()
