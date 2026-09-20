"""
Event Log Database.
System error activity read by the Supervisor Agent (Section 4.2).
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.core.database import Base


class EventLogEntry(Base):
    """
    Simulated event log entry from IT systems.
    The Supervisor Agent reads unprocessed entries to detect incidents (FR-1).
    """
    __tablename__ = "event_log_entries"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    source_system = Column(String(100), nullable=False)     # e.g., "web-server-01", "db-primary"
    service_name = Column(String(100), nullable=False)       # e.g., "Payment API", "Auth Service"
    log_level = Column(String(20), nullable=False)           # INFO, WARN, ERROR, CRITICAL
    message = Column(Text, nullable=False)

    # Processing state
    processed_by_supervisor = Column(Boolean, default=False)
    incident_id = Column(String(30), nullable=True)          # Set when Supervisor creates an incident
