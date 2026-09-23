import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TranslationRecord(Base):
    __tablename__ = "translation_records"

    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback_items.id", ondelete="CASCADE"), nullable=False, index=True)
    source_language = Column(String(20), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="PENDING", index=True)  # PENDING, COMPLETED, FAILED, BYPASSED
    provider = Column(String(50), default="indic-trans2")                       # indic-trans2, nllb-200, neural-fallback
    latency_ms = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    feedback_item = relationship("FeedbackItem", backref="translations")
