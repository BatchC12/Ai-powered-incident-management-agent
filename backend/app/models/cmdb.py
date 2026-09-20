"""
CMDB — Configuration Management Database and SLA Catalog.
Stores configuration items (CI) with impact/urgency data and SLA definitions.
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


class ConfigurationItem(Base):
    """
    CMDB Configuration Item.
    Provides impact and urgency data used by the Diagnostic Agent
    to compute severity (Section 4.2).
    """
    __tablename__ = "configuration_items"

    id = Column(Integer, primary_key=True, index=True)
    ci_name = Column(String(150), nullable=False, unique=True)
    ci_type = Column(String(50), nullable=False)
    # Valid: server, application, database, network_device, storage, security_appliance
    service_name = Column(String(100), nullable=False)
    impact_level = Column(Integer, nullable=False, default=3)    # 1 (highest) to 5 (lowest)
    urgency_level = Column(Integer, nullable=False, default=3)   # 1 (highest) to 5 (lowest)
    owner_team = Column(String(100), nullable=True)
    dependencies_json = Column(Text, nullable=True)   # JSON array of dependent CI names
    status = Column(String(30), nullable=False, default="active")
    # Valid: active, maintenance, decommissioned
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SLADefinition(Base):
    """
    SLA Catalog entry.
    Defines maximum resolution time and recurrence threshold per service/priority.
    Used by the Diagnostic Agent to determine allowed resolution time (FR-12).
    """
    __tablename__ = "sla_definitions"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    priority = Column(String(10), nullable=False)   # P1, P2, P3, P4
    max_resolution_time_minutes = Column(Integer, nullable=False)
    recurrence_threshold = Column(Integer, nullable=False, default=3)
    # Number of same incidents before problem manager is notified
    escalation_rules_json = Column(Text, nullable=True)
    # JSON: {"l1_minutes": 15, "l2_minutes": 30, "management_minutes": 45}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
