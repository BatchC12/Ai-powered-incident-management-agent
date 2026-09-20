"""
User and SupportTeam models.
Five ITIL personas: end_user, support_staff, problem_manager, system_admin, it_service_manager.
"""
import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base


class User(Base):
    """System user with ITIL role."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=True)
    role = Column(String(30), nullable=False, default="end_user")
    # Valid roles: end_user, support_staff, problem_manager, system_admin, it_service_manager
    department = Column(String(100), nullable=True, default="IT Operations")
    support_category = Column(String(50), nullable=True)
    # Only for support_staff: hardware, software, network, database, security, cloud
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login_at = Column(DateTime, default=datetime.datetime.utcnow)


class SupportTeam(Base):
    """
    Support agent teams grouped by category (Section 4.1).
    Each team handles a specific incident category.
    """
    __tablename__ = "support_teams"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, unique=True)
    # hardware, software, network, database, security, cloud
    team_name = Column(String(100), nullable=False)
    description = Column(String(300), nullable=True)
    is_active = Column(Integer, nullable=False, default=1)
