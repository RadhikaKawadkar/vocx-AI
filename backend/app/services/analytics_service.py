from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from app.models.feedback import FeedbackItem
from app.schemas.analytics import (
    DashboardSummaryResponse, KeyMetricsResponse, SentimentTrendItem,
    LanguageDistributionItem, AspectSentimentItem, RegionalDistributionItem
)


class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
        total = db.query(FeedbackItem).count()

        if total == 0:
            return DashboardSummaryResponse(
                metrics=KeyMetricsResponse(
                    total_feedback=0, positive_percentage=0.0, negative_percentage=0.0,
                    neutral_percentage=0.0, nps_score=0.0, urgent_alerts_count=0,
                    languages_supported_count=10
                ),
                trends=[],
                languages=[],
                aspects=[],
                regional=[]
            )

        # Metrics calculation
        pos_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Positive").count()
        neg_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Negative").count()
        neu_count = db.query(FeedbackItem).filter(FeedbackItem.sentiment == "Neutral").count()
        urgent_count = db.query(FeedbackItem).filter(FeedbackItem.urgency_level.in_(["High", "Critical"])).count()

        pos_pct = round((pos_count / total) * 100, 1)
        neg_pct = round((neg_count / total) * 100, 1)
        neu_pct = round((neu_count / total) * 100, 1)
        nps = round(pos_pct - neg_pct, 1)

        metrics = KeyMetricsResponse(
            total_feedback=total,
            positive_percentage=pos_pct,
            negative_percentage=neg_pct,
            neutral_percentage=neu_pct,
            nps_score=nps,
            urgent_alerts_count=urgent_count,
            languages_supported_count=10
        )

        # Languages breakdown
        lang_counts = (
            db.query(FeedbackItem.detected_language, FeedbackItem.language_name, func.count(FeedbackItem.id))
            .group_by(FeedbackItem.detected_language, FeedbackItem.language_name)
            .all()
        )
        languages = [
            LanguageDistributionItem(
                language=lang_code,
                language_name=lang_name,
                count=count,
                percentage=round((count / total) * 100, 1)
            )
            for lang_code, lang_name, count in lang_counts
        ]
        languages.sort(key=lambda x: x.count, reverse=True)

        # Aspect sentiment breakdown
        aspect_records = (
            db.query(
                FeedbackItem.aspect_category,
                FeedbackItem.sentiment,
                func.count(FeedbackItem.id),
                func.avg(FeedbackItem.sentiment_score)
            )
            .group_by(FeedbackItem.aspect_category, FeedbackItem.sentiment)
            .all()
        )

        aspect_map: Dict[str, Dict[str, Any]] = {}
        for category, sentiment, count, avg_score in aspect_records:
            if category not in aspect_map:
                aspect_map[category] = {"pos": 0, "neu": 0, "neg": 0, "scores": []}
            if sentiment == "Positive":
                aspect_map[category]["pos"] += count
            elif sentiment == "Neutral":
                aspect_map[category]["neu"] += count
            elif sentiment == "Negative":
                aspect_map[category]["neg"] += count
            aspect_map[category]["scores"].append(avg_score or 0.0)

        aspects = [
            AspectSentimentItem(
                aspect_name=asp,
                positive=data["pos"],
                neutral=data["neu"],
                negative=data["neg"],
                avg_score=round(sum(data["scores"]) / len(data["scores"]), 2) if data["scores"] else 0.0
            )
            for asp, data in aspect_map.items()
        ]

        # Regional distribution breakdown
        regional_records = (
            db.query(
                FeedbackItem.location_state,
                FeedbackItem.detected_language,
                func.count(FeedbackItem.id),
                func.sum(func.case((FeedbackItem.sentiment == 'Negative', 1), else_=0))
            )
            .group_by(FeedbackItem.location_state, FeedbackItem.detected_language)
            .all()
        )

        regional_map: Dict[str, Dict[str, Any]] = {}
        for state, lang, vol, neg_vol in regional_records:
            st = state or "Maharashtra"
            if st not in regional_map:
                regional_map[st] = {"total": 0, "neg": 0, "langs": {}}
            regional_map[st]["total"] += vol
            regional_map[st]["neg"] += (neg_vol or 0)
            regional_map[st]["langs"][lang] = regional_map[st]["langs"].get(lang, 0) + vol

        regional = [
            RegionalDistributionItem(
                state=st,
                total_volume=data["total"],
                negative_ratio=round((data["neg"] / data["total"]) * 100, 1) if data["total"] else 0.0,
                top_language=max(data["langs"], key=data["langs"].get) if data["langs"] else "en"
            )
            for st, data in regional_map.items()
        ]

        # Time series trends (last 7 days or mock/grouped date)
        items = db.query(FeedbackItem).all()
        trend_map: Dict[str, Dict[str, int]] = {}

        for item in items:
            date_str = item.created_at.strftime("%Y-%m-%d")
            if date_str not in trend_map:
                trend_map[date_str] = {"Positive": 0, "Neutral": 0, "Negative": 0, "total": 0}
            trend_map[date_str][item.sentiment] = trend_map[date_str].get(item.sentiment, 0) + 1
            trend_map[date_str]["total"] += 1

        trends = [
            SentimentTrendItem(
                date=dt,
                positive=counts["Positive"],
                neutral=counts["Neutral"],
                negative=counts["Negative"],
                total=counts["total"]
            )
            for dt, counts in sorted(trend_map.items())
        ]

        return DashboardSummaryResponse(
            metrics=metrics,
            trends=trends,
            languages=languages,
            aspects=aspects,
            regional=regional
        )


analytics_service = AnalyticsService()
