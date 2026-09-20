"""
Supervisor Agent & Event Log API Router.
Handles automated incident detection control, event log ingestion, and monitoring telemetry.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.event_log import EventLogEntry
from app.schemas.incidents import EventLogCreate, EventLogOut
from app.agents.supervisor_agent import supervisor_agent
from app.agents.incident_agent import incident_agent
from app.agents.agent_orchestrator import orchestrator

router = APIRouter(tags=["Supervisor & Event Logs"])


@router.post("/supervisor/start")
def start_supervisor():
    """Start the Supervisor Agent automated background detection loop."""
    orchestrator.start_background_supervisor()
    supervisor_agent.is_monitoring = True
    return {
        "status": "started",
        "is_monitoring": supervisor_agent.is_monitoring,
        "poll_interval_seconds": orchestrator.poll_interval_seconds,
    }


@router.post("/supervisor/stop")
def stop_supervisor():
    """Stop the Supervisor Agent automated background detection loop."""
    orchestrator.stop_background_supervisor()
    supervisor_agent.is_monitoring = False
    return {
        "status": "stopped",
        "is_monitoring": supervisor_agent.is_monitoring,
    }


@router.get("/supervisor/status")
def get_supervisor_status():
    """Get Supervisor Agent monitoring status, poll telemetry, and detection metrics."""
    return {
        "name": supervisor_agent.name,
        "is_connected": supervisor_agent.is_connected,
        "is_monitoring": supervisor_agent.is_monitoring,
        "is_background_loop_running": orchestrator.is_running,
        "last_poll_at": supervisor_agent.last_poll_at.isoformat() if supervisor_agent.last_poll_at else None,
        "detected_count": supervisor_agent.detected_count,
        "suppressed_count": supervisor_agent.suppressed_count,
        "poll_interval_seconds": orchestrator.poll_interval_seconds,
    }


@router.post("/supervisor/poll-now")
def poll_supervisor_now(db: Session = Depends(get_db)):
    """Trigger an immediate detection run on unprocessed event logs."""
    detected = supervisor_agent.poll_and_detect(db)
    created_incidents = []
    for d in detected:
        res = incident_agent.process_incident_query(d, db)
        created_incidents.append(res)
    return {
        "detected_events": len(detected),
        "created_incidents": created_incidents,
        "suppressed_count": supervisor_agent.suppressed_count,
    }


@router.post("/event-logs", response_model=EventLogOut)
def inject_event_log(payload: EventLogCreate, db: Session = Depends(get_db)):
    """
    Inject a simulated system event log entry (FR-1 demo).
    Can trigger immediate automated detection if Supervisor is running.
    """
    entry = EventLogEntry(
        source_system=payload.source_system,
        service_name=payload.service_name,
        log_level=payload.log_level.upper(),
        message=payload.message,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # If log is ERROR or CRITICAL and supervisor is active, trigger detection immediately
    if entry.log_level in ["ERROR", "CRITICAL"] and supervisor_agent.is_monitoring:
        detected = supervisor_agent.poll_and_detect(db)
        for d in detected:
            incident_agent.process_incident_query(d, db)
        db.refresh(entry)

    return entry


@router.get("/event-logs", response_model=List[EventLogOut])
def list_event_logs(
    limit: int = Query(50, ge=1, le=100),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List event log entries in reverse chronological order."""
    q = db.query(EventLogEntry)
    if level:
        q = q.filter(EventLogEntry.log_level == level.upper())
    return q.order_by(desc(EventLogEntry.timestamp)).limit(limit).all()
