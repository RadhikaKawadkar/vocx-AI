from sqlalchemy.orm import Session
from app.models.feedback import FeedbackItem
from app.models.user import User
from app.models.automation import AutomationRule
from app.utils.security import hash_password
from app.services.nlp_engine import nlp_engine
import datetime

SAMPLE_INDIAN_FEEDBACK = [
    # Hindi (Devanagari)
    {
        "text": "ऐप बहुत अच्छा है और डिलीवरी समय पर हुई। धन्यवाद टीम VOCX!",
        "source": "PlayStore",
        "state": "Maharashtra",
        "customer_id": "CUST_IN_101"
    },
    {
        "text": "बकवास सर्विस है! पैसा कट गया पर रिफंड नहीं मिला। कस्टमर केयर एग्जीक्यूटिव का व्यवहार बहुत खराब था।",
        "source": "PlayStore",
        "state": "Delhi",
        "customer_id": "CUST_IN_102"
    },
    {
        "text": "ओटीपी नहीं आ रहा है, लॉगिन करने में बहुत दिक्कत हो रही है। ऐप बार-बार क्रैश हो रहा है।",
        "source": "SupportTicket",
        "state": "Uttar Pradesh",
        "customer_id": "CUST_IN_103"
    },
    # Tamil
    {
        "text": "ரொம்ப நல்லா இருக்கு ஆப், பணம் உடனே டிரான்ஸ்பர் ஆகுது. மிக அருமையான சேவை!",
        "source": "AppStore",
        "state": "Tamil Nadu",
        "customer_id": "CUST_IN_201"
    },
    {
        "text": "ரொம்ப மோசம் Delivery late ஆச்சு. Cust care executive ஒழுங்கா பதில் சொல்லல. Fraud app!",
        "source": "Twitter",
        "state": "Tamil Nadu",
        "customer_id": "CUST_IN_202"
    },
    # Telugu
    {
        "text": "యాప్ చాలా బాగుంది. ఫాస్ట్ డెలివరీ మరియు మంచి ఆఫర్లు ఉన్నాయి.",
        "source": "PlayStore",
        "state": "Andhra Pradesh",
        "customer_id": "CUST_IN_301"
    },
    {
        "text": "చెత్త యాప్, యూపీఐ పేమెంట్ ఫెయిల్ అయింది. నా డబ్బులు స్టక్ అయ్యాయి. పోలీస్ కేసు పెడతాను!",
        "source": "SupportTicket",
        "state": "Telangana",
        "customer_id": "CUST_IN_302"
    },
    # Hinglish
    {
        "text": "Bahut accha app hai but payment gateway is a bit slow. Discount offers are superb!",
        "source": "PlayStore",
        "state": "Karnataka",
        "customer_id": "CUST_IN_401"
    },
    {
        "text": "Total scam hai! Hidden charges feature me lagaye hain. Fraud team, money return karo urgent!",
        "source": "Twitter",
        "state": "Maharashtra",
        "customer_id": "CUST_IN_402"
    },
    {
        "text": "Customer support execution was so rude. OTP nahi aa raha, chat agent refused to help.",
        "source": "SupportTicket",
        "state": "Haryana",
        "customer_id": "CUST_IN_403"
    },
    # Bengali
    {
        "text": "খুব ভালো সার্ভিস! সময় মতো ডেলিভারি পেয়েছি। ধন্যবাদ।",
        "source": "AppStore",
        "state": "West Bengal",
        "customer_id": "CUST_IN_501"
    },
    # Kannada
    {
        "text": "ಆಪ್ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ. ಸೇವೆ ಶೀಘ್ರವಾಗಿದೆ!",
        "source": "PlayStore",
        "state": "Karnataka",
        "customer_id": "CUST_IN_601"
    },
    # Marathi
    {
        "text": "खूप छान ॲप आहे. डिलिव्हरी वेळेवर झाली.",
        "source": "PlayStore",
        "state": "Maharashtra",
        "customer_id": "CUST_IN_701"
    },
    # English
    {
        "text": "The UI update is fantastic. Seamless transaction speed and crisp analytics dashboard.",
        "source": "PlayStore",
        "state": "Karnataka",
        "customer_id": "CUST_IN_801"
    },
    {
        "text": "Defective item received! Return request is rejected by bot. I will take legal action in consumer court.",
        "source": "SupportTicket",
        "state": "Delhi",
        "customer_id": "CUST_IN_802"
    }
]


def seed_database(db: Session):
    """Seed initial admin user, automation rules, and regional customer feedback items."""
    # 1. Seed User
    if not db.query(User).filter(User.email == "admin@vocx.ai").first():
        admin = User(
            email="admin@vocx.ai",
            full_name="VOCX Admin Analyst",
            hashed_password=hash_password("admin123"),
            role="Admin",
            is_active=True
        )
        db.add(admin)

    # 2. Seed Automation Rules
    if db.query(AutomationRule).count() == 0:
        rule1 = AutomationRule(
            name="Escalate Legal & Fraud Threats",
            description="Auto-escalate critical urgency feedback mentioning fraud or legal action to Priority Slack/Jira.",
            is_active=True,
            condition_sentiment="Negative",
            condition_urgency="Critical",
            action_type="AUTO_ESCALATE",
            action_config={"channel": "#urgent-risk", "notify": "security-leads@company.in"}
        )
        rule2 = AutomationRule(
            name="Customer Support Negative Alert",
            description="Notify Customer Success Leads when Negative feedback is flagged under Customer Support.",
            is_active=True,
            condition_sentiment="Negative",
            condition_aspect="Customer Support",
            action_type="EMAIL_ALERT",
            action_config={"recipient": "support-lead@company.in"}
        )
        db.add(rule1)
        db.add(rule2)

    # 3. Seed Feedback Items
    if db.query(FeedbackItem).count() == 0:
        base_time = datetime.datetime.utcnow() - datetime.timedelta(days=5)
        for idx, item in enumerate(SAMPLE_INDIAN_FEEDBACK):
            nlp_res = nlp_engine.process_feedback(item["text"], source=item["source"])
            created_dt = base_time + datetime.timedelta(hours=idx * 7)
            
            fb = FeedbackItem(
                customer_id=item["customer_id"],
                source=item["source"],
                original_text=item["text"],
                english_translation=nlp_res["english_translation"],
                detected_language=nlp_res["detected_language"],
                language_name=nlp_res["language_name"],
                sentiment=nlp_res["sentiment"],
                sentiment_score=nlp_res["sentiment_score"],
                confidence_score=nlp_res["confidence_score"],
                aspect_category=nlp_res["aspect_category"],
                urgency_level=nlp_res["urgency_level"],
                is_escalated=(nlp_res["urgency_level"] == "Critical"),
                location_state=item["state"],
                tags=nlp_res["tags"],
                created_at=created_dt
            )
            db.add(fb)

    db.commit()
