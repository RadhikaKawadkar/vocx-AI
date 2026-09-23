from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.automation import AutomationRule, ActionLog
from app.models.feedback import FeedbackItem
from app.schemas.automation import AutomationRuleCreate
from app.utils.logger import logger


class AutomationService:
    @staticmethod
    def get_rules(db: Session) -> List[AutomationRule]:
        return db.query(AutomationRule).all()

    @staticmethod
    def create_rule(db: Session, rule_in: AutomationRuleCreate) -> AutomationRule:
        rule = AutomationRule(**rule_in.model_dump())
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def update_rule(db: Session, rule_id: int, is_active: bool) -> Optional[AutomationRule]:
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
        if rule:
            rule.is_active = is_active
            db.commit()
            db.refresh(rule)
        return rule

    @staticmethod
    def delete_rule(db: Session, rule_id: int) -> bool:
        rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
        if rule:
            db.delete(rule)
            db.commit()
            return True
        return False

    @staticmethod
    def evaluate_and_trigger(db: Session, feedback: FeedbackItem) -> List[ActionLog]:
        active_rules = db.query(AutomationRule).filter(AutomationRule.is_active == True).all()
        executed_logs = []

        for rule in active_rules:
            # Check conditions
            match_sentiment = not rule.condition_sentiment or rule.condition_sentiment == feedback.sentiment
            match_aspect = not rule.condition_aspect or rule.condition_aspect == feedback.aspect_category
            match_urgency = not rule.condition_urgency or rule.condition_urgency == feedback.urgency_level
            match_language = not rule.condition_language or rule.condition_language in ("Any", feedback.detected_language)

            if match_sentiment and match_aspect and match_urgency and match_language:
                # Trigger action
                rule.trigger_count += 1
                if rule.action_type == "AUTO_ESCALATE":
                    feedback.is_escalated = True

                log_entry = ActionLog(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    feedback_id=feedback.id,
                    action_type=rule.action_type,
                    status="SUCCESS",
                    details=f"Triggered action {rule.action_type} for feedback #{feedback.id} ({feedback.sentiment}/{feedback.aspect_category})"
                )
                db.add(log_entry)
                executed_logs.append(log_entry)
                logger.info(f"Automation Rule [{rule.name}] triggered on Feedback #{feedback.id}")

        db.commit()
        return executed_logs

    @staticmethod
    def get_action_logs(db: Session, limit: int = 50) -> List[ActionLog]:
        return db.query(ActionLog).order_by(ActionLog.executed_at.desc()).limit(limit).all()


automation_service = AutomationService()
