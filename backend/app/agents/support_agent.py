"""
Support Agent — Category-based resolution teams (Section 4.1).
Represents technical support teams (Hardware, Software, Network, Database, Security, Cloud).
Resolves incidents, stores solutions in IMDB for future reuse, and updates the incident lifecycle.
"""
import datetime
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.agents.base_agent import BaseAgent, MessageType, registry
from app.models.imdb import IncidentRecord, IncidentSolution
from app.models.audit import AuditLog
from app.models.xml_serializer import incident_to_xml

logger = logging.getLogger(__name__)

SUPPORT_CATEGORIES = [
    "hardware",
    "software",
    "network",
    "database",
    "security",
    "cloud",
]


class SupportAgent(BaseAgent):
    """
    Support Agent handling technical resolution for a specific category.
    """

    def __init__(self, category: str):
        self.category = category.lower()
        super().__init__(
            name=f"SupportAgent_{self.category.capitalize()}",
            description=f"Specialized support team for {self.category} incidents.",
        )

    def resolve_incident(
        self,
        incident_id: str,
        solution_text: str,
        staff_name: Optional[str],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Record resolution for an incident, update status, and persist solution.
        """
        incident = db.query(IncidentRecord).filter(IncidentRecord.id == incident_id).first()
        if not incident:
            return {"success": False, "message": f"Incident {incident_id} not found."}

        # 1. Add solution record to IMDB for future semantic matchmaking reuse
        solution = IncidentSolution(
            incident_id=incident.id,
            solution_text=solution_text,
            resolution_method="staff_resolved",
            created_at=datetime.datetime.utcnow(),
        )
        db.add(solution)

        # 2. Update incident state
        incident.status = "resolved"
        incident.resolved_at = datetime.datetime.utcnow()

        # Update XML representation
        incident.xml_representation = incident_to_xml(
            incident_id=incident.id,
            object_tag=incident.object_tag,
            type_tag=incident.type_tag,
            service_tag=incident.service_tag,
            problem_tag=incident.problem_tag,
            description=incident.description,
            solution=solution_text,
            status=incident.status,
            severity=incident.severity,
            priority=incident.priority,
        )

        # 3. Log Audit Entry
        staff_str = f" by staff member {staff_name}" if staff_name else ""
        db.add(
            AuditLog(
                incident_id=incident.id,
                agent_name=self.name,
                action="INCIDENT_RESOLVED",
                details=f"Resolved{staff_str}. Solution added to knowledge base: {solution_text[:100]}...",
            )
        )

        # 4. Notify User Agent that resolution is complete
        self.send_message(
            "UserAgent",
            MessageType.INCIDENT_RESPONSE,
            {
                "incident_id": incident.id,
                "status": "resolved",
                "solution": solution_text,
                "category": self.category,
            },
        )

        db.commit()
        return {
            "success": True,
            "incident_id": incident.id,
            "status": "resolved",
            "solution": solution_text,
        }


# Register a support agent instance for each category
support_agents: Dict[str, SupportAgent] = {}
for cat in SUPPORT_CATEGORIES:
    agent = SupportAgent(cat)
    support_agents[cat] = agent
    registry.register(agent)


def get_support_agent(category: str) -> SupportAgent:
    """Retrieve support agent for category, defaulting to software."""
    clean_cat = category.lower() if category else "software"
    return support_agents.get(clean_cat, support_agents["software"])
