"""
XML serializer for ITIL incident records.
The paper stores incidents in XML representation (Section 4.2):
  ID, Object, Type, Service, Problem, Description, Solution
"""
from xml.etree import ElementTree as ET
from typing import Optional


def incident_to_xml(
    incident_id: str,
    object_tag: str,
    type_tag: str,
    service_tag: str,
    problem_tag: str,
    description: str,
    solution: Optional[str] = None,
    status: str = "open",
    severity: Optional[str] = None,
    priority: Optional[str] = None,
) -> str:
    """Serialize an incident record to XML string."""
    root = ET.Element("IncidentRecord")

    ET.SubElement(root, "ID").text = incident_id
    ET.SubElement(root, "Object").text = object_tag
    ET.SubElement(root, "Type").text = type_tag
    ET.SubElement(root, "Service").text = service_tag
    ET.SubElement(root, "Problem").text = problem_tag
    ET.SubElement(root, "Description").text = description
    ET.SubElement(root, "Status").text = status

    if severity:
        ET.SubElement(root, "Severity").text = severity
    if priority:
        ET.SubElement(root, "Priority").text = priority
    if solution:
        ET.SubElement(root, "Solution").text = solution

    return ET.tostring(root, encoding="unicode", xml_declaration=True)


def xml_to_incident_dict(xml_string: str) -> dict:
    """Deserialize XML string back to a dictionary."""
    root = ET.fromstring(xml_string)
    result = {}
    for child in root:
        result[child.tag] = child.text
    return result
