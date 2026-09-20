"""
Pydantic schemas for ITIL Incident Management System.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    """User GUI incident reporting schema (FR-3)."""
    object_tag: str = Field(..., description="Source object, e.g. web browser, printer, server")
    type_tag: str = Field(..., description="Type, e.g. hardware, application, network, security")
    service_tag: str = Field(..., description="Affected service, e.g. printing, connection, mailing")
    problem_tag: str = Field(..., description="Problem type, e.g. shutdown, error, fault, timeout")
    description: str = Field(..., description="Detailed symptom and incident description")
    reporter_email: Optional[str] = "user@enterprise.org"


class IncidentUpdate(BaseModel):
    """Update fields for incident."""
    status: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    impact: Optional[str] = None
    urgency: Optional[str] = None
    assigned_support_category: Optional[str] = None


class SolutionCreate(BaseModel):
    """Support staff resolution submission."""
    solution_text: str
    staff_name: Optional[str] = "Support Engineer"


class SolutionOut(BaseModel):
    id: int
    solution_text: str
    resolution_method: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    agent_name: str
    action: str
    details: Optional[str] = None
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True


class IncidentDetailResponse(BaseModel):
    """Detailed ITIL incident view."""
    id: str
    title: str
    description: str
    object_tag: str
    type_tag: str
    service_tag: str
    problem_tag: str
    status: str
    severity: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[str] = None
    urgency: Optional[str] = None
    sla_allowed_time_minutes: Optional[int] = None
    sla_breached: bool = False
    assigned_support_category: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    source: str
    productivity_rate: Optional[float] = 0.0
    problem_manager_notified: bool = False
    xml_representation: Optional[str] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    solutions: List[SolutionOut] = []
    audit_entries: List[AuditLogOut] = []

    class Config:
        from_attributes = True


class IncidentSubmissionResult(BaseModel):
    incident_id: str
    status: str
    match_type: str  # exact, possible, none
    message: str
    solution: Optional[str] = None
    matched_incident_id: Optional[str] = None
    score: Optional[float] = None
    exact_matches: List[Dict[str, Any]] = []
    possible_matches: List[Dict[str, Any]] = []


class EventLogCreate(BaseModel):
    source_system: str
    service_name: str
    log_level: str = "ERROR"  # INFO, WARN, ERROR, CRITICAL
    message: str


class EventLogOut(BaseModel):
    id: int
    timestamp: datetime
    source_system: str
    service_name: str
    log_level: str
    message: str
    processed_by_supervisor: bool
    incident_id: Optional[str] = None

    class Config:
        from_attributes = True


class MatchmakingConfigPayload(BaseModel):
    sfactor: float = Field(..., ge=0.1, le=5.0)
    ofactor: float = Field(..., ge=0.1, le=5.0)
    pfactor: float = Field(..., ge=0.1, le=5.0)
    tfactor: float = Field(..., ge=0.1, le=5.0)


class ConfigurationItemCreate(BaseModel):
    ci_name: str
    ci_type: str
    service_name: str
    impact_level: int = 3
    urgency_level: int = 3
    owner_team: Optional[str] = None
    dependencies_json: Optional[str] = "[]"
    status: str = "active"


class ConfigurationItemOut(ConfigurationItemCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SLADefinitionCreate(BaseModel):
    service_name: str
    priority: str
    max_resolution_time_minutes: int
    recurrence_threshold: int = 3
    escalation_rules_json: Optional[str] = "{}"


class SLADefinitionOut(SLADefinitionCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
