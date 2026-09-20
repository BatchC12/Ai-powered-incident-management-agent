"""
Supervisor Agent — Automated incident detection from event logs (Section 4.1 & 4.2).
Monitors the Event Log Database for abnormal activity, suppresses duplicates,
classifies incidents, and sends incident_query messages to the Incident Agent.
"""
import datetime
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.agents.base_agent import BaseAgent, MessageType, registry
from app.models.event_log import EventLogEntry
from app.models.imdb import IncidentRecord
from app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class SupervisorAgent(BaseAgent):
    """
    Supervisor Agent responsibilities (Section 4.1 & 4.2):
    - Reads unprocessed event logs (ERROR, CRITICAL)
    - Suppresses noise and duplicates (FR-5)
    - Extracts 4-tuple tags: Object, Type, Service, Problem
    - Generates incident_query message -> sends to Incident Agent
    - Records audit log entry
    """

    def __init__(self):
        super().__init__(
            name="SupervisorAgent",
            description="Automated incident detection from system event logs and noise suppression.",
        )
        self.is_monitoring = True
        self.last_poll_at: Optional[datetime.datetime] = None
        self.detected_count = 0
        self.suppressed_count = 0

    def classify_log_entry(self, log: EventLogEntry) -> Dict[str, str]:
        """
        Classify log message into 4-tuple tags for semantic matchmaking.
        """
        msg_lower = log.message.lower()
        src_lower = log.source_system.lower()

        # 1. Type determination
        if any(w in msg_lower or w in src_lower for w in ["network", "router", "switch", "dns", "firewall", "gateway", "unreachable"]):
            itype = "network"
        elif any(w in msg_lower or w in src_lower for w in ["disk", "cpu", "memory", "ram", "hardware", "fan", "sensor", "power"]):
            itype = "hardware"
        elif any(w in msg_lower or w in src_lower for w in ["auth", "security", "unauthorized", "forbidden", "breach", "ssl", "cert"]):
            itype = "security"
        elif any(w in msg_lower or w in src_lower for w in ["database", "sql", "postgres", "mysql", "deadlock", "mongo"]):
            itype = "application"
        else:
            itype = "application"

        # 2. Object determination
        if "printer" in msg_lower or "printer" in src_lower:
            obj = "printer"
        elif "browser" in msg_lower or "chrome" in msg_lower or "firefox" in msg_lower:
            obj = "web browser"
        elif "database" in msg_lower or "db" in src_lower or "sql" in msg_lower:
            obj = "database"
        elif "router" in msg_lower or "router" in src_lower:
            obj = "router"
        elif "server" in src_lower or "server" in msg_lower:
            obj = "server"
        else:
            obj = "server"

        # 3. Problem determination
        if any(w in msg_lower for w in ["timeout", "timed out", "latency"]):
            prob = "timeout"
        elif any(w in msg_lower for w in ["shutdown", "stopped", "killed", "terminated"]):
            prob = "shutdown"
        elif any(w in msg_lower for w in ["crash", "corrupt", "panic"]):
            prob = "crash"
        elif any(w in msg_lower for w in ["fault", "failure", "broken"]):
            prob = "fault"
        else:
            prob = "error"

        # 4. Service determination
        svc = log.service_name or "IT Operations"

        return {
            "object": obj,
            "type": itype,
            "service": svc,
            "problem": prob,
        }

    def poll_and_detect(self, db: Session) -> List[Dict[str, Any]]:
        """
        Poll event logs, detect new incidents, suppress duplicates,
        and dispatch queries to the Incident Agent.
        """
        if not self.is_connected or not self.is_monitoring:
            return []

        self.last_poll_at = datetime.datetime.utcnow()

        # Find unprocessed ERROR or CRITICAL logs
        unprocessed_logs = (
            db.query(EventLogEntry)
            .filter(
                EventLogEntry.processed_by_supervisor == False,  # noqa: E712
                EventLogEntry.log_level.in_(["ERROR", "CRITICAL"]),
            )
            .order_by(EventLogEntry.timestamp.asc())
            .limit(20)
            .all()
        )

        detected_incidents = []

        for log in unprocessed_logs:
            log.processed_by_supervisor = True

            # Duplicate check (FR-5): Look for open/assigned/in_progress incidents for same service and problem
            classification = self.classify_log_entry(log)
            existing_incident = (
                db.query(IncidentRecord)
                .filter(
                    IncidentRecord.service_tag == classification["service"],
                    IncidentRecord.problem_tag == classification["problem"],
                    IncidentRecord.status.in_(["open", "assigned", "in_progress"]),
                )
                .first()
            )

            if existing_incident:
                # Link log to existing incident and suppress duplicate creation
                log.incident_id = existing_incident.id
                self.suppressed_count += 1
                continue

            # Not a duplicate -> dispatch incident_query to Incident Agent
            self.detected_count += 1
            query_payload = {
                "object": classification["object"],
                "type": classification["type"],
                "service": classification["service"],
                "problem": classification["problem"],
                "description": f"Auto-detected from event log: {log.message} (Source: {log.source_system})",
                "source": "event_log",
                "event_log_id": log.id,
                "log_level": log.log_level,
            }

            self.send_message("IncidentAgent", MessageType.INCIDENT_QUERY, query_payload)
            detected_incidents.append(query_payload)

        db.commit()
        return detected_incidents


supervisor_agent = SupervisorAgent()
registry.register(supervisor_agent)
