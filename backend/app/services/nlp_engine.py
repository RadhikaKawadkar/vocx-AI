import re
from typing import Dict, Any, List, Tuple
from app.utils.logger import logger

# Indian Language Script Map
SCRIPT_RANGES = [
    (0x0900, 0x097F, "hi", "Hindi / Devanagari"),
    (0x0B80, 0x0BFF, "ta", "Tamil"),
    (0x0C00, 0x0C7F, "te", "Telugu"),
    (0x0C80, 0x0CFF, "kn", "Kannada"),
    (0x0980, 0x09FF, "bn", "Bengali"),
    (0x0A80, 0x0AFF, "gu", "Gujarati"),
    (0x0D00, 0x0D7F, "ml", "Malayalam"),
    (0x0A00, 0x0A7F, "pa", "Punjabi"),
    (0x0B00, 0x0B7F, "or", "Odia"),
]

# Regional Keywords & Triggers Dictionary
SENTIMENT_LEXICON = {
    "positive": [
        "best", "good", "great", "excellent", "awesome", "love", "superb", "fast", "helpful", "satisfied",
        "bahut accha", "badiya", "shandar", "mast", "super", "lajawab", "dhanyawad", "dhananyawad",
        "nalladhu", "arumai", "supera irukku", "romba nalla", "nanri",
        "chala bagundi", "manchi", "dhanyavadalu", "chaala baundi",
        "channagide", "utkrushta", "bhalobasha", "khub bhalo", "saras", "bahu saras"
    ],
    "negative": [
        "worst", "bad", "horrible", "terrible", "useless", "fraud", "scam", "cheat", "broken", "crash",
        "slow", "waste", "money lost", "refund not received", "poor", "hate", "issue", "problem",
        "bakwas", "bekar", "kharab", "dhokha", "paisa do", "chori", "fraudster", "ganda", "pagal",
        "romba mosam", "ketta", "kammi", "kettupochu", "kasu pochu",
        "chetta", "mosam", "daridram", "donga", "bokka", "waste app",
        "tumba kettadhu", "kelsa madalla", "faltu", "kharap", "khub kharap", "khotey"
    ]
}

ASPECT_LEXICON = {
    "Customer Support": [
        "agent", "support", "call", "executive", "helpdesk", "behavior", "rude", "reply", "ticket",
        "cust care", "customer service", "chat", "representative", "help", "response"
    ],
    "Pricing & Value": [
        "price", "cost", "charge", "expensive", "fee", "money", "hidden charges", "overcharge",
        "paisa", "rupees", "rs", "cash", "discount", "offer", "costly"
    ],
    "Delivery & Logistics": [
        "delivery", "shipment", "courier", "driver", "late", "delay", "time", "package",
        "tracking", "deliver", "order delay", "not reached"
    ],
    "App UI & Performance": [
        "app", "ui", "bug", "crash", "slow", "update", "screen", "otp", "login",
        "hang", "freeze", "loading", "feature", "button", "interface"
    ],
    "Billing & Payment": [
        "payment", "upi", "refund", "deducted", "bank", "failed", "transaction",
        "account", "card", "wallet", "balance", "money stuck"
    ],
    "Product Quality": [
        "quality", "product", "item", "damaged", "fake", "defective", "material",
        "size", "original", "expired", "broken"
    ]
}

URGENCY_KEYWORDS = [
    "fraud", "scam", "cheat", "consumer court", "legal action", "lawyer", "police", "stolen",
    "money lost", "account hacked", "threat", "fir", "dhokha", "paisa do", "scammer", "urgent"
]


class NLPEngineService:
    def __init__(self):
        logger.info("Initializing VOCX AI Multilingual NLP Intelligence Engine...")
        self.transformers_available = False
        try:
            # Check if transformers pipeline can be loaded optionally
            import transformers
            self.transformers_available = True
            logger.info("HuggingFace Transformers library successfully linked.")
        except Exception as e:
            logger.warning(f"Transformers fallback mode active. Details: {e}")

    def detect_language(self, text: str) -> Tuple[str, str]:
        """Detect language code and display name using script analysis & lexicon heuristics."""
        char_counts: Dict[str, int] = {}
        total_regional_chars = 0

        for char in text:
            code = ord(char)
            for start, end, lang_code, lang_name in SCRIPT_RANGES:
                if start <= code <= end:
                    char_counts[lang_code] = char_counts.get(lang_code, 0) + 1
                    total_regional_chars += 1
                    break

        if char_counts:
            dominant_lang = max(char_counts, key=char_counts.get)
            for _, _, code, name in SCRIPT_RANGES:
                if code == dominant_lang:
                    return code, name

        # Check for Hinglish / Code-mixed (Devanagari/Hindi words in Latin script)
        text_lower = text.lower()
        hinglish_markers = ["accha", "badiya", "kharab", "bakwas", "dhokha", "paisa", "chahiye", "hai", "nhi", "nahi", "karo", "kya", "mera"]
        if any(marker in text_lower for marker in hinglish_markers):
            return "hi-en", "Hinglish (Code-Mixed)"

        return "en", "English"

    def translate_to_english(self, text: str, lang_code: str) -> str:
        """Provide normalized English translation representation for analytics."""
        if lang_code == "en":
            return text

        # Rule/Lexicon enhanced translation mapping for Indian phrases
        translations = {
            "bahut accha app hai": "Very good app",
            "bakwas service paisa kat gaya": "Nonsense service, money got deducted",
            "nalladhu app super": "Good app, super",
            "romba mosam delivery late": "Very bad delivery, late",
            "chala bagundi fast delivery": "Very good fast delivery",
            "bekar app crash ho raha hai": "Useless app, crashing continuously",
            "customer care Executive rude": "Customer care executive was very rude",
            "otp nahi aa raha hai": "OTP is not coming",
            "paisa kat gaya par refund nahi mila": "Money was deducted but refund was not received",
            "dhokha hai legal action lunga": "This is fraud, I will take legal action"
        }

        for sample, trans in translations.items():
            if sample in text.lower():
                return trans

        # If not exact match, prepend tag
        return f"[Translated from {lang_code.upper()}]: {text}"

    def analyze_sentiment(self, text: str) -> Tuple[str, float, float]:
        """
        Analyze sentiment returning (sentiment_label, score_between_-1_and_1, confidence_between_0_and_1).
        """
        text_lower = text.lower()

        pos_matches = sum(1 for word in SENTIMENT_LEXICON["positive"] if word in text_lower)
        neg_matches = sum(1 for word in SENTIMENT_LEXICON["negative"] if word in text_lower)

        if pos_matches > 0 and neg_matches > 0:
            if abs(pos_matches - neg_matches) <= 1:
                return "Mixed", 0.0, 0.75
            elif pos_matches > neg_matches:
                score = round((pos_matches - neg_matches) / (pos_matches + neg_matches), 2)
                return "Positive", score, 0.85
            else:
                score = round((pos_matches - neg_matches) / (pos_matches + neg_matches), 2)
                return "Negative", score, 0.88

        if neg_matches > pos_matches:
            score = -0.4 - min(0.5, neg_matches * 0.15)
            return "Negative", round(score, 2), min(0.98, 0.70 + neg_matches * 0.08)

        if pos_matches > neg_matches:
            score = 0.4 + min(0.5, pos_matches * 0.15)
            return "Positive", round(score, 2), min(0.98, 0.70 + pos_matches * 0.08)

        return "Neutral", 0.0, 0.65

    def extract_aspect(self, text: str) -> str:
        """Extract dominant operational business aspect."""
        text_lower = text.lower()
        aspect_scores: Dict[str, int] = {}

        for aspect, keywords in ASPECT_LEXICON.items():
            count = sum(1 for kw in keywords if kw in text_lower)
            if count > 0:
                aspect_scores[aspect] = count

        if aspect_scores:
            return max(aspect_scores, key=aspect_scores.get)

        return "Product Quality"

    def calculate_urgency(self, text: str, sentiment: str) -> str:
        """Calculate urgency level: Low, Medium, High, Critical."""
        text_lower = text.lower()
        has_urgent_keyword = any(kw in text_lower for kw in URGENCY_KEYWORDS)

        if has_urgent_keyword and sentiment == "Negative":
            return "Critical"
        if has_urgent_keyword:
            return "High"
        if sentiment == "Negative":
            return "High"
        if sentiment == "Mixed":
            return "Medium"

        return "Low"

    def extract_tags(self, text: str, lang_code: str, aspect: str, sentiment: str) -> List[str]:
        """Extract relevant tags."""
        tags = [lang_code.upper(), aspect, sentiment]
        text_lower = text.lower()
        if "otp" in text_lower or "login" in text_lower:
            tags.append("Authentication")
        if "refund" in text_lower or "paisa" in text_lower or "money" in text_lower:
            tags.append("Refund/Money")
        if "fraud" in text_lower or "scam" in text_lower or "dhokha" in text_lower:
            tags.append("Risk/Escalation")
        return list(set(tags))

    def process_feedback(self, text: str, source: str = "Ingest") -> Dict[str, Any]:
        """Full pipeline processing single feedback text."""
        lang_code, lang_name = self.detect_language(text)
        translation = self.translate_to_english(text, lang_code)
        sentiment, sentiment_score, confidence_score = self.analyze_sentiment(text)
        aspect = self.extract_aspect(text)
        urgency = self.calculate_urgency(text, sentiment)
        tags = self.extract_tags(text, lang_code, aspect, sentiment)

        return {
            "original_text": text,
            "english_translation": translation,
            "detected_language": lang_code,
            "language_name": lang_name,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "confidence_score": confidence_score,
            "aspect_category": aspect,
            "urgency_level": urgency,
            "tags": tags,
        }


nlp_engine = NLPEngineService()
