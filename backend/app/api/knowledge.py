"""
Knowledge Base & OWL Ontology API Router.
Exposes the OWL incident ontology taxonomy, concept relationships, and verified solution repository.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.imdb import IncidentSolution, IncidentRecord
from app.ontology.matchmaker import get_matchmaker

router = APIRouter(prefix="/knowledge", tags=["Knowledge & Ontology"])


class AddConceptPayload(BaseModel):
    category: str  # object, type, service, problem
    concept_name: str
    parent_concept: Optional[str] = None


@router.get("/ontology")
def get_ontology_graph():
    """
    Return full OWL ontology taxonomy broken down by the 4 core dimensions:
    Object, Type, Service, Problem.
    """
    matchmaker = get_matchmaker()
    onto = matchmaker.ontology

    categories = ["object", "type", "service", "problem"]
    taxonomy = {}

    for cat in categories:
        top_uri = onto.get_uri(cat)
        if not top_uri:
            # Check capitalized
            top_uri = onto.get_uri(cat.capitalize())

        children_uris = onto.children.get(top_uri, []) if top_uri else []

        def build_tree(uri: str) -> Dict[str, Any]:
            label = onto.classes.get(uri, uri.split("#")[-1])
            sub_uris = onto.children.get(uri, [])
            return {
                "name": label,
                "uri": uri,
                "children": [build_tree(c) for c in sub_uris],
            }

        taxonomy[cat] = {
            "root": cat.capitalize(),
            "concepts": [build_tree(c) for c in children_uris],
        }

    return {
        "total_classes": len(onto.classes),
        "taxonomy": taxonomy,
        "classes_list": list(onto.classes.values()),
    }


@router.post("/ontology/concepts")
def add_ontology_concept(payload: AddConceptPayload):
    """
    Dynamically register a new concept in the in-memory ontology hierarchy.
    """
    matchmaker = get_matchmaker()
    onto = matchmaker.ontology

    name_clean = payload.concept_name.strip()
    parent_clean = (payload.parent_concept or payload.category).strip()

    parent_uri = onto.get_uri(parent_clean)
    if not parent_uri:
        parent_uri = onto.get_uri(payload.category)
        if not parent_uri:
            raise HTTPException(status_code=400, detail=f"Parent concept '{parent_clean}' not found.")

    new_uri = f"http://ma-ims.itil/ontology/incident#{name_clean.replace(' ', '')}"
    onto.classes[new_uri] = name_clean
    onto.label_to_uri[name_clean.lower()] = new_uri
    onto.parents[new_uri] = parent_uri
    onto.children.setdefault(parent_uri, []).append(new_uri)

    return {
        "success": True,
        "concept": name_clean,
        "parent": parent_clean,
        "uri": new_uri,
        "total_concepts": len(onto.classes),
    }


@router.get("/solutions")
def list_knowledge_solutions(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Browse stored solutions from the IMDB knowledge base."""
    solutions = (
        db.query(IncidentSolution)
        .order_by(desc(IncidentSolution.created_at))
        .limit(limit)
        .all()
    )

    results = []
    for s in solutions:
        inc = db.query(IncidentRecord).filter(IncidentRecord.id == s.incident_id).first()
        results.append({
            "id": s.id,
            "incident_id": s.incident_id,
            "incident_title": inc.title if inc else "Unknown Incident",
            "category": inc.assigned_support_category if inc else "general",
            "solution_text": s.solution_text,
            "resolution_method": s.resolution_method,
            "created_at": s.created_at,
        })
    return results
