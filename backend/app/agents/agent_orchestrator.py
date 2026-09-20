"""
Agent Orchestrator — Central message coordinator and background task runner (Section 4.4).
Coordinates multi-agent communication and runs the periodic Supervisor Agent polling loop.
"""
import asyncio
import logging
import threading
import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.agents.base_agent import registry
from app.agents.user_agent import user_agent
from app.agents.administrator_agent import admin_agent
from app.agents.supervisor_agent import supervisor_agent
from app.agents.incident_agent import incident_agent
from app.agents.diagnostic_agent import diagnostic_agent
from app.agents.support_agent import get_support_agent

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Coordinates lifecycle and message dispatch across the 6 ITIL agents.
    """

    def __init__(self):
        self.polling_thread: Optional[threading.Thread] = None
        self.is_running = False
        self.poll_interval_seconds = 15

    def start_background_supervisor(self):
        """Start background daemon thread for Supervisor Agent polling."""
        if self.is_running:
            return

        self.is_running = True

        def run_loop():
            logger.info("Supervisor Agent background polling loop started.")
            while self.is_running:
                try:
                    db: Session = SessionLocal()
                    try:
                        detected = supervisor_agent.poll_and_detect(db)
                        if detected:
                            for item in detected:
                                incident_agent.process_incident_query(item, db)
                    finally:
                        db.close()
                except Exception as e:
                    logger.error(f"Error in Supervisor Agent poll loop: {e}")

                time.sleep(self.poll_interval_seconds)
            logger.info("Supervisor Agent background polling loop stopped.")

        self.polling_thread = threading.Thread(target=run_loop, daemon=True)
        self.polling_thread.start()

    def stop_background_supervisor(self):
        """Stop background daemon thread."""
        self.is_running = False
        if self.polling_thread and self.polling_thread.is_alive():
            self.polling_thread.join(timeout=2.0)

    def get_system_status(self) -> Dict[str, Any]:
        """Return status of all registered agents and supervisor monitor."""
        return {
            "is_supervisor_running": self.is_running,
            "poll_interval_seconds": self.poll_interval_seconds,
            "agents": registry.get_all_statuses(),
        }


# Global orchestrator singleton
orchestrator = AgentOrchestrator()
