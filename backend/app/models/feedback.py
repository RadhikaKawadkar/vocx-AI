import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from app.database import Base


class FeedbackItem(Base):
    __tablename__ = "feedback_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(100), index=True, nullable=True)
    source = Column(String(50), index=True, nullable=False)  # PlayStore, AppStore, Twitter, SupportTicket, Survey, Webhook, CSV_Import, JSON_Import
    original_text = Column(Text, nullable=False)
    english_translation = Column(Text, nullable=True)
    detected_language = Column(String(20), index=True, nullable=False)  # hi, ta, te, kn, mr, bn, gu, ml, pa, or, hi-en, en
    language_name = Column(String(50), nullable=False)  # Hindi, Tamil, Telugu, Hinglish, etc.
    sentiment = Column(String(20), index=True, nullable=False)  # Positive, Negative, Neutral, Mixed
    sentiment_score = Column(Float, nullable=False)  # -1.0 to 1.0
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    aspect_category = Column(String(50), index=True, nullable=False)  # Customer Support, Product Quality, Pricing, Delivery, App UI, Billing
    urgency_level = Column(String(20), index=True, default="Low")  # Low, Medium, High, Critical
    is_escalated = Column(Boolean, default=False)
    location_state = Column(String(100), index=True, nullable=True)  # Maharashtra, Tamil Nadu, Karnataka, Delhi, etc.
    tags = Column(JSON, default=list)  # List of string tags
    
    # Module 2: Ingestion & Duplicate Tracking
    content_hash = Column(String(64), index=True, nullable=True)
    batch_id = Column(String(100), index=True, nullable=True)
    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_of_id = Column(Integer, nullable=True)
    metadata_info = Column(JSON, default=dict)

    # Module 5: Multilingual Category Classification
    category = Column(String(50), index=True, nullable=False, default="Product Quality")  # Delivery Issue, Product Quality, Customer Support, Pricing, Payment Problem, App Bug, Feature Request, Positive Feedback
    category_confidence = Column(Float, default=0.85)
    secondary_categories = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
