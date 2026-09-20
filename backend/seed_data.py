"""
MA-IMS Seed Data Script.
Seeds the database with:
- 5 ITIL user personas and support teams
- 10+ CMDB Configuration Items (CIs)
- Complete SLA Catalog definitions
- 8 Historical resolved incidents with solutions and XML records (for semantic matchmaking warmup)
- Initial Event Log entries for Supervisor Agent detection demo
"""
import sys
import os
import datetime

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.users import User, SupportTeam
from app.models.cmdb import ConfigurationItem, SLADefinition
from app.models.imdb import IncidentRecord, IncidentSolution
from app.models.event_log import EventLogEntry
from app.models.audit import AuditLog
from app.models.xml_serializer import incident_to_xml
from app.core.security import get_password_hash


def seed_database():
    print("[+] Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping full seed.")
            return

        print("[+] Seeding ITIL Users...")
        users = [
            User(
                name="System Administrator",
                email="admin@itil.org",
                hashed_password=get_password_hash("password"),
                role="system_admin",
                department="IT Infrastructure",
            ),
            User(
                name="Alex Vance (End User)",
                email="alex.user@enterprise.org",
                hashed_password=get_password_hash("password"),
                role="end_user",
                department="Finance Operations",
            ),
            User(
                name="Sarah Connor (Software Support)",
                email="sarah.soft@enterprise.org",
                hashed_password=get_password_hash("password"),
                role="support_staff",
                department="Application Engineering",
                support_category="software",
            ),
            User(
                name="Gordon Freeman (Network Support)",
                email="gordon.net@enterprise.org",
                hashed_password=get_password_hash("password"),
                role="support_staff",
                department="Network Operations",
                support_category="network",
            ),
            User(
                name="Ellen Ripley (Problem Manager)",
                email="ellen.problem@enterprise.org",
                hashed_password=get_password_hash("password"),
                role="problem_manager",
                department="IT Quality & Continuity",
            ),
            User(
                name="Marcus Brody (IT Service Manager)",
                email="marcus.manager@enterprise.org",
                hashed_password=get_password_hash("password"),
                role="it_service_manager",
                department="IT Executive Office",
            ),
        ]
        db.add_all(users)
        db.commit()

        print("[+] Seeding Support Teams...")
        categories = [
            ("hardware", "Hardware Support Team", "L1/L2 server, printer, and device technicians"),
            ("software", "Software & App Support", "Enterprise application and web service support"),
            ("network", "Network Operations Team", "LAN, WAN, VPN, and routing specialists"),
            ("database", "Database Administration", "PostgreSQL, MySQL, and Redis specialists"),
            ("security", "Cybersecurity & IAM", "Access control, SSL certificates, and threat management"),
            ("cloud", "Cloud Infrastructure Team", "AWS, GCP, and Kubernetes cloud platform engineering"),
        ]
        teams = [SupportTeam(category=c, team_name=n, description=d) for c, n, d in categories]
        db.add_all(teams)
        db.commit()

        print("[+] Seeding CMDB Configuration Items...")
        cis = [
            ConfigurationItem(
                ci_name="prod-web-01",
                ci_type="server",
                service_name="Payment Gateway",
                impact_level=1,
                urgency_level=2,
                owner_team="software",
                dependencies_json='["prod-db-cluster", "edge-router-01"]',
            ),
            ConfigurationItem(
                ci_name="prod-db-cluster",
                ci_type="database",
                service_name="Core Banking",
                impact_level=1,
                urgency_level=1,
                owner_team="database",
                dependencies_json='["storage-san-01"]',
            ),
            ConfigurationItem(
                ci_name="edge-router-01",
                ci_type="network_device",
                service_name="Internet Gateway",
                impact_level=1,
                urgency_level=1,
                owner_team="network",
                dependencies_json='[]',
            ),
            ConfigurationItem(
                ci_name="auth-oauth2-svc",
                ci_type="application",
                service_name="Single Sign-On",
                impact_level=1,
                urgency_level=2,
                owner_team="security",
                dependencies_json='["prod-db-cluster"]',
            ),
            ConfigurationItem(
                ci_name="printer-hq-fl2",
                ci_type="hardware",
                service_name="Printing Service",
                impact_level=4,
                urgency_level=4,
                owner_team="hardware",
                dependencies_json='[]',
            ),
            ConfigurationItem(
                ci_name="corp-mail-exchange",
                ci_type="server",
                service_name="Corporate Mailing",
                impact_level=2,
                urgency_level=2,
                owner_team="software",
                dependencies_json='["edge-router-01"]',
            ),
            ConfigurationItem(
                ci_name="vpn-gateway-hq",
                ci_type="network_device",
                service_name="Remote Access VPN",
                impact_level=2,
                urgency_level=2,
                owner_team="network",
                dependencies_json='["edge-router-01"]',
            ),
        ]
        db.add_all(cis)
        db.commit()

        print("[+] Seeding SLA Catalog...")
        sla_entries = [
            SLADefinition(service_name="Payment Gateway", priority="P1", max_resolution_time_minutes=60, recurrence_threshold=2),
            SLADefinition(service_name="Payment Gateway", priority="P2", max_resolution_time_minutes=180, recurrence_threshold=3),
            SLADefinition(service_name="Core Banking", priority="P1", max_resolution_time_minutes=45, recurrence_threshold=2),
            SLADefinition(service_name="Single Sign-On", priority="P1", max_resolution_time_minutes=60, recurrence_threshold=3),
            SLADefinition(service_name="Single Sign-On", priority="P2", max_resolution_time_minutes=240, recurrence_threshold=3),
            SLADefinition(service_name="Internet Gateway", priority="P1", max_resolution_time_minutes=60, recurrence_threshold=2),
            SLADefinition(service_name="Corporate Mailing", priority="P2", max_resolution_time_minutes=240, recurrence_threshold=4),
            SLADefinition(service_name="Printing Service", priority="P4", max_resolution_time_minutes=1440, recurrence_threshold=5),
        ]
        db.add_all(sla_entries)
        db.commit()

        print("[+] Seeding Historical Resolved Incidents into IMDB...")
        now = datetime.datetime.utcnow()
        historical_cases = [
            {
                "id": "INC-1001",
                "title": "Corporate Mailing: timeout on web browser",
                "desc": "Users experiencing connection timeout when opening corporate webmail via web browser.",
                "obj": "web browser",
                "type": "application",
                "svc": "mailing",
                "prob": "timeout",
                "sol": "Flush client DNS cache (ipconfig /flushdns) and clear web browser SSL state.",
                "cat": "software",
                "pri": "P2",
                "sev": "2-High",
            },
            {
                "id": "INC-1002",
                "title": "Printing Service: fault on printer",
                "desc": "Floor 2 network printer reports paper jam fault and drops print queue jobs.",
                "obj": "printer",
                "type": "hardware",
                "svc": "printing",
                "prob": "fault",
                "sol": "Clear tray 2 pickup rollers with isopropyl alcohol and power-cycle printer to reset queue.",
                "cat": "hardware",
                "pri": "P4",
                "sev": "4-Low",
            },
            {
                "id": "INC-1003",
                "title": "Internet Gateway: shutdown on router",
                "desc": "Edge router BGP session shut down unexpectedly following link flapping.",
                "obj": "router",
                "type": "network",
                "svc": "connection",
                "prob": "shutdown",
                "sol": "Reset primary BGP neighbor interface and restore MTU clamping to 1420 bytes.",
                "cat": "network",
                "pri": "P1",
                "sev": "1-Critical",
            },
            {
                "id": "INC-1004",
                "title": "Core Banking: error on database",
                "desc": "Database transaction log disk full causing SQL connection errors.",
                "obj": "database",
                "type": "application",
                "svc": "connection",
                "prob": "error",
                "sol": "Purge stale WAL archive segments and expand storage volume by 50GB.",
                "cat": "database",
                "pri": "P1",
                "sev": "1-Critical",
            },
            {
                "id": "INC-1005",
                "title": "Single Sign-On: timeout on server",
                "desc": "OAuth token issuance requests timing out due to LDAP server latency.",
                "obj": "server",
                "type": "application",
                "svc": "authentication",
                "prob": "timeout",
                "sol": "Increase LDAP connection pool size and enable persistent connection keep-alives.",
                "cat": "security",
                "pri": "P2",
                "sev": "2-High",
            },
        ]

        for case in historical_cases:
            xml_data = incident_to_xml(
                incident_id=case["id"],
                object_tag=case["obj"],
                type_tag=case["type"],
                service_tag=case["svc"],
                problem_tag=case["prob"],
                description=case["desc"],
                solution=case["sol"],
                status="resolved",
                severity=case["sev"],
                priority=case["pri"],
            )

            created_time = now - datetime.timedelta(days=2, hours=3)
            resolved_time = created_time + datetime.timedelta(minutes=35)

            inc = IncidentRecord(
                id=case["id"],
                title=case["title"],
                description=case["desc"],
                object_tag=case["obj"],
                type_tag=case["type"],
                service_tag=case["svc"],
                problem_tag=case["prob"],
                status="resolved",
                severity=case["sev"],
                priority=case["pri"],
                impact="High" if "1" in case["pri"] or "2" in case["pri"] else "Low",
                urgency="High" if "1" in case["pri"] else "Medium",
                sla_allowed_time_minutes=240,
                sla_breached=False,
                assigned_support_category=case["cat"],
                source="user_gui",
                productivity_rate=0.05,
                xml_representation=xml_data,
                created_at=created_time,
                resolved_at=resolved_time,
            )
            db.add(inc)
            db.flush()

            sol = IncidentSolution(
                incident_id=inc.id,
                solution_text=case["sol"],
                resolution_method="staff_resolved",
                created_at=resolved_time,
            )
            db.add(sol)

            db.add(
                AuditLog(
                    incident_id=inc.id,
                    agent_name="SupportAgent",
                    action="INCIDENT_RESOLVED",
                    details=f"Historical seed resolution applied: {case['sol']}",
                    timestamp=resolved_time,
                )
            )

        db.commit()

        print("[+] Seeding Event Log Entries for Supervisor Agent...")
        sample_logs = [
            EventLogEntry(
                source_system="prod-web-01",
                service_name="Payment Gateway",
                log_level="CRITICAL",
                message="HTTP 504 Gateway Timeout detected on /v1/checkout endpoint after 30000ms",
                processed_by_supervisor=False,
            ),
            EventLogEntry(
                source_system="printer-hq-fl2",
                service_name="Printing Service",
                log_level="ERROR",
                message="Print spooler queue failure: Tray 2 sensor reported mechanical roller fault",
                processed_by_supervisor=False,
            ),
            EventLogEntry(
                source_system="vpn-gateway-hq",
                service_name="Remote Access VPN",
                log_level="WARN",
                message="Tunnel handshake retransmissions exceeded 5% threshold on interface tun0",
                processed_by_supervisor=False,
            ),
            EventLogEntry(
                source_system="corp-mail-exchange",
                service_name="Corporate Mailing",
                log_level="INFO",
                message="Health check passed: inbound SMTP queue length 2",
                processed_by_supervisor=True,
            ),
        ]
        db.add_all(sample_logs)
        db.commit()

        print("[OK] Database successfully seeded with ITIL MA-IMS baseline data.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
