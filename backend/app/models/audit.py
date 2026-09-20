"""
Audit Log model — ITIL process traceability from incident to closure.
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    """
    Records every agent action for ITIL audit trail.
    Links back to the incident for full process traceability.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(30), ForeignKey("incident_records.id"), nullable=True)
    agent_name = Column(String(50), nullable=False)
    # e.g., "SupervisorAgent", "IncidentAgent", "DiagnosticAgent", "SupportAgent"
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("IncidentRecord", back_populates="audit_entries")
