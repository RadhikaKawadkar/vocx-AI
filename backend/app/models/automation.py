import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from app.database import Base


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    condition_sentiment = Column(String, nullable=True)  # Negative, Positive, Neutral
    condition_aspect = Column(String, nullable=True)  # Customer Support, Product Quality, etc.
    condition_urgency = Column(String, nullable=True)  # High, Critical
    condition_language = Column(String, nullable=True)  # Any or specific code
    action_type = Column(String, nullable=False)  # EMAIL_ALERT, SLACK_NOTIFICATION, JIRA_TICKET, AUTO_ESCALATE
    action_config = Column(JSON, default=dict)  # recipient, webhook_url, template, priority
    trigger_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, nullable=False)
    rule_name = Column(String, nullable=False)
    feedback_id = Column(Integer, nullable=False)
    action_type = Column(String, nullable=False)
    status = Column(String, nullable=False)  # SUCCESS, FAILED
    details = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
