"""
User Agent — GUI front-end agent (Section 4.1).
Accepts incident reports from the web GUI and displays responses.
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent, MessageType


class UserAgent(BaseAgent):
    """
    User Agent responsibilities:
    - Fields: incident type, source, affected service, description
    - Generates incident_query on submit
    - Displays incident_response to the requester
    """

    def __init__(self):
        super().__init__(
            name="UserAgent",
            description="GUI front-end. Accepts incident reports and displays solutions to requesters.",
        )

    def create_incident_query(
        self,
        object_tag: str,
        type_tag: str,
        service_tag: str,
        problem_tag: str,
        description: str,
        reporter_id: int = None,
    ) -> Dict[str, Any]:
        """
        Build an incident_query payload from user input.
        Sent to the Incident Agent for processing.
        """
        payload = {
            "object": object_tag,
            "type": type_tag,
            "service": service_tag,
            "problem": problem_tag,
            "description": description,
            "source": "user_gui",
            "reporter_id": reporter_id,
        }
        msg = self.send_message("IncidentAgent", MessageType.INCIDENT_QUERY, payload)
        return msg.payload

    def format_response(self, incident_response: Dict[str, Any]) -> Dict[str, Any]:
        """Format the incident_response for display to the user."""
        return {
            "incident_id": incident_response.get("incident_id"),
            "status": incident_response.get("status"),
            "message": incident_response.get("message", ""),
            "solution": incident_response.get("solution"),
            "match_type": incident_response.get("match_type"),  # exact, possible, new
        }


user_agent = UserAgent()
