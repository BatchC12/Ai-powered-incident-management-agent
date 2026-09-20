"""
Diagnostic Agent — Severity computation, SLA determination, and support routing (Section 4.1 & 4.2).
Computes incident severity from CMDB impact x urgency data, maps allowed resolution time
from SLA definitions, and routes incidents to the appropriate Support Agent.
"""
import datetime
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.agents.base_agent import BaseAgent, MessageType, registry
from app.models.imdb import IncidentRecord
from app.models.cmdb import ConfigurationItem, SLADefinition
from app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class DiagnosticAgent(BaseAgent):
    """
    Diagnostic Agent responsibilities:
    - Severity computation from Impact x Urgency matrix (FR-11)
    - SLA resolution time lookup from SLA Catalog (FR-12)
    - Support team assignment by category and severity (FR-13)
    - Priority-based queue ordering (FR-14)
    - SLA risk and escalation monitoring (FR-16)
    """

    def __init__(self):
        super().__init__(
            name="DiagnosticAgent",
            description="Computes severity from CMDB, assigns SLA resolution windows, and routes to Support Teams.",
        )

    def compute_severity_and_priority(
        self,
        service_name: str,
        db: Session,
    ) -> Dict[str, str]:
        """
        Compute severity and priority using CMDB Impact x Urgency.
        """
        # Lookup CI from CMDB
        ci = (
            db.query(ConfigurationItem)
            .filter(ConfigurationItem.service_name.ilike(f"%{service_name}%"))
            .first()
        )

        impact_num = ci.impact_level if ci else 3
        urgency_num = ci.urgency_level if ci else 3

        # Convert numeric 1-5 to descriptive terms
        level_to_desc = {1: "Critical", 2: "High", 3: "Medium", 4: "Low", 5: "Very Low"}
        impact_str = level_to_desc.get(impact_num, "Medium")
        urgency_str = level_to_desc.get(urgency_num, "Medium")

        # Severity Matrix calculation (ITIL standard)
        matrix_score = impact_num * urgency_num

        if matrix_score <= 2 or (impact_num == 1 and urgency_num <= 2):
            severity = "1-Critical"
            priority = "P1"
        elif matrix_score <= 6 or (impact_num <= 2 and urgency_num <= 3):
            severity = "2-High"
            priority = "P2"
        elif matrix_score <= 12:
            severity = "3-Medium"
            priority = "P3"
        else:
            severity = "4-Low"
            priority = "P4"

        return {
            "impact": impact_str,
            "urgency": urgency_str,
            "severity": severity,
            "priority": priority,
        }

    def determine_sla_allowed_time(
        self,
        service_name: str,
        priority: str,
        db: Session,
    ) -> int:
        """
        Fetch allowed resolution time in minutes from SLA catalog (FR-12).
        """
        sla_entry = (
            db.query(SLADefinition)
            .filter(
                SLADefinition.service_name.ilike(f"%{service_name}%"),
                SLADefinition.priority == priority,
            )
            .first()
        )

        if sla_entry:
            return sla_entry.max_resolution_time_minutes

        # Default fallback SLA matrix
        defaults = {
            "P1": 60,     # 1 hour
            "P2": 240,    # 4 hours
            "P3": 480,    # 8 hours
            "P4": 1440,   # 24 hours
        }
        return defaults.get(priority, 240)

    def determine_support_category(self, incident: IncidentRecord) -> str:
        """
        Determine which support team category should handle the incident.
        """
        type_lower = (incident.type_tag or "").lower()
        obj_lower = (incident.object_tag or "").lower()
        svc_lower = (incident.service_tag or "").lower()

        if "network" in type_lower or "router" in obj_lower or "connection" in svc_lower:
            return "network"
        elif "hardware" in type_lower or "printer" in obj_lower or "server" in obj_lower and "hardware" in type_lower:
            return "hardware"
        elif "security" in type_lower or "auth" in svc_lower:
            return "security"
        elif "database" in obj_lower or "sql" in svc_lower:
            return "database"
        elif "cloud" in svc_lower:
            return "cloud"
        else:
            return "software"

    def diagnose_and_route(
        self,
        incident: IncidentRecord,
        db: Session,
        possible_matches: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Execute full diagnostic cycle: compute severity, set SLA, and assign to support.
        """
        # 1. Severity & Priority
        diag_metrics = self.compute_severity_and_priority(incident.service_tag, db)
        incident.impact = diag_metrics["impact"]
        incident.urgency = diag_metrics["urgency"]
        incident.severity = diag_metrics["severity"]
        incident.priority = diag_metrics["priority"]

        # 2. SLA allowed time
        allowed_minutes = self.determine_sla_allowed_time(
            incident.service_tag, incident.priority, db
        )
        incident.sla_allowed_time_minutes = allowed_minutes

        # 3. Route to Support Agent
        target_category = self.determine_support_category(incident)
        incident.assigned_support_category = target_category
        incident.status = "assigned"

        # 4. Message Support Agent
        support_agent_name = f"SupportAgent_{target_category.capitalize()}"
        self.send_message(
            support_agent_name,
            MessageType.SUPPORT_REQUEST,
            {
                "incident_id": incident.id,
                "priority": incident.priority,
                "severity": incident.severity,
                "category": target_category,
                "possible_matches": possible_matches or [],
            },
        )

        # 5. Audit Log
        db.add(
            AuditLog(
                incident_id=incident.id,
                agent_name=self.name,
                action="DIAGNOSED_AND_ROUTED",
                details=(
                    f"Computed Severity: {incident.severity}, Priority: {incident.priority} "
                    f"(Impact: {incident.impact}, Urgency: {incident.urgency}). "
                    f"Assigned to {target_category} support team with {allowed_minutes}m SLA."
                ),
            )
        )

        return {
            "severity": incident.severity,
            "priority": incident.priority,
            "sla_minutes": allowed_minutes,
            "category": target_category,
        }


diagnostic_agent = DiagnosticAgent()
registry.register(diagnostic_agent)
