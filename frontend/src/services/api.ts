import axios from 'axios';
import type {
  Incident,
  IncidentSubmissionResponse,
  MatchResults,
  EventLog,
  AgentStatus,
  SupervisorStatus,
  ConfigurationItem,
  SLADefinition,
  DashboardMetrics,
  SLACompliance,
  User,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8008/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ma_ims_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // --- Authentication ---
  login: async (email: string, password = 'password') => {
    const res = await client.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('ma_ims_token', res.data.access_token);
      localStorage.setItem('ma_ims_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (payload: { name: string; email: string; password?: string; role: string; department?: string }) => {
    const res = await client.post<{ access_token: string; user: User }>('/auth/register', {
      ...payload,
      password: payload.password || 'password',
    });
    if (res.data.access_token) {
      localStorage.setItem('ma_ims_token', res.data.access_token);
      localStorage.setItem('ma_ims_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await client.get<User>('/auth/me');
    return res.data;
  },

  // --- Incidents (User Agent & Support Agent) ---
  getIncidents: async (params?: { status?: string; priority?: string; category?: string; search?: string }) => {
    const res = await client.get<Incident[]>('/incidents', { params });
    return res.data;
  },

  getIncidentById: async (id: string) => {
    const res = await client.get<Incident>(`/incidents/${id}`);
    return res.data;
  },

  createIncident: async (payload: {
    object_tag: string;
    type_tag: string;
    service_tag: string;
    problem_tag: string;
    description: string;
    reporter_email?: string;
  }) => {
    const res = await client.post<IncidentSubmissionResponse>('/incidents', payload);
    return res.data;
  },

  resolveIncident: async (id: string, solutionText: string, staffName?: string) => {
    const res = await client.post<{ success: boolean; incident_id: string; status: string; solution: string }>(
      `/incidents/${id}/resolve`,
      { solution_text: solutionText, staff_name: staffName }
    );
    return res.data;
  },

  closeIncident: async (id: string) => {
    const res = await client.post<{ incident_id: string; status: string }>(`/incidents/${id}/close`);
    return res.data;
  },

  getIncidentMatches: async (id: string) => {
    const res = await client.get<MatchResults>(`/incidents/${id}/matches`);
    return res.data;
  },

  getIncidentAudit: async (id: string) => {
    const res = await client.get<any[]>(`/incidents/${id}/audit`);
    return res.data;
  },

  // --- Supervisor & Event Logs ---
  getSupervisorStatus: async () => {
    const res = await client.get<SupervisorStatus>('/supervisor/status');
    return res.data;
  },

  startSupervisor: async () => {
    const res = await client.post<any>('/supervisor/start');
    return res.data;
  },

  stopSupervisor: async () => {
    const res = await client.post<any>('/supervisor/stop');
    return res.data;
  },

  pollSupervisorNow: async () => {
    const res = await client.post<any>('/supervisor/poll-now');
    return res.data;
  },

  injectEventLog: async (payload: { source_system: string; service_name: string; log_level: string; message: string }) => {
    const res = await client.post<EventLog>('/event-logs', payload);
    return res.data;
  },

  getEventLogs: async (params?: { level?: string; limit?: number }) => {
    const res = await client.get<EventLog[]>('/event-logs', { params });
    return res.data;
  },

  // --- Administrator Agent & Config ---
  getAgents: async () => {
    const res = await client.get<AgentStatus[]>('/admin/agents');
    return res.data;
  },

  connectAgent: async (name: string) => {
    const res = await client.post<any>(`/admin/agents/${name}/connect`);
    return res.data;
  },

  disconnectAgent: async (name: string) => {
    const res = await client.post<any>(`/admin/agents/${name}/disconnect`);
    return res.data;
  },

  getMatchmakingConfig: async () => {
    const res = await client.get<{ factors: { S: number; O: number; P: number; T: number }; threshold: number }>('/admin/config');
    return res.data;
  },

  updateMatchmakingConfig: async (factors: { sfactor: number; ofactor: number; pfactor: number; tfactor: number }) => {
    const res = await client.put<any>('/admin/config', factors);
    return res.data;
  },

  getCMDB: async () => {
    const res = await client.get<ConfigurationItem[]>('/admin/cmdb');
    return res.data;
  },

  createCMDBItem: async (payload: Partial<ConfigurationItem>) => {
    const res = await client.post<ConfigurationItem>('/admin/cmdb', payload);
    return res.data;
  },

  getSLA: async () => {
    const res = await client.get<SLADefinition[]>('/admin/sla');
    return res.data;
  },

  createSLADefinition: async (payload: Partial<SLADefinition>) => {
    const res = await client.post<SLADefinition>('/admin/sla', payload);
    return res.data;
  },

  // --- Knowledge & Ontology ---
  getOntology: async () => {
    const res = await client.get<any>('/knowledge/ontology');
    return res.data;
  },

  addOntologyConcept: async (payload: { category: string; concept_name: string; parent_concept?: string }) => {
    const res = await client.post<any>('/knowledge/ontology/concepts', payload);
    return res.data;
  },

  getKnowledgeSolutions: async () => {
    const res = await client.get<any[]>('/knowledge/solutions');
    return res.data;
  },

  // --- Dashboard & Metrics ---
  getDashboardMetrics: async () => {
    const res = await client.get<DashboardMetrics>('/dashboard/metrics');
    return res.data;
  },

  getSLACompliance: async () => {
    const res = await client.get<SLACompliance>('/dashboard/sla-compliance');
    return res.data;
  },
};
