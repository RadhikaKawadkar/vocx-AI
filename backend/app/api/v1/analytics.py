from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import DashboardSummaryResponse
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Fetch complete executive dashboard summary, metrics, sentiment trends, language breakdown, and aspect scores."""
    return analytics_service.get_dashboard_summary(db)
