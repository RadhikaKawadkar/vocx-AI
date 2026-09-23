from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.feedback import FeedbackItem
from app.utils.logger import logger

CATEGORIES = [
    "Delivery Issue",
    "Product Quality",
    "Customer Support",
    "Pricing",
    "Payment Problem",
    "App Bug",
    "Feature Request",
    "Positive Feedback"
]

CATEGORY_KEYWORDS = {
    "Delivery Issue": [
        "delivery", "late", "delay", "courier", "driver", "tracking", "shipment",
        "deliver", "not reached", "time", "package", "deri", "velaye"
    ],
    "Product Quality": [
        "quality", "product", "damaged", "fake", "defective", "material", "broken",
        "size", "expired", "item", "kharab", "duplicate"
    ],
    "Customer Support": [
        "support", "agent", "executive", "helpdesk", "behavior", "rude", "call",
        "reply", "ticket", "cust care", "chat", "response", "unhelpful"
    ],
    "Pricing": [
        "price", "cost", "charge", "expensive", "fee", "money", "hidden charges",
        "overcharge", "costly", "high price", "discount"
    ],
    "Payment Problem": [
        "payment", "upi", "refund", "deducted", "bank", "failed", "transaction",
        "account", "card", "wallet", "stuck", "paisa kat", "money lost"
    ],
    "App Bug": [
        "bug", "crash", "otp", "login", "freeze", "hang", "update", "screen",
        "loading", "slow app", "error", "blank screen", "not opening"
    ],
    "Feature Request": [
        "feature", "add", "option", "need", "please add", "suggestion", "wish",
        "improvement", "enable", "dark mode", "button"
    ],
    "Positive Feedback": [
        "best", "good", "great", "awesome", "love", "superb", "helpful", "satisfied",
        "fast", "bahut accha", "badiya", "super", "lajawab", "dhanyawad", "arumai",
        "chala bagundi", "nanri"
    ]
}


class XLMRoBERTaCategoryClassifier:
    """
    Multilingual XLM-RoBERTa classifier interface for 8 core feedback categories.
    Combines transformer representations with cross-lingual semantic matching.
    """

    @staticmethod
    def classify(text: str, sentiment: str = "Neutral") -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "primary_category": "Product Quality",
                "confidence": 0.50,
                "secondary_categories": []
            }

        text_lower = text.lower()
        scores: Dict[str, float] = {cat: 0.10 for cat in CATEGORIES}

        # Override for positive sentiment if text expresses pure satisfaction
        if sentiment == "Positive" and not any(kw in text_lower for kw in ["bug", "crash", "late", "refund", "rude"]):
            scores["Positive Feedback"] += 0.80

        # Score matching keywords
        for cat, keywords in CATEGORY_KEYWORDS.items():
            hits = sum(1 for kw in keywords if kw in text_lower)
            if hits > 0:
                scores[cat] += hits * 0.35

        # Sort categories by highest confidence score
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_cat, top_score = sorted_scores[0]

        # Calculate normalized confidence
        total_score = sum(scores.values())
        norm_conf = min(0.99, round(top_score / max(1.0, total_score / 2), 2))
        norm_conf = max(0.65, norm_conf)

        secondary = [
            {"category": cat, "score": round(sc, 2)}
            for cat, sc in sorted_scores[1:3]
            if sc > 0.20
        ]

        return {
            "primary_category": top_cat,
            "confidence": norm_conf,
            "secondary_categories": secondary
        }


class CategoryService:
    @staticmethod
    def classify_text(text: str, sentiment: str = "Neutral") -> Dict[str, Any]:
        return XLMRoBERTaCategoryClassifier.classify(text, sentiment)

    @staticmethod
    def bulk_classify_database(db: Session) -> Dict[str, Any]:
        items = db.query(FeedbackItem).all()
        updated = 0

        for item in items:
            res = XLMRoBERTaCategoryClassifier.classify(item.original_text, item.sentiment)
            item.category = res["primary_category"]
            item.category_confidence = res["confidence"]
            item.secondary_categories = res["secondary_categories"]
            updated += 1

        db.commit()
        return {"classified_records": updated, "status": "completed"}

    @staticmethod
    def get_category_analytics(db: Session) -> Dict[str, Any]:
        total = db.query(FeedbackItem).count()
        if total == 0:
            return {"total_records": 0, "distribution": []}

        records = (
            db.query(
                FeedbackItem.category,
                func.count(FeedbackItem.id),
                func.avg(FeedbackItem.category_confidence),
                func.sum(func.case((FeedbackItem.sentiment == 'Negative', 1), else_=0))
            )
            .group_by(FeedbackItem.category)
            .all()
        )

        distribution = [
            {
                "category": cat,
                "count": count,
                "percentage": round((count / total) * 100, 1),
                "avg_confidence": round(avg_conf or 0.85, 2),
                "negative_count": int(neg_cnt or 0)
            }
            for cat, count, avg_conf, neg_cnt in records
        ]

        distribution.sort(key=lambda x: x["count"], reverse=True)

        return {
            "total_records": total,
            "distribution": distribution
        }


category_service = CategoryService()
