"""
MA-IMS Configuration
ITIL-compliant settings: matchmaking factors, SLA defaults, Supervisor polling.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "MA-IMS — ITIL Multi-Agent Incident Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite:///./ma_ims.db"

    # --- Semantic Matchmaking Configuration (Section 6) ---
    # Weight factors for each tag in the 4-tuple similarity scoring
    MATCHMAKING_SFACTOR: float = 1.0   # Service factor
    MATCHMAKING_OFACTOR: float = 1.0   # Object factor
    MATCHMAKING_PFACTOR: float = 1.0   # Problem factor
    MATCHMAKING_TFACTOR: float = 1.0   # Type factor
    # Threshold = 3 * sum(factors) → exact match on all tags
    MATCHMAKING_THRESHOLD: float = 12.0

    # --- Supervisor Agent Configuration ---
    SUPERVISOR_POLL_INTERVAL_SECONDS: int = 30
    SUPERVISOR_ENABLED: bool = True

    # --- SLA Defaults ---
    SLA_DEFAULT_P1_MINUTES: int = 60
    SLA_DEFAULT_P2_MINUTES: int = 240
    SLA_DEFAULT_P3_MINUTES: int = 480
    SLA_DEFAULT_P4_MINUTES: int = 1440

    # --- Productivity Rate / Problem Manager ---
    PRODUCTIVITY_RATE_THRESHOLD: float = 0.15  # 15% recurrence triggers alert

    # --- Security ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ma-ims-itil-secret-key-v1")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    class Config:
        case_sensitive = True


settings = Settings()
