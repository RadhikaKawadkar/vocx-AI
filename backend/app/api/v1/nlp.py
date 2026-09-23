from fastapi import APIRouter
from app.schemas.feedback import TextAnalyzeRequest, TextAnalyzeResponse
from app.services.nlp_engine import nlp_engine

router = APIRouter()


@router.post("/analyze", response_model=TextAnalyzeResponse)
def analyze_text(request: TextAnalyzeRequest):
    """
    Live NLP Sandbox endpoint. Analyzes Indian regional text, detects script/language,
    translates to English, calculates sentiment & confidence scores, extracts business aspect & urgency.
    """
    res = nlp_engine.process_feedback(request.text, source=request.source or "Sandbox")
    return TextAnalyzeResponse(**res)
