import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class AutomationRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    condition_sentiment: Optional[str] = None
    condition_aspect: Optional[str] = None
    condition_urgency: Optional[str] = None
    condition_language: Optional[str] = None
    action_type: str  # EMAIL_ALERT, SLACK_NOTIFICATION, JIRA_TICKET, AUTO_ESCALATE
    action_config: Dict[str, Any] = {}


class AutomationRuleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    condition_sentiment: Optional[str] = None
    condition_aspect: Optional[str] = None
    condition_urgency: Optional[str] = None
    condition_language: Optional[str] = None
    action_type: str
    action_config: Dict[str, Any] = {}
    trigger_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ActionLogOut(BaseModel):
    id: int
    rule_id: int
    rule_name: str
    feedback_id: int
    action_type: str
    status: str
    details: Optional[str] = None
    executed_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
