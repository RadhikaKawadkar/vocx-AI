from typing import List, Dict
from pydantic import BaseModel


class KeyMetricsResponse(BaseModel):
    total_feedback: int
    positive_percentage: float
    negative_percentage: float
    neutral_percentage: float
    nps_score: float
    urgent_alerts_count: int
    languages_supported_count: int


class SentimentTrendItem(BaseModel):
    date: str
    positive: int
    neutral: int
    negative: int
    total: int


class LanguageDistributionItem(BaseModel):
    language: str
    language_name: str
    count: int
    percentage: float


class AspectSentimentItem(BaseModel):
    aspect_name: str
    positive: int
    neutral: int
    negative: int
    avg_score: float


class RegionalDistributionItem(BaseModel):
    state: str
    total_volume: int
    negative_ratio: float
    top_language: str


class DashboardSummaryResponse(BaseModel):
    metrics: KeyMetricsResponse
    trends: List[SentimentTrendItem]
    languages: List[LanguageDistributionItem]
    aspects: List[AspectSentimentItem]
    regional: List[RegionalDistributionItem]
