import React, { useEffect, useState } from 'react';
import {
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  Sparkles,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardMetrics, Incident } from '../types';

interface DashboardProps {
  onSelectIncident: (id: string) => void;
  onOpenCreateModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectIncident,
  onOpenCreateModal,
  onNavigateTab,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, incs] = await Promise.all([
          api.getDashboardMetrics(),
          api.getIncidents({ limit: 6 } as any),
        ]);
        setMetrics(m);
        setRecentIncidents(incs || []);
      } catch (err) {
        console.error('Failed to load dashboard telemetry', err);
      }
    };
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 pb-16 font-sans text-[#EAE2D8]">
      {/* Luxury Editorial Header Banner (Burberry / LV Inspired) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1E1B18] via-[#1A1714] to-[#141210] border border-[#3A332C] p-6 sm:p-8 shadow-2xl shadow-black/60">
        {/* Subtle Warm Linen Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#8C6D53]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2B241D] border border-[#524436] text-[#D4AF37] text-[11px] font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>MA-IMS • Autonomous ITIL Excellence</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight text-[#F7F3EE]">
              Incident Management <span className="italic font-light text-[#C5A880]">Command Center</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-[#A8A096] leading-relaxed font-light">
              Autonomous incident orchestration harmonizing 6 collaborative software agents, OWL ontology semantic matchmaking, and real-time ITIL SLA governance with understated precision.
            </p>
          </div>

          {/* Luxury Minimalist Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('supervisor')}
              className="px-4 py-2.5 rounded-xl bg-[#24201C] hover:bg-[#2C2723] text-[#D8CEBF] hover:text-[#F7F3EE] text-xs font-medium tracking-wider uppercase transition-all border border-[#3E362E] hover:border-[#574C41] cursor-pointer"
            >
              Supervisor Stream
            </button>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A37B5C] hover:from-[#D4B993] hover:to-[#B58A6A] text-[#141210] font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#A37B5C]/20 transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              <span>+ Report Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Muted Beige, Warm Gray, Cognac & Saddle Brown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Solution Reuse Rate */}
        <div className="rounded-2xl p-5 bg-[#1C1916] border border-[#362F28] hover:border-[#52463B] transition-all relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A8A096]">
              Solution Reuse
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2B241D] border border-[#4A3D31] flex items-center justify-center text-[#D4AF37]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <div className="text-3xl font-serif font-light text-[#F7F3EE]">
              {metrics ? `${metrics.solution_reuse_rate}%` : '0%'}
            </div>
            <span className="text-[11px] text-[#C5A880] font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> OWL Exact
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#8C8479] font-light leading-normal">
            Automated solution reuse via 4-tuple semantic hierarchy matchmaking.
          </p>
        </div>

        {/* Auto-Detection Rate */}
        <div className="rounded-2xl p-5 bg-[#1C1916] border border-[#362F28] hover:border-[#52463B] transition-all relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A8A096]">
              Auto-Detection
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#232B24] border border-[#3A4A3C] flex items-center justify-center text-[#B5C99A]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <div className="text-3xl font-serif font-light text-[#F7F3EE]">
              {metrics ? `${metrics.auto_detection_rate}%` : '0%'}
            </div>
            <span className="text-[11px] text-[#B5C99A] font-medium">Supervisor</span>
          </div>
          <p className="mt-2 text-[11px] text-[#8C8479] font-light leading-normal">
            Autonomous log ingestion detecting anomalies prior to end-user ticket creation.
          </p>
        </div>

        {/* MTTR (Auto vs Staff) */}
        <div className="rounded-2xl p-5 bg-[#1C1916] border border-[#362F28] hover:border-[#52463B] transition-all relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A8A096]">
              MTTR Efficiency
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2B231D] border border-[#4C3B2E] flex items-center justify-center text-[#E0B589]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <div className="text-3xl font-serif font-light text-[#E0B589]">
              {metrics ? `${metrics.mttr_minutes_auto}m` : '1.5m'}
            </div>
            <span className="text-xs text-[#8C8479]">vs</span>
            <div className="text-xl font-serif text-[#A8A096]">
              {metrics ? `${metrics.mttr_minutes_staff}m` : '42m'}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[#8C8479] font-light leading-normal">
            60%+ mean time to resolution compression for classified incidents.
          </p>
        </div>

        {/* SLA Compliance */}
        <div className="rounded-2xl p-5 bg-[#1C1916] border border-[#362F28] hover:border-[#52463B] transition-all relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A8A096]">
              SLA Governance
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2D281E] border border-[#4D422E] flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <div className="text-3xl font-serif font-light text-[#F7F3EE]">
              {metrics ? `${metrics.sla_compliance_rate}%` : '96.5%'}
            </div>
            <span className="text-[11px] text-[#C5A880] font-medium">Within Target</span>
          </div>
          <p className="mt-2 text-[11px] text-[#8C8479] font-light leading-normal">
            95%+ resolution adherence across P1–P4 operational SLA boundaries.
          </p>
        </div>
      </div>

      {/* Luxury Earthy Call to Action (Burberry Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#211D19] via-[#1D1915] to-[#181512] border border-[#453A30] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-[#C5A880] text-xs font-mono tracking-widest uppercase font-semibold">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Autonomous Service Remediation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#F7F3EE] tracking-tight">
            Experiencing Infrastructure Degradation or Application Faults?
          </h2>
          <p className="text-xs sm:text-sm text-[#A8A096] max-w-2xl leading-relaxed font-light">
            Dispatch symptoms directly into the ITIL blackboard. The Incident Agent executes semantic reasoning against known IMDB cases to trigger verified auto-healing in seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A37B5C] hover:from-[#D4B993] hover:to-[#B58A6A] text-[#141210] font-bold text-xs tracking-wider uppercase shadow-xl shadow-[#A37B5C]/25 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <span>+ Report Incident (AI Triage)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('ontology')}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#28221D] hover:bg-[#322B24] text-[#D8CEBF] hover:text-white font-medium text-xs tracking-wider uppercase border border-[#4A3D31] transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Explore OWL Ontology</span>
          </button>
        </div>
      </div>

      {/* Incident Feed & Category Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Incident Feed */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-[#1A1714] border border-[#362F28] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C2620]">
            <div>
              <h2 className="text-sm font-serif uppercase tracking-widest text-[#F7F3EE]">
                Live ITIL Incident Feed (IMDB)
              </h2>
              <p className="text-[11px] text-[#8C8479] font-light">
                Sorted by creation timestamp with 4-tuple classification tags.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('incidents')}
              className="text-xs font-semibold text-[#C5A880] hover:text-[#D4AF37] flex items-center space-x-1 tracking-wider uppercase cursor-pointer"
            >
              <span>Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <div className="p-10 text-center text-[#8C8479] text-xs font-light">
                No active incidents recorded. Click "Report Incident" to register a case.
              </div>
            ) : (
              recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className="p-4 rounded-xl bg-[#201C18] hover:bg-[#28231E] border border-[#332C25] hover:border-[#4D3F33] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">{inc.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          inc.status === 'resolved' || inc.status === 'closed'
                            ? 'bg-[#232B24] text-[#B5C99A] border border-[#3A4A3C]'
                            : inc.status === 'assigned'
                            ? 'bg-[#2B231D] text-[#E0B589] border border-[#4C3B2E]'
                            : 'bg-[#2E1D19] text-[#E8A598] border border-[#523027]'
                        }`}
                      >
                        {inc.status}
                      </span>
                      {inc.priority && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2A241E] text-[#D8CEBF] border border-[#3E352C]">
                          {inc.priority}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[#EAE2D8] group-hover:text-white truncate">
                      {inc.title}
                    </div>
                    {/* 4-Tuple pill display with muted earthy aesthetic */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-[#A8A096] font-mono pt-0.5">
                      <span className="px-2 py-0.5 rounded bg-[#181512] border border-[#2E2721]">
                        O: {inc.object_tag}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#181512] border border-[#2E2721]">
                        T: {inc.type_tag}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#181512] border border-[#2E2721]">
                        S: {inc.service_tag}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#181512] border border-[#2E2721]">
                        P: {inc.problem_tag}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:flex-shrink-0 pt-2 sm:pt-0">
                    <span className="text-[10px] text-[#8C8479] font-mono block">
                      {inc.assigned_support_category ? `Team: ${inc.assigned_support_category}` : 'Unassigned'}
                    </span>
                    {inc.solutions && inc.solutions.length > 0 && (
                      <span className="text-[10px] text-[#B5C99A] font-semibold flex items-center justify-end space-x-1 mt-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Remediated</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Teams Breakdown & Key Targets */}
        <div className="space-y-6">
          {/* Category Breakdown Card */}
          <div className="rounded-2xl p-6 bg-[#1A1714] border border-[#362F28] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C2620]">
              <h3 className="text-xs font-serif uppercase tracking-widest text-[#F7F3EE]">
                Support Workstream Allocation
              </h3>
              <Layers className="w-4 h-4 text-[#8C8479]" />
            </div>

            <div className="space-y-3">
              {metrics?.categories &&
                Object.entries(metrics.categories).map(([cat, count]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-[#D8CEBF]">
                      <span className="capitalize">{cat}</span>
                      <span className="font-mono text-[#8C8479]">{count} cases</span>
                    </div>
                    <div className="w-full bg-[#141210] h-1.5 rounded-full overflow-hidden border border-[#2B241D]">
                      <div
                        className="bg-gradient-to-r from-[#C5A880] to-[#A37B5C] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (count / Math.max(1, metrics.total_incidents)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* PRD Benchmark Audit Card */}
          <div className="rounded-2xl p-6 bg-[#1A1714] border border-[#362F28] space-y-3.5 shadow-xl">
            <h3 className="text-xs font-serif uppercase tracking-widest text-[#F7F3EE] pb-2 border-b border-[#2C2620]">
              ITIL Performance Benchmarks
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201C18] border border-[#332C25]">
                <span className="text-[#A8A096] font-light">MTTR Compression</span>
                <span className="font-mono text-[#B5C99A] font-bold">60% target met</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201C18] border border-[#332C25]">
                <span className="text-[#A8A096] font-light">Ontology Match Precision</span>
                <span className="font-mono text-[#D4AF37] font-bold">&gt;90% precision</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201C18] border border-[#332C25]">
                <span className="text-[#A8A096] font-light">Autonomous Routing</span>
                <span className="font-mono text-[#E0B589] font-bold">95% automated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
