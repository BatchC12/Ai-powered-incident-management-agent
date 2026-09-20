"""
Incidents API Router — ITIL Incident Lifecycle.
Handles incident submission via User Agent, retrieval, matchmaking results,
resolution via Support Agent, closure, and audit history.
"""
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.imdb import IncidentRecord, IncidentSolution
from app.models.audit import AuditLog
from app.models.users import User
from app.schemas.incidents import (
    IncidentCreate,
    IncidentUpdate,
    IncidentDetailResponse,
    IncidentSubmissionResult,
    SolutionCreate,
    AuditLogOut,
)
from app.agents.user_agent import user_agent
from app.agents.incident_agent import incident_agent
from app.agents.support_agent import get_support_agent
from app.ontology.matchmaker import get_matchmaker

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("", response_model=IncidentSubmissionResult)
def submit_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """
    User Agent: Submit new incident via Web GUI (FR-3).
    Triggers IMDB XML persistence, OWL semantic matchmaking, and solution reuse/routing.
    """
    reporter = None
    if payload.reporter_email:
        reporter = db.query(User).filter(User.email == payload.reporter_email).first()

    reporter_id = reporter.id if reporter else None

    # Construct incident query via User Agent
    query_payload = user_agent.create_incident_query(
        object_tag=payload.object_tag,
        type_tag=payload.type_tag,
        service_tag=payload.service_tag,
        problem_tag=payload.problem_tag,
        description=payload.description,
        reporter_id=reporter_id,
    )

    # Process query through Incident Agent
    result = incident_agent.process_incident_query(query_payload, db)
    return IncidentSubmissionResult(**result)


@router.get("", response_model=List[IncidentDetailResponse])
def list_incidents(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all incidents with optional filtering by status, priority, or category."""
    query = db.query(IncidentRecord)

    if status:
        query = query.filter(IncidentRecord.status == status)
    if priority:
        query = query.filter(IncidentRecord.priority == priority)
    if category:
        query = query.filter(IncidentRecord.assigned_support_category == category)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (IncidentRecord.title.ilike(search_fmt))
            | (IncidentRecord.description.ilike(search_fmt))
            | (IncidentRecord.id.ilike(search_fmt))
        )

    incidents = query.order_by(desc(IncidentRecord.created_at)).limit(limit).all()
    return incidents


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get complete details of an incident including solutions and audit trail."""
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    return inc


@router.put("/{incident_id}", response_model=IncidentDetailResponse)
def update_incident(incident_id: str, payload: IncidentUpdate, db: Session = Depends(get_db)):
    """Update fields on an existing incident."""
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    updated_fields = []
    if payload.status:
        inc.status = payload.status
        updated_fields.append(f"status -> {payload.status}")
    if payload.priority:
        inc.priority = payload.priority
        updated_fields.append(f"priority -> {payload.priority}")
    if payload.severity:
        inc.severity = payload.severity
        updated_fields.append(f"severity -> {payload.severity}")
    if payload.impact:
        inc.impact = payload.impact
        updated_fields.append(f"impact -> {payload.impact}")
    if payload.urgency:
        inc.urgency = payload.urgency
        updated_fields.append(f"urgency -> {payload.urgency}")
    if payload.assigned_support_category:
        inc.assigned_support_category = payload.assigned_support_category
        updated_fields.append(f"assigned_team -> {payload.assigned_support_category}")

    if updated_fields:
        db.add(
            AuditLog(
                incident_id=inc.id,
                agent_name="UserAgent",
                action="INCIDENT_UPDATED",
                details="Updated: " + ", ".join(updated_fields),
            )
        )
        db.commit()
        db.refresh(inc)

    return inc


@router.delete("/{incident_id}")
def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    """Delete an incident."""
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    db.delete(inc)
    db.commit()
    return {"message": f"Incident {incident_id} deleted successfully."}


@router.post("/{incident_id}/resolve")
def resolve_incident(
    incident_id: str,
    payload: SolutionCreate,
    db: Session = Depends(get_db),
):
    """
    Support Agent: Submit resolution for incident (FR-17).
    Saves solution to IMDB for future semantic matchmaking reuse and marks resolved.
    """
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    support_agent = get_support_agent(inc.assigned_support_category)
    result = support_agent.resolve_incident(
        incident_id=incident_id,
        solution_text=payload.solution_text,
        staff_name=payload.staff_name,
        db=db,
    )
    return result


@router.post("/{incident_id}/close")
def close_incident(incident_id: str, db: Session = Depends(get_db)):
    """Final ITIL closure of incident record."""
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    inc.status = "closed"
    inc.closed_at = datetime.datetime.utcnow()

    db.add(
        AuditLog(
            incident_id=inc.id,
            agent_name="IncidentAgent",
            action="INCIDENT_CLOSED",
            details="Incident closed with verified resolution.",
        )
    )
    db.commit()
    db.refresh(inc)
    return {"incident_id": inc.id, "status": "closed", "closed_at": inc.closed_at}


@router.get("/{incident_id}/matches")
def get_incident_matches(incident_id: str, db: Session = Depends(get_db)):
    """
    Run semantic matchmaking for an incident against all other stored incidents.
    Returns Exact Incident Table and Possible Incident Table with scores.
    """
    inc = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")

    stored = (
        db.query(IncidentRecord)
        .filter(
            IncidentRecord.id != inc.id,
            IncidentRecord.status.in_(["resolved", "closed"]),
        )
        .all()
    )

    stored_pool = []
    for r in stored:
        sol = r.solutions[0].solution_text if r.solutions else None
        if sol:
            stored_pool.append({
                "id": r.id,
                "title": r.title,
                "object": r.object_tag,
                "type": r.type_tag,
                "service": r.service_tag,
                "problem": r.problem_tag,
                "solution": sol,
            })

    matchmaker = get_matchmaker()
    query_tags = {
        "object": inc.object_tag,
        "type": inc.type_tag,
        "service": inc.service_tag,
        "problem": inc.problem_tag,
    }
    exact, possible = matchmaker.find_matches(query_tags, stored_pool)

    return {
        "incident_id": inc.id,
        "threshold": matchmaker.threshold,
        "factors": matchmaker.factors,
        "exact_matches": exact,
        "possible_matches": possible,
    }


@router.get("/{incident_id}/audit", response_model=List[AuditLogOut])
def get_incident_audit_trail(incident_id: str, db: Session = Depends(get_db)):
    """Get complete ITIL lifecycle audit trail for an incident."""
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.incident_id == incident_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    return entries
