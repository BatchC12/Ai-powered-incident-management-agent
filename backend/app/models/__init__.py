# Models package — import all models so Base.metadata sees them
from app.models.imdb import IncidentRecord, IncidentSolution  # noqa: F401
from app.models.cmdb import ConfigurationItem, SLADefinition  # noqa: F401
from app.models.event_log import EventLogEntry  # noqa: F401
from app.models.users import User, SupportTeam  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401
