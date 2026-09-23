from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.automation import AutomationRuleCreate, AutomationRuleOut, ActionLogOut
from app.services.automation_service import automation_service

router = APIRouter()


@router.get("/rules", response_model=List[AutomationRuleOut])
def list_rules(db: Session = Depends(get_db)):
    """List all configured automation rules."""
    return automation_service.get_rules(db)


@router.post("/rules", response_model=AutomationRuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(rule_in: AutomationRuleCreate, db: Session = Depends(get_db)):
    """Create a new automation rule."""
    return automation_service.create_rule(db, rule_in)


@router.put("/rules/{rule_id}/status", response_model=AutomationRuleOut)
def toggle_rule_status(rule_id: int, is_active: bool, db: Session = Depends(get_db)):
    """Toggle automation rule active status."""
    rule = automation_service.update_rule(db, rule_id, is_active)
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    """Delete automation rule."""
    success = automation_service.delete_rule(db, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Automation rule not found")
    return None


@router.get("/logs", response_model=List[ActionLogOut])
def list_action_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Get history of executed automation actions."""
    return automation_service.get_action_logs(db, limit)
