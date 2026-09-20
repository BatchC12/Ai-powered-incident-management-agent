"""
Verification Test for MA-IMS Semantic Matchmaker and Agent Lifecycle.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.ontology.matchmaker import get_matchmaker
from app.core.database import SessionLocal, Base, engine
from app.agents.incident_agent import incident_agent
from app.agents.supervisor_agent import supervisor_agent
from app.agents.diagnostic_agent import diagnostic_agent
from app.agents.support_agent import get_support_agent
from app.models.imdb import IncidentRecord


def test_matchmaker_concept_matching():
    mm = get_matchmaker()

    # Exact match: web browser vs web browser -> Exact (3)
    deg, score = mm.matcher.match("web browser", "web browser")
    print(f"Match('web browser', 'web browser') -> {deg}, score={score}")
    assert deg == "exact" and score == 3, f"Expected exact/3, got {deg}/{score}"

    # Plug-in match: Concept A (ancestor) vs Concept B (descendant)
    # In ontology: HardwareObject is ancestor of Server
    deg_plugin, score_plugin = mm.matcher.match("hardwareobject", "server")
    print(f"Match('hardwareobject', 'server') -> {deg_plugin}, score={score_plugin}")
    assert deg_plugin == "plugin" and score_plugin == 2, f"Expected plugin/2, got {deg_plugin}/{score_plugin}"

    # Subsume match: Concept A (descendant) vs Concept B (ancestor)
    deg_sub, score_sub = mm.matcher.match("server", "hardwareobject")
    print(f"Match('server', 'hardwareobject') -> {deg_sub}, score={score_sub}")
    assert deg_sub == "subsume" and score_sub == 1, f"Expected subsume/1, got {deg_sub}/{score_sub}"

    # Fail match: unrelated concepts
    deg_fail, score_fail = mm.matcher.match("printer", "router")
    print(f"Match('printer', 'router') -> {deg_fail}, score={score_fail}")
    assert deg_fail == "fail" and score_fail == 0

    print("[PASS] Concept matching tests passed.")


def test_incident_query_flow():
    db = SessionLocal()
    try:
        mm = get_matchmaker()
        print(f"Current threshold: {mm.threshold}")

        # Test exact match submission (matching INC-1002: printer, hardware, printing, fault)
        exact_query = {
            "object": "printer",
            "type": "hardware",
            "service": "printing",
            "problem": "fault",
            "description": "Floor 2 printer is showing roller fault and dropping jobs",
            "source": "user_gui",
        }
        res = incident_agent.process_incident_query(exact_query, db)
        print("Submission result for exact query:", res)
        assert res["status"] == "resolved", f"Expected resolved status, got {res['status']}"
        assert res["match_type"] == "exact", f"Expected match_type exact, got {res['match_type']}"
        assert res["solution"] is not None

        # Test new unknown incident submission -> should go to Diagnostic Agent
        new_query = {
            "object": "server",
            "type": "hardware",
            "service": "Core Banking",
            "problem": "shutdown",
            "description": "Unexpected hardware shutdown on standby blade server",
            "source": "user_gui",
        }
        res_new = incident_agent.process_incident_query(new_query, db)
        print("Submission result for new query:", res_new)
        assert res_new["status"] in ["assigned", "open"]
        print("[PASS] Incident query flow tests passed.")
    finally:
        db.close()


if __name__ == "__main__":
    print("Running MA-IMS tests...")
    test_matchmaker_concept_matching()
    test_incident_query_flow()
    print("All tests PASSED successfully!")
