"""
IMDB — Incident Management Database models.
Stores all incident records with the 4-tuple (Object, Type, Service, Problem)
and linked solutions, per the paper's IMDB specification.
"""
import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class IncidentRecord(Base):
    """
    Core ITIL incident record stored in the IMDB.
    Each incident is represented by a 4-tuple for semantic matchmaking:
      Object (O), Type (T), Service (S), Problem (P)
    """
    __tablename__ = "incident_records"

    id = Column(String(30), primary_key=True, index=True)            # INC-xxxx
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)

    # --- 4-Tuple Tags for Semantic Matchmaking (Section 6.1) ---
    object_tag = Column(String(100), nullable=False)     # Source of incident: web browser, printer, server…
    type_tag = Column(String(100), nullable=False)        # Object type: hardware, application, network…
    service_tag = Column(String(100), nullable=False)     # Affected service: printing, connection, mailing…
    problem_tag = Column(String(100), nullable=False)     # Problem: shutdown, error, fault, timeout…

    # --- ITIL Lifecycle ---
    status = Column(String(30), nullable=False, default="open")
    # Valid: open, assigned, in_progress, resolved, closed

    # --- Classification ---
    severity = Column(String(20), nullable=True)          # 1-Critical, 2-High, 3-Medium, 4-Low
    priority = Column(String(10), nullable=True)           # P1, P2, P3, P4
    impact = Column(String(20), nullable=True)             # Critical, High, Medium, Low
    urgency = Column(String(20), nullable=True)            # Critical, High, Medium, Low

    # --- SLA ---
    sla_allowed_time_minutes = Column(Integer, nullable=True)
    sla_breached = Column(Boolean, default=False)

    # --- Routing ---
    assigned_support_category = Column(String(50), nullable=True)  # hardware, software, network…
    assigned_agent_id = Column(String(50), nullable=True)

    # --- Source ---
    source = Column(String(30), nullable=False, default="user_gui")
    # Valid: event_log, user_gui

    # --- Recurrence / Problem Management ---
    productivity_rate = Column(Float, nullable=True, default=0.0)
    problem_manager_notified = Column(Boolean, default=False)

    # --- User ---
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # --- XML Representation ---
    xml_representation = Column(Text, nullable=True)

    # --- Timestamps ---
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    # Relationships
    solutions = relationship("IncidentSolution", back_populates="incident", cascade="all, delete-orphan")
    audit_entries = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan")


class IncidentSolution(Base):
    """
    Linked solution for a resolved incident.
    Stored for semantic matchmaking reuse by the Incident Agent.
    """
    __tablename__ = "incident_solutions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(30), ForeignKey("incident_records.id"), nullable=False)
    solution_text = Column(Text, nullable=False)
    resolution_method = Column(String(30), nullable=False, default="staff_resolved")
    # Valid: auto_reuse, staff_resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("IncidentRecord", back_populates="solutions")
