# AI-Powered Multi Agent Incident Management System

> **Institution:** Vasireddy Venkatadri Institute of Technology (VVIT)  
> **Department:** Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
> **Batch ID:** CSM-C12  
> **Project Guide:** Mrs. V. Asha Jyothi  
> **Repository:** [b-12-incident-managment-agent](https://github.com/Jishnu-cmd/b-12-incident-managment-agent)

---

### 📌 Executive Summary

The **MA-IMS (Multi-Agent Incident Management System)** is an autonomous ITIL-compliant incident response and resolution platform based on the foundational research of *Latrache et al. (2015)*. It automates the complete incident lifecycle through 6 collaborative software agents:

1. **User Agent**: Captures user incident reports, extracts 4-tuple semantic queries (`<object, type, service, problem>`), and translates requests.
2. **Incident Agent**: Executes semantic matchmaking using OWL ontologies over the Incident Management Database (IMDB). If similarity score $> \text{threshold}$, the historical solution is automatically applied and verified.
3. **Diagnostic Agent**: Performs triage, categorization, severity assessment, SLA allocation, and team routing for non-exact incidents.
4. **Support Agent**: Assists technicians with diagnostic reasoning, historical case context, and resolution logging.
5. **Supervisor Agent**: Continuously tracks SLA deadlines in real-time, computes MTTR, detects bottlenecks, and triggers automatic escalations.
6. **Administrator Agent**: Validates proposed solutions, refines OWL ontology concepts, and maintains system integrity.

---

## 📐 System Architecture

```text
                    MA-IMS ARCHITECTURE (Latrache et al. 2015)
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   User Agent    │  (Incident Capture & Reporting)
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Incident Agent  │  (Semantic Matchmaking against IMDB)
                            └────────┬────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
            [Exact Match > Threshold]       [Possible / No Match]
                     │                               │
                     ▼                               ▼
          ┌─────────────────────┐         ┌─────────────────────┐
          │ Auto-Solution Apply │         │  Diagnostic Agent   │ (Categorization, Severity,
          │  & Instant Resolve  │         └──────────┬──────────┘  Priority, SLA Assignment)
          └─────────────────────┘                    │
                                                     ▼
                                          ┌─────────────────────┐
                                          │    Support Agent    │ (Investigation, Diagnosis,
                                          └──────────┬──────────┘  Resolution Recording)
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │ Administrator Agent │ (Solution Validation &
                                          └─────────────────────┘  OWL Ontology Refinement)
                                                     │
                        ┌────────────────────────────┴────────────────────────────┐
                        ▼                                                         ▼
             ┌─────────────────────┐                                   ┌─────────────────────┐
             │  Supervisor Agent   │ (Real-time SLA Monitoring,        │     CMDB & IMDB     │
             │   & Escalations     │  Bottleneck Detection)            │  Knowledge Store    │
             └─────────────────────┘                                   └─────────────────────┘
```

---

## 📁 Repository Structure

```text
major/
├── backend/                  # FastAPI Python 3.11 Backend
│   ├── app/
│   │   ├── agents/           # 6 ITIL Agents (User, Incident, Diagnostic, Support, Supervisor, Administrator)
│   │   ├── api/              # REST Endpoints (Auth, Incidents, Knowledge, Supervisor, Admin, Dashboard)
│   │   ├── core/             # Configuration, Database Connection & Security
│   │   ├── models/           # SQLAlchemy Models (IMDB, CMDB, EventLog, Audit, Users, XML Serializer)
│   │   ├── ontology/         # OWL Incident Ontology (`incident_ontology.owl`) & Semantic Matchmaker
│   │   └── schemas/          # Pydantic Schemas
│   ├── seed_data.py          # Database Populator Script
│   ├── test_matchmaking.py   # Semantic Matchmaking Test Suite
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Vite + React 19 + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/       # Header, Sidebar, CreateIncidentModal
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Dashboard, IncidentList, IncidentDetail, OntologyViewer, SLADashboard, SupervisorMonitor, AdminPanel
│   │   ├── services/         # Axios API Client
│   │   └── types/            # TypeScript Interfaces
│   ├── package.json
│   └── vite.config.ts
├── latrache2015.pdf          # Foundational IEEE Research Paper
└── README.md
```

---

## ⚡ Quick Start & Execution

### 1. Backend Setup (FastAPI & SQLite)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python seed_data.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload
```

### 2. Frontend Setup (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173) to access the Command Center UI.

---

## 📊 Key Features

- **6 Collaborative ITIL Agents**: User Agent, Incident Agent, Diagnostic Agent, Support Agent, Supervisor Agent, and Administrator Agent collaborating via shared blackboard and event log.
- **Semantic Matchmaking Engine**: 4-tuple concept matching (`Object`, `Type`, `Service`, `Problem`) traversing the OWL class hierarchy (`Exact = 3`, `Plug-in = 2`, `Subsume = 1`, `Fail = 0`) with threshold routing.
- **Automated Incident Auto-Healing**: Immediate resolution and solution reuse when similarity score exceeds threshold ($> \text{threshold}$).
- **CMDB Dependency Tracking**: Configuration item mapping and downstream impact analysis.
- **Real-Time SLA & Escalation Engine**: Supervisor Agent continuously tracks SLA compliance, identifies bottlenecks, and triggers automatic escalations.
- **Ontology & Knowledge Visualizer**: Interactive taxonomy browser for ITIL incident domains and solution base.
- **Clerk & JWT Authentication**: Role-based access control for End-Users, IT Support Engineers, and Administrators.

