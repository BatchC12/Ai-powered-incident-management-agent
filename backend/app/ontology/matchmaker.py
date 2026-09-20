"""
Semantic Matchmaking Engine (Section 6).

Implements the paper's 4-tuple concept matching algorithm using the OWL ontology.
Uses XML/RDF parsing (no owlready2 dependency) to traverse the ontology hierarchy.

Concept Match Function (Section 6.2):
  Exact   = 3  (concepts identical)
  Plug-in = 2  (A includes B — A is ancestor of B)
  Subsume = 1  (A is more specific than B — A is descendant of B)
  Fail    = 0  (concepts unrelated)

Scoring (Section 6.3):
  Per-tag score = Match(IQ_tag, SI_tag) × weight_factor
  Similarity    = Σ over 4 tags of weighted match scores
  score > threshold → Exact Incident Table
  0 < score ≤ threshold → Possible Incident Table
  score = 0 → no match
"""
import os
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET


# Namespace map for parsing the OWL/RDF file
NS = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
}
BASE_URI = "http://ma-ims.itil/ontology/incident#"


class OntologyGraph:
    """
    Lightweight in-memory representation of the OWL class hierarchy.
    Parses the .owl file and builds parent→children / child→parent maps.
    """

    def __init__(self):
        self.classes: Dict[str, str] = {}          # uri → label
        self.parents: Dict[str, str] = {}           # uri → parent_uri
        self.children: Dict[str, List[str]] = {}    # uri → [child_uris]
        self.label_to_uri: Dict[str, str] = {}      # lowercase label → uri

    def load(self, owl_path: str):
        """Parse the OWL/RDF file and populate the graph."""
        tree = ET.parse(owl_path)
        root = tree.getroot()

        for cls_elem in root.findall("owl:Class", NS):
            uri = cls_elem.get(f"{{{NS['rdf']}}}about", "")
            label_elem = cls_elem.find("rdfs:label", NS)
            label = label_elem.text if label_elem is not None else uri.split("#")[-1]

            self.classes[uri] = label
            self.label_to_uri[label.lower()] = uri

            # Find parent via rdfs:subClassOf
            sub_elem = cls_elem.find("rdfs:subClassOf", NS)
            if sub_elem is not None:
                parent_uri = sub_elem.get(f"{{{NS['rdf']}}}resource", "")
                self.parents[uri] = parent_uri
                self.children.setdefault(parent_uri, []).append(uri)

    def get_uri(self, concept_name: str) -> Optional[str]:
        """Resolve a concept name (case-insensitive) to its URI."""
        return self.label_to_uri.get(concept_name.lower())

    def get_ancestors(self, uri: str) -> List[str]:
        """Return list of ancestor URIs (parent chain up to root)."""
        ancestors = []
        current = uri
        while current in self.parents:
            current = self.parents[current]
            ancestors.append(current)
        return ancestors

    def get_descendants(self, uri: str) -> List[str]:
        """Return list of all descendant URIs."""
        descendants = []
        stack = list(self.children.get(uri, []))
        while stack:
            child = stack.pop()
            descendants.append(child)
            stack.extend(self.children.get(child, []))
        return descendants

    def get_all_labels(self, category: Optional[str] = None) -> List[str]:
        """Return all concept labels, optionally filtered by top-level category."""
        if category:
            cat_uri = self.get_uri(category)
            if cat_uri:
                desc = self.get_descendants(cat_uri)
                return [self.classes.get(d, d.split("#")[-1]) for d in desc]
        return list(self.label_to_uri.keys())

    def get_hierarchy(self) -> Dict:
        """Return full hierarchy as nested dict for frontend visualization."""
        roots = [uri for uri in self.classes if uri not in self.parents]
        def build_tree(uri):
            label = self.classes.get(uri, uri.split("#")[-1])
            kids = self.children.get(uri, [])
            return {
                "name": label,
                "children": [build_tree(c) for c in kids],
            }
        return [build_tree(r) for r in roots]


# Match degree constants (Section 6.2)
EXACT = 3
PLUGIN = 2
SUBSUME = 1
FAIL = 0


class ConceptMatcher:
    """
    Implements the concept match function (Section 6.2).
    Compares two concepts through their relations in the OWL ontology.
    """

    def __init__(self, ontology: OntologyGraph):
        self.ontology = ontology

    def match(self, concept_a: str, concept_b: str) -> Tuple[str, int]:
        """
        Compare two concepts and return (degree_name, score).

        Returns:
          ("exact", 3)   — identical concepts
          ("plugin", 2)  — A includes B (A is ancestor of B)
          ("subsume", 1) — A is more specific than B (A is descendant of B)
          ("fail", 0)    — unrelated
        """
        uri_a = self.ontology.get_uri(concept_a)
        uri_b = self.ontology.get_uri(concept_b)

        # If either concept isn't in the ontology, try string equality
        if uri_a is None or uri_b is None:
            if concept_a.lower() == concept_b.lower():
                return ("exact", EXACT)
            return ("fail", FAIL)

        # Exact match
        if uri_a == uri_b:
            return ("exact", EXACT)

        # Plug-in: A includes B → A is ancestor of B
        ancestors_b = self.ontology.get_ancestors(uri_b)
        if uri_a in ancestors_b:
            return ("plugin", PLUGIN)

        # Subsume: A is more specific than B → A is descendant of B
        ancestors_a = self.ontology.get_ancestors(uri_a)
        if uri_b in ancestors_a:
            return ("subsume", SUBSUME)

        # Check if they share a common ancestor (sibling relationship)
        # → still treated as fail per the paper
        return ("fail", FAIL)


class SemanticMatchmaker:
    """
    Full matchmaking engine implementing the algorithm from Fig. 2.

    Given an incident query (IQ) and a list of stored incidents (SI),
    produces an Exact Incident Table and a Possible Incident Table.
    """

    def __init__(self, ontology_path: Optional[str] = None):
        self.ontology = OntologyGraph()
        if ontology_path is None:
            ontology_path = os.path.join(
                os.path.dirname(__file__), "incident_ontology.owl"
            )
        self.ontology.load(ontology_path)
        self.matcher = ConceptMatcher(self.ontology)

        # Default weight factors (configurable via Admin Agent)
        self.factors = {
            "S": 1.0,  # Service
            "O": 1.0,  # Object
            "P": 1.0,  # Problem
            "T": 1.0,  # Type
        }
        # Threshold = 3 * sum(factors) — resolves paper's gap (§13.1)
        self.threshold = 3.0 * sum(self.factors.values())

    def update_factors(self, sfactor: float, ofactor: float, pfactor: float, tfactor: float):
        """Update weight factors and recalculate threshold."""
        self.factors = {"S": sfactor, "O": ofactor, "P": pfactor, "T": tfactor}
        self.threshold = 3.0 * sum(self.factors.values())

    def compute_similarity(
        self,
        iq: Dict[str, str],
        si: Dict[str, str],
    ) -> Tuple[float, Dict[str, Tuple[str, int]]]:
        """
        Compute similarity between an incident query and a stored incident.

        Args:
          iq: {"object": ..., "type": ..., "service": ..., "problem": ...}
          si: Same structure for the stored incident.

        Returns:
          (total_score, tag_details)
          tag_details maps each tag to (degree_name, raw_score)
        """
        tag_mapping = [
            ("service", "S"),
            ("object", "O"),
            ("problem", "P"),
            ("type", "T"),
        ]

        total = 0.0
        details = {}
        for tag_key, factor_key in tag_mapping:
            degree_name, raw_score = self.matcher.match(
                iq.get(tag_key, ""), si.get(tag_key, "")
            )
            weighted = raw_score * self.factors[factor_key]
            total += weighted
            details[tag_key] = (degree_name, raw_score)

        return total, details

    def find_matches(
        self,
        incident_query: Dict[str, str],
        stored_incidents: List[Dict],
    ) -> Tuple[List[Dict], List[Dict]]:
        """
        Run the matchmaking algorithm (Fig. 2).

        Args:
          incident_query: {"object": ..., "type": ..., "service": ..., "problem": ...}
          stored_incidents: List of dicts, each with "id", "object", "type",
                          "service", "problem", "solution", etc.

        Returns:
          (exact_table, possible_table)
          Each entry includes the stored incident dict plus "score" and "match_details".
        """
        exact_table = []
        possible_table = []

        for si in stored_incidents:
            si_tags = {
                "object": si.get("object", ""),
                "type": si.get("type", ""),
                "service": si.get("service", ""),
                "problem": si.get("problem", ""),
            }

            score, details = self.compute_similarity(incident_query, si_tags)

            if score >= self.threshold:
                exact_table.append({**si, "score": score, "match_details": details})
            elif score > 0:
                possible_table.append({**si, "score": score, "match_details": details})
            # score == 0 → discard

        # Sort by score descending
        exact_table.sort(key=lambda x: x["score"], reverse=True)
        possible_table.sort(key=lambda x: x["score"], reverse=True)

        return exact_table, possible_table


# Singleton instance
_matchmaker: Optional[SemanticMatchmaker] = None


def get_matchmaker() -> SemanticMatchmaker:
    """Get or create the singleton matchmaker instance."""
    global _matchmaker
    if _matchmaker is None:
        _matchmaker = SemanticMatchmaker()
    return _matchmaker
