import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class AspectSentiment(Base):
    __tablename__ = "aspect_sentiments"

    id = Column(Integer, primary_key=True, index=True)
    aspect_name = Column(String, index=True, nullable=False)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class RegionalDistribution(Base):
    __tablename__ = "regional_distributions"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, index=True, nullable=False)
    language = Column(String, index=True, nullable=False)
    total_volume = Column(Integer, default=0)
    negative_ratio = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
