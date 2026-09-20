"""
Administrator Agent — System management (Section 4.1).
Manages agent connections, configuration, and system resources.
"""
from typing import Dict, Any
from app.agents.base_agent import BaseAgent, MessageType, registry
from app.ontology.matchmaker import get_matchmaker


class AdministratorAgent(BaseAgent):
    """
    Administrator Agent responsibilities:
    - Connect/disconnect agents (FR-21, FR-23)
    - Update IMDB and CMDB configuration
    - Configure matchmaking weight factors and threshold (FR-22)
    """

    def __init__(self):
        super().__init__(
            name="AdministratorAgent",
            description="Manages agent connections, resources, and configuration.",
        )

    def connect_agent(self, agent_name: str) -> Dict[str, Any]:
        """Connect an agent to the system."""
        success = registry.connect_agent(agent_name)
        self.send_message(agent_name, MessageType.CONFIG_REQUEST, {
            "action": "connect", "success": success,
        })
        return {"agent": agent_name, "connected": success}

    def disconnect_agent(self, agent_name: str) -> Dict[str, Any]:
        """Disconnect an agent from the system."""
        success = registry.disconnect_agent(agent_name)
        self.send_message(agent_name, MessageType.CONFIG_REQUEST, {
            "action": "disconnect", "success": success,
        })
        return {"agent": agent_name, "disconnected": success}

    def get_all_agents(self):
        """List all agents and their connection status."""
        return registry.get_all_statuses()

    def update_matchmaking_config(
        self,
        sfactor: float,
        ofactor: float,
        pfactor: float,
        tfactor: float,
    ) -> Dict[str, Any]:
        """
        Update semantic matchmaking weight factors (FR-22).
        Threshold is recalculated automatically.
        """
        matchmaker = get_matchmaker()
        matchmaker.update_factors(sfactor, ofactor, pfactor, tfactor)
        return {
            "factors": matchmaker.factors,
            "threshold": matchmaker.threshold,
        }

    def get_matchmaking_config(self) -> Dict[str, Any]:
        """Get current matchmaking configuration."""
        matchmaker = get_matchmaker()
        return {
            "factors": matchmaker.factors,
            "threshold": matchmaker.threshold,
        }


admin_agent = AdministratorAgent()
