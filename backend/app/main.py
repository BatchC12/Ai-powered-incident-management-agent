"""
MA-IMS FastAPI Main Application.
ITIL-Compliant Multi-Agent Incident Management System.
"""
import sys
import os
from contextlib import asynccontextmanager

# Add root project path and backend path to Python sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models  # Ensure all models are registered with Base.metadata
from app.api import incidents, knowledge, auth, supervisor, admin, dashboard
from app.agents.agent_orchestrator import orchestrator


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize tables and background agents."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Start Supervisor Agent background monitoring
    orchestrator.start_background_supervisor()

    yield

    # Cleanup background tasks on shutdown
    orchestrator.stop_background_supervisor()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(supervisor.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs",
        "architecture": "ITIL-Compliant Multi-Agent System (Latrache et al. 2015)",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8008, reload=True)
