from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import datetime
from app.models.feedback import FeedbackItem
from app.services.nlp_engine import nlp_engine
from app.utils.logger import logger


class SentimentService:
    @staticmethod
    def predict_sentiment(text: str) -> Dict[str, Any]:
        """Predict sentiment label (Positive, Negative, Neutral), continuous score, and confidence."""
        sentiment_label, score, confidence = nlp_engine.analyze_sentiment(text)
        return {
            "text": text,
            "sentiment": sentiment_label,
            "sentiment_score": score,
            "confidence_score": confidence
        }

    @staticmethod
    def bulk_analyze_database(db: Session) -> Dict[str, Any]:
        """Recalculate and update sentiment predictions across all database records."""
        items = db.query(FeedbackItem).all()
        updated = 0

        for item in items:
            label, score, conf = nlp_engine.analyze_sentiment(item.original_text)
            item.sentiment = label
            item.sentiment_score = score
            item.confidence_score = conf
            updated += 1

        db.commit()
        return {"processed_records": updated, "status": "completed"}

    @staticmethod
    def get_sentiment_statistics(db: Session) -> Dict[str, Any]:
        """Fetch overall sentiment breakdown, NPS score, and confidence averages."""
        total = db.query(FeedbackItem).count()
        if total == 0:
            return {
                "total_records": 0,
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "positive_percentage": 0.0,
                "negative_percentage": 0.0,
                "neutral_percentage": 0.0,
                "net_promoter_score": 0.0,
                "avg_confidence": 0.0
            }

        pos_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Positive").count()
        neg_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Negative").count()
        neu_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Neutral").count()

        pos_pct = round((pos_count / total) * 100, 1)
        neg_pct = round((neg_count / total) * 100, 1)
        neu_pct = round((neu_count / total) * 100, 1)
        nps = round(pos_pct - neg_pct, 1)

        avg_conf = db.query(func.avg(FeedbackItem.confidence_score)).scalar() or 0.85

        return {
            "total_records": total,
            "positive_count": pos_count,
            "negative_count": neg_count,
            "neutral_count": neu_count,
            "positive_percentage": pos_pct,
            "negative_percentage": neg_pct,
            "neutral_percentage": neu_pct,
            "net_promoter_score": nps,
            "avg_confidence": round(avg_conf, 2)
        }

    @staticmethod
    def get_sentiment_trends(db: Session) -> List[Dict[str, Any]]:
        """Fetch time-series sentiment trends grouped by day."""
        items = db.query(FeedbackItem).order_by(FeedbackItem.created_at.asc()).all()
        trend_map: Dict[str, Dict[str, int]] = {}

        for item in items:
            dt_str = item.created_at.strftime("%Y-%m-%d")
            if dt_str not in trend_map:
                trend_map[dt_str] = {"positive": 0, "neutral": 0, "negative": 0, "total": 0}
            
            sent_key = item.sentiment.lower()
            if sent_key in trend_map[dt_str]:
                trend_map[dt_str][sent_key] += 1
            trend_map[dt_str]["total"] += 1

        return [
            {
                "date": dt,
                "positive": data["positive"],
                "neutral": data["neutral"],
                "negative": data["negative"],
                "total": data["total"]
            }
            for dt, data in sorted(trend_map.items())
        ]


sentiment_service = SentimentService()
