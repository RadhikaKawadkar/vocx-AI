from fastapi import APIRouter
from app.api.v1 import auth, feedback, analytics, automation, nlp, language, translation, category, sentiment

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback Ingestion & Explorer"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Dashboard"])
api_router.include_router(automation.router, prefix="/automation", tags=["Automation Rules"])
api_router.include_router(nlp.router, prefix="/nlp", tags=["Live Multilingual NLP Intelligence"])
api_router.include_router(language.router, prefix="/language", tags=["FastText Language Detection Engine"])
api_router.include_router(translation.router, prefix="/translation", tags=["Indic Translation Engine"])
api_router.include_router(category.router, prefix="/category", tags=["XLM-RoBERTa Category Classification"])
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["Indic Sentiment Analysis"])
