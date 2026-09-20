/**
 * TypeScript types for ITIL Multi-Agent Incident Management System (MA-IMS)
 */

export interface Solution {
  id: number;
  solution_text: string;
  resolution_method: 'auto_reuse' | 'staff_resolved';
  created_at?: string;
}

export interface AuditEntry {
  id: number;
  agent_name: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface MatchDetails {
  service: [string, number];
  object: [string, number];
  problem: [string, number];
  type: [string, number];
}

export interface StoredMatch {
  id: string;
  title: string;
  object: string;
  type: string;
  service: string;
  problem: string;
  solution: string;
  score: number;
  match_details: MatchDetails;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  object_tag: string;
  type_tag: string;
  service_tag: string;
  problem_tag: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  severity?: string;
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  impact?: string;
  urgency?: string;
  sla_allowed_time_minutes?: number;
  sla_breached?: boolean;
  assigned_support_category?: string;
  assigned_agent_id?: string;
  source: 'user_gui' | 'event_log';
  productivity_rate?: number;
  problem_manager_notified?: boolean;
  xml_representation?: string;
  created_at?: string;
  resolved_at?: string;
  closed_at?: string;
  solutions?: Solution[];
  audit_entries?: AuditEntry[];
}

export interface MatchResults {
  incident_id: string;
  threshold: number;
  factors: { S: number; O: number; P: number; T: number };
  exact_matches: StoredMatch[];
  possible_matches: StoredMatch[];
}

export interface IncidentSubmissionResponse {
  incident_id: string;
  status: string;
  match_type: 'exact' | 'possible' | 'none';
  message: string;
  solution?: string;
  matched_incident_id?: string;
  score?: number;
  exact_matches?: StoredMatch[];
  possible_matches?: StoredMatch[];
}

export interface EventLog {
  id: number;
  timestamp: string;
  source_system: string;
  service_name: string;
  log_level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  processed_by_supervisor: boolean;
  incident_id?: string;
}

export interface AgentStatus {
  name: string;
  description: string;
  is_connected: boolean;
  message_count: number;
}

export interface SupervisorStatus {
  name: string;
  is_connected: boolean;
  is_monitoring: boolean;
  is_background_loop_running: boolean;
  last_poll_at?: string;
  detected_count: number;
  suppressed_count: number;
  poll_interval_seconds: number;
}

export interface ConfigurationItem {
  id: number;
  ci_name: string;
  ci_type: string;
  service_name: string;
  impact_level: number;
  urgency_level: number;
  owner_team?: string;
  dependencies_json?: string;
  status: string;
  created_at?: string;
}

export interface SLADefinition {
  id: number;
  service_name: string;
  priority: string;
  max_resolution_time_minutes: number;
  recurrence_threshold: number;
  escalation_rules_json?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  total_incidents: number;
  resolved_count: number;
  open_count: number;
  mttr_minutes_auto: number;
  mttr_minutes_staff: number;
  solution_reuse_rate: number;
  auto_detection_rate: number;
  sla_compliance_rate: number;
  categories: Record<string, number>;
  statuses: Record<string, number>;
}

export interface SLACompliance {
  overall_compliance_rate: number;
  breached_count: number;
  at_risk_count: number;
  at_risk_incidents: Array<{
    id: string;
    title: string;
    priority: string;
    allowed_minutes: number;
    remaining_minutes: number;
  }>;
  priority_breakdown: Record<string, { total: number; breached: number; compliance_rate: number }>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'end_user' | 'support_staff' | 'problem_manager' | 'system_admin' | 'it_service_manager';
  department?: string;
  support_category?: string;
}
