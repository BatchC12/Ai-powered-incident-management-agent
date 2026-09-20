"""
Administrator Agent & System Configuration API Router.
Handles agent lifecycle management (connect/disconnect), matchmaking weight tuning,
CMDB configuration item administration, and SLA catalog maintenance.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.agents.administrator_agent import admin_agent
from app.models.cmdb import ConfigurationItem, SLADefinition
from app.models.users import SupportTeam
from app.schemas.incidents import (
    MatchmakingConfigPayload,
    ConfigurationItemCreate,
    ConfigurationItemOut,
    SLADefinitionCreate,
    SLADefinitionOut,
)

router = APIRouter(prefix="/admin", tags=["Administrator & Configuration"])


@router.get("/agents")
def list_agents():
    """List all agents in the multi-agent system and their current connection status (FR-21)."""
    return admin_agent.get_all_agents()


@router.post("/agents/{agent_name}/connect")
def connect_agent(agent_name: str):
    """Activate/connect an agent."""
    return admin_agent.connect_agent(agent_name)


@router.post("/agents/{agent_name}/disconnect")
def disconnect_agent(agent_name: str):
    """Deactivate/disconnect an agent to verify system resilience (FR-23)."""
    return admin_agent.disconnect_agent(agent_name)


@router.get("/config")
def get_matchmaking_configuration():
    """Get current semantic matchmaking weights (S, O, P, T) and threshold (FR-22)."""
    return admin_agent.get_matchmaking_config()


@router.put("/config")
def update_matchmaking_configuration(payload: MatchmakingConfigPayload):
    """Update semantic matchmaking weights and recalculate threshold (FR-22)."""
    return admin_agent.update_matchmaking_config(
        sfactor=payload.sfactor,
        ofactor=payload.ofactor,
        pfactor=payload.pfactor,
        tfactor=payload.tfactor,
    )


@router.get("/cmdb", response_model=List[ConfigurationItemOut])
def get_cmdb_items(db: Session = Depends(get_db)):
    """Retrieve all CMDB Configuration Items."""
    return db.query(ConfigurationItem).all()


@router.post("/cmdb", response_model=ConfigurationItemOut)
def create_cmdb_item(payload: ConfigurationItemCreate, db: Session = Depends(get_db)):
    """Create or update a CMDB Configuration Item."""
    ci = db.query(ConfigurationItem).filter(ConfigurationItem.ci_name == payload.ci_name).first()
    if not ci:
        ci = ConfigurationItem(
            ci_name=payload.ci_name,
            ci_type=payload.ci_type,
            service_name=payload.service_name,
            impact_level=payload.impact_level,
            urgency_level=payload.urgency_level,
            owner_team=payload.owner_team,
            dependencies_json=payload.dependencies_json,
            status=payload.status,
        )
        db.add(ci)
    else:
        ci.ci_type = payload.ci_type
        ci.service_name = payload.service_name
        ci.impact_level = payload.impact_level
        ci.urgency_level = payload.urgency_level
        ci.owner_team = payload.owner_team
        ci.status = payload.status

    db.commit()
    db.refresh(ci)
    return ci


@router.get("/sla", response_model=List[SLADefinitionOut])
def get_sla_definitions(db: Session = Depends(get_db)):
    """Retrieve all SLA catalog definitions."""
    return db.query(SLADefinition).all()


@router.post("/sla", response_model=SLADefinitionOut)
def create_sla_definition(payload: SLADefinitionCreate, db: Session = Depends(get_db)):
    """Add or update an SLA definition."""
    sla = (
        db.query(SLADefinition)
        .filter(
            SLADefinition.service_name == payload.service_name,
            SLADefinition.priority == payload.priority,
        )
        .first()
    )
    if not sla:
        sla = SLADefinition(
            service_name=payload.service_name,
            priority=payload.priority,
            max_resolution_time_minutes=payload.max_resolution_time_minutes,
            recurrence_threshold=payload.recurrence_threshold,
            escalation_rules_json=payload.escalation_rules_json,
        )
        db.add(sla)
    else:
        sla.max_resolution_time_minutes = payload.max_resolution_time_minutes
        sla.recurrence_threshold = payload.recurrence_threshold
        sla.escalation_rules_json = payload.escalation_rules_json

    db.commit()
    db.refresh(sla)
    return sla


@router.get("/teams")
def get_support_teams(db: Session = Depends(get_db)):
    """Get active support teams by category."""
    teams = db.query(SupportTeam).filter(SupportTeam.is_active == 1).all()
    return teams
