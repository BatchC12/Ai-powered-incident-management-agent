"""
Incident Agent — Core incident processing and semantic matchmaking (Section 4.1 & Section 6).
Receives incident queries, persists XML incident records in IMDB, runs semantic matchmaking,
reuses existing solutions for exact matches, calculates productivity rate, and delegates new
incidents to the Diagnostic Agent.
"""
import datetime
import logging
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.agents.base_agent import BaseAgent, MessageType, registry
from app.models.imdb import IncidentRecord, IncidentSolution
from app.models.audit import AuditLog
from app.models.xml_serializer import incident_to_xml
from app.ontology.matchmaker import get_matchmaker

logger = logging.getLogger(__name__)


class IncidentAgent(BaseAgent):
    """
    Incident Agent responsibilities:
    - Receives incident_query messages
    - Persists incident record in IMDB with XML representation (FR-4)
    - Runs semantic matchmaking against resolved incidents (FR-6, FR-7)
    - If Exact Match: auto-reuses solution, marks resolved, updates productivity rate (FR-8, FR-10)
    - If SLA threshold exceeded: raises problem manager alert (FR-10, FR-20)
    - If Possible Match / No Match: forwards to Diagnostic Agent (FR-9, FR-11)
    """

    def __init__(self):
        super().__init__(
            name="IncidentAgent",
            description="Processes incident queries, runs OWL semantic matchmaking, and manages the IMDB.",
        )

    def _generate_incident_id(self, db: Session) -> str:
        """Generate a sequential incident ID like INC-1001."""
        count = db.query(IncidentRecord).count()
        return f"INC-{1001 + count}"

    def calculate_productivity_rate(self, db: Session, service: str, problem: str) -> float:
        """
        Calculates recurrence / productivity rate for similar incidents (Section 4.4):
        productivity_rate = count(same service & problem) / total_incidents
        """
        total = db.query(IncidentRecord).count()
        if total == 0:
            return 0.0
        same_count = (
            db.query(IncidentRecord)
            .filter(
                IncidentRecord.service_tag == service,
                IncidentRecord.problem_tag == problem,
            )
            .count()
        )
        return round(same_count / float(total), 4)

    def process_incident_query(self, query_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Main entry point for handling an incident query.
        Implements the complete matchmaking decision flow.
        """
        inc_id = self._generate_incident_id(db)
        object_tag = query_data.get("object", "server")
        type_tag = query_data.get("type", "application")
        service_tag = query_data.get("service", "IT Service")
        problem_tag = query_data.get("problem", "error")
        description = query_data.get("description", "")
        source = query_data.get("source", "user_gui")
        reporter_id = query_data.get("reporter_id")

        title = f"{service_tag}: {problem_tag} on {object_tag}"

        xml_content = incident_to_xml(
            incident_id=inc_id,
            object_tag=object_tag,
            type_tag=type_tag,
            service_tag=service_tag,
            problem_tag=problem_tag,
            description=description,
            status="open",
        )

        incident = IncidentRecord(
            id=inc_id,
            title=title,
            description=description,
            object_tag=object_tag,
            type_tag=type_tag,
            service_tag=service_tag,
            problem_tag=problem_tag,
            status="open",
            source=source,
            reporter_id=reporter_id,
            xml_representation=xml_content,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(incident)
        db.flush()

        # Audit log creation
        db.add(
            AuditLog(
                incident_id=inc_id,
                agent_name=self.name,
                action="INCIDENT_RECORDED",
                details=f"Incident {inc_id} logged via {source}. 4-Tuple: ({object_tag}, {type_tag}, {service_tag}, {problem_tag})",
            )
        )

        # 1. Gather historical resolved incidents with solutions
        resolved_incidents = (
            db.query(IncidentRecord)
            .filter(
                IncidentRecord.id != inc_id,
                IncidentRecord.status.in_(["resolved", "closed"]),
            )
            .all()
        )

        stored_pool = []
        for r in resolved_incidents:
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

        # 2. Run Semantic Matchmaking (Section 6)
        matchmaker = get_matchmaker()
        incident_query_tags = {
            "object": object_tag,
            "type": type_tag,
            "service": service_tag,
            "problem": problem_tag,
        }
        exact_matches, possible_matches = matchmaker.find_matches(incident_query_tags, stored_pool)

        # 3. Decision tree
        if exact_matches:
            # Case A: Exact Match Found -> Auto-Reuse Solution
            best_match = exact_matches[0]
            solution_text = best_match.get("solution")

            incident.status = "resolved"
            incident.resolved_at = datetime.datetime.utcnow()

            # Add solution record
            new_solution = IncidentSolution(
                incident_id=inc_id,
                solution_text=f"[Auto-Reused from {best_match['id']} (Score: {best_match['score']:.1f})] {solution_text}",
                resolution_method="auto_reuse",
            )
            db.add(new_solution)

            # Recalculate productivity rate
            prod_rate = self.calculate_productivity_rate(db, service_tag, problem_tag)
            incident.productivity_rate = prod_rate

            # Check recurrence / SLA threshold for Problem Manager notification (FR-10, FR-20)
            if prod_rate >= 0.15:
                incident.problem_manager_notified = True
                self.send_message(
                    "ProblemManager",
                    MessageType.PROBLEM_ALERT,
                    {
                        "incident_id": inc_id,
                        "service": service_tag,
                        "problem": problem_tag,
                        "productivity_rate": prod_rate,
                        "message": f"High recurrence alert: {service_tag} - {problem_tag} recurrence rate is {prod_rate*100:.1f}%",
                    },
                )
                db.add(
                    AuditLog(
                        incident_id=inc_id,
                        agent_name=self.name,
                        action="PROBLEM_MANAGER_NOTIFIED",
                        details=f"High incident recurrence ({prod_rate*100:.1f}%). Alert sent to Problem Manager.",
                    )
                )

            db.add(
                AuditLog(
                    incident_id=inc_id,
                    agent_name=self.name,
                    action="SOLUTION_AUTO_REUSED",
                    details=f"Exact match found with {best_match['id']} (Score: {best_match['score']:.1f}). Solution auto-applied.",
                )
            )
            db.commit()

            return {
                "incident_id": inc_id,
                "status": "resolved",
                "match_type": "exact",
                "solution": solution_text,
                "matched_incident_id": best_match["id"],
                "score": best_match["score"],
                "exact_matches": exact_matches,
                "possible_matches": possible_matches,
                "message": f"Exact match found ({best_match['id']}). Solution automatically applied.",
            }

        else:
            # Case B: No Exact Match -> Forward to Diagnostic Agent
            diagnostic_agent = registry.get("DiagnosticAgent")
            if diagnostic_agent and diagnostic_agent.is_connected:
                diag_result = diagnostic_agent.diagnose_and_route(incident, db, possible_matches)
                db.commit()
                return {
                    "incident_id": inc_id,
                    "status": incident.status,
                    "match_type": "possible" if possible_matches else "none",
                    "priority": incident.priority,
                    "severity": incident.severity,
                    "assigned_team": incident.assigned_support_category,
                    "sla_minutes": incident.sla_allowed_time_minutes,
                    "exact_matches": [],
                    "possible_matches": possible_matches,
                    "message": "No exact match found. Forwarded to Diagnostic Agent for triage and Support Agent assignment.",
                }
            else:
                db.commit()
                return {
                    "incident_id": inc_id,
                    "status": "open",
                    "match_type": "none",
                    "exact_matches": [],
                    "possible_matches": possible_matches,
                    "message": "Incident logged. Diagnostic Agent unavailable; incident remains open.",
                }


incident_agent = IncidentAgent()
registry.register(incident_agent)
