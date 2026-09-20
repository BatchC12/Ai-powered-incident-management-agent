"""
Base Agent — Abstract foundation for all ITIL agents.
Implements agent lifecycle (connect/disconnect) and message passing.
"""
import datetime
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from enum import Enum


class MessageType(str, Enum):
    """ITIL agent message types (Section 4.3)."""
    INCIDENT_QUERY = "incident_query"
    INCIDENT_RESPONSE = "incident_response"
    INCIDENT_MATCHING = "incident_matching"
    INCIDENT_RECORD = "incident_record"
    SOLUTION_RECORD = "solution_record"
    INFO_REQUEST = "info_request"
    CONFIG_REQUEST = "config_request"
    SLA_NEGOTIATE = "sla_negotiate"
    SUPPORT_REQUEST = "support_request"
    PROBLEM_ALERT = "problem_alert"
    ESCALATION = "escalation"


@dataclass
class AgentMessage:
    """Message exchanged between ITIL agents."""
    sender: str
    receiver: str
    message_type: MessageType
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat())


class BaseAgent:
    """
    Abstract base for all ITIL agents.
    Provides lifecycle management and message handling.
    """

    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.is_connected = True
        self.message_log: List[AgentMessage] = []

    def connect(self):
        """Connect/activate the agent."""
        self.is_connected = True

    def disconnect(self):
        """Disconnect/deactivate the agent."""
        self.is_connected = False

    def get_status(self) -> Dict[str, Any]:
        """Return agent status information."""
        return {
            "name": self.name,
            "description": self.description,
            "is_connected": self.is_connected,
            "message_count": len(self.message_log),
        }

    def send_message(self, receiver: str, msg_type: MessageType, payload: Dict[str, Any]) -> AgentMessage:
        """Create and log an outgoing message."""
        msg = AgentMessage(
            sender=self.name,
            receiver=receiver,
            message_type=msg_type,
            payload=payload,
        )
        self.message_log.append(msg)
        return msg

    def receive_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """
        Process an incoming message. Override in subclasses.
        Returns a response message or None.
        """
        self.message_log.append(message)
        return None


class AgentRegistry:
    """
    Central registry of all ITIL agents.
    Used by the Administrator Agent and Orchestrator.
    """

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent):
        """Register an agent in the system."""
        self._agents[agent.name] = agent

    def unregister(self, name: str):
        """Remove an agent from the system."""
        self._agents.pop(name, None)

    def get(self, name: str) -> Optional[BaseAgent]:
        """Get an agent by name."""
        return self._agents.get(name)

    def get_all(self) -> List[BaseAgent]:
        """Get all registered agents."""
        return list(self._agents.values())

    def get_all_statuses(self) -> List[Dict[str, Any]]:
        """Get status of all agents."""
        return [a.get_status() for a in self._agents.values()]

    def connect_agent(self, name: str) -> bool:
        """Connect an agent."""
        agent = self._agents.get(name)
        if agent:
            agent.connect()
            return True
        return False

    def disconnect_agent(self, name: str) -> bool:
        """Disconnect an agent."""
        agent = self._agents.get(name)
        if agent:
            agent.disconnect()
            return True
        return False


# Global agent registry
registry = AgentRegistry()
