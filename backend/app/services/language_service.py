import re
import math
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.feedback import FeedbackItem
from app.utils.logger import logger

# Script Unicode Range definitions for FastText / Script Classifier
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "script": "Latin", "flag": "🇬🇧"},
    "hi": {"name": "Hindi", "script": "Devanagari", "flag": "🇮🇳"},
    "mr": {"name": "Marathi", "script": "Devanagari (Marathi)", "flag": "🇮🇳"},
    "ta": {"name": "Tamil", "script": "Tamil", "flag": "🇮🇳"},
    "te": {"name": "Telugu", "script": "Telugu", "flag": "🇮🇳"},
    "bn": {"name": "Bengali", "script": "Bengali", "flag": "🇮🇳"},
    "hi-en": {"name": "Hinglish", "script": "Code-Mixed Latin/Devanagari", "flag": "🇮🇳"},
}

# FastText N-Gram lexicon markers for Hinglish and Marathi script differentiation
MARATHI_DISTINCT_WORDS = ["आहे", "होते", "नाही", "खूप", "छान", "काही", "आणि", "करून", "झाला", "ॲप", "कसे", "मला"]
HINDI_DISTINCT_WORDS = ["है", "हैं", "नहीं", "बहुत", "अच्छा", "कस्टमर", "रिफंड", "क्या", "करें", "किया", "गया"]
HINGLISH_MARKERS = ["bahut", "accha", "badiya", "kharab", "bakwas", "dhokha", "paisa", "chahiye", "karo", "kya", "mera", "mujhe", "hai", "nhi", "nahi", "samajh", "bhai", "lo", "mat"]

class FastTextLanguageDetector:
    """
    FastText-inspired high-speed N-gram & Unicode script language detector 
    tuned specifically for Indian regional languages and Code-Mixed Hinglish.
    """

    @staticmethod
    def detect(text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "language_code": "en",
                "language_name": "English",
                "confidence": 0.50,
                "script": "Latin",
                "is_code_mixed": False,
                "distribution": {"en": 1.0}
            }

        text_clean = text.strip()
        total_chars = len(text_clean)
        
        # Count Unicode script character frequencies
        devanagari_cnt = sum(1 for c in text_clean if 0x0900 <= ord(c) <= 0x097F)
        tamil_cnt = sum(1 for c in text_clean if 0x0B80 <= ord(c) <= 0x0BFF)
        telugu_cnt = sum(1 for c in text_clean if 0x0C00 <= ord(c) <= 0x0C7F)
        bengali_cnt = sum(1 for c in text_clean if 0x0980 <= ord(c) <= 0x09FF)
        latin_cnt = sum(1 for c in text_clean if (0x0041 <= ord(c) <= 0x005A) or (0x0061 <= ord(c) <= 0x007A))

        # Check for Devanagari script (Hindi vs Marathi)
        if devanagari_cnt > total_chars * 0.2:
            text_lower = text_clean.lower()
            mr_hits = sum(1 for w in MARATHI_DISTINCT_WORDS if w in text_clean)
            hi_hits = sum(1 for w in HINDI_DISTINCT_WORDS if w in text_clean)

            if mr_hits > hi_hits:
                conf = min(0.99, round(0.85 + (devanagari_cnt / total_chars) * 0.12, 2))
                return {
                    "language_code": "mr",
                    "language_name": "Marathi",
                    "confidence": conf,
                    "script": "Devanagari",
                    "is_code_mixed": False,
                    "distribution": {"mr": conf, "hi": round(1.0 - conf, 2)}
                }
            else:
                conf = min(0.99, round(0.88 + (devanagari_cnt / total_chars) * 0.10, 2))
                return {
                    "language_code": "hi",
                    "language_name": "Hindi",
                    "confidence": conf,
                    "script": "Devanagari",
                    "is_code_mixed": False,
                    "distribution": {"hi": conf, "mr": round(1.0 - conf, 2)}
                }

        # Check for Tamil
        if tamil_cnt > total_chars * 0.2:
            conf = min(0.99, round(0.90 + (tamil_cnt / total_chars) * 0.08, 2))
            return {
                "language_code": "ta",
                "language_name": "Tamil",
                "confidence": conf,
                "script": "Tamil",
                "is_code_mixed": False,
                "distribution": {"ta": conf}
            }

        # Check for Telugu
        if telugu_cnt > total_chars * 0.2:
            conf = min(0.99, round(0.90 + (telugu_cnt / total_chars) * 0.08, 2))
            return {
                "language_code": "te",
                "language_name": "Telugu",
                "confidence": conf,
                "script": "Telugu",
                "is_code_mixed": False,
                "distribution": {"te": conf}
            }

        # Check for Bengali
        if bengali_cnt > total_chars * 0.2:
            conf = min(0.99, round(0.90 + (bengali_cnt / total_chars) * 0.08, 2))
            return {
                "language_code": "bn",
                "language_name": "Bengali",
                "confidence": conf,
                "script": "Bengali",
                "is_code_mixed": False,
                "distribution": {"bn": conf}
            }

        # Latin Script -> Differentiate English vs Hinglish
        words = [w.lower().strip(".,!?") for w in text_clean.split()]
        hinglish_hits = sum(1 for w in words if w in HINGLISH_MARKERS)

        if len(words) > 0 and (hinglish_hits / len(words)) >= 0.15:
            conf = min(0.98, round(0.75 + (hinglish_hits / len(words)) * 0.20, 2))
            return {
                "language_code": "hi-en",
                "language_name": "Hinglish",
                "confidence": conf,
                "script": "Code-Mixed Latin",
                "is_code_mixed": True,
                "distribution": {"hi-en": conf, "en": round(1 - conf, 2)}
            }

        # Default English
        conf = min(0.99, round(0.85 + (latin_cnt / max(1, total_chars)) * 0.12, 2))
        return {
            "language_code": "en",
            "language_name": "English",
            "confidence": conf,
            "script": "Latin",
            "is_code_mixed": False,
            "distribution": {"en": conf}
        }


class LanguageService:
    @staticmethod
    def detect_single(text: str) -> Dict[str, Any]:
        return FastTextLanguageDetector.detect(text)

    @staticmethod
    def detect_bulk(texts: List[str]) -> List[Dict[str, Any]]:
        return [FastTextLanguageDetector.detect(t) for t in texts]

    @staticmethod
    def reclassify_database_records(db: Session) -> Dict[str, Any]:
        items = db.query(FeedbackItem).all()
        updated_count = 0
        for item in items:
            res = FastTextLanguageDetector.detect(item.original_text)
            item.detected_language = res["language_code"]
            item.language_name = res["language_name"]
            item.confidence_score = res["confidence"]
            updated_count += 1
        db.commit()
        return {"reclassified_records": updated_count, "status": "completed"}

    @staticmethod
    def get_language_statistics(db: Session) -> Dict[str, Any]:
        total = db.query(FeedbackItem).count()
        if total == 0:
            return {"total_records": 0, "distribution": [], "avg_confidence": 0.0}

        records = (
            db.query(FeedbackItem.detected_language, FeedbackItem.language_name, func.count(FeedbackItem.id), func.avg(FeedbackItem.confidence_score))
            .group_by(FeedbackItem.detected_language, FeedbackItem.language_name)
            .all()
        )

        avg_conf_total = db.query(func.avg(FeedbackItem.confidence_score)).scalar() or 0.0

        distribution = [
            {
                "code": code,
                "name": name,
                "count": count,
                "percentage": round((count / total) * 100, 1),
                "avg_confidence": round(avg_conf, 2)
            }
            for code, name, count, avg_conf in records
        ]

        return {
            "total_records": total,
            "avg_confidence": round(avg_conf_total, 2),
            "distribution": distribution
        }


language_service = LanguageService()
