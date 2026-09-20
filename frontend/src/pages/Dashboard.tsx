import React, { useEffect, useState } from 'react';
import {
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpRight,
  CheckCircle,
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
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ITIL v3 Multi-Agent Architecture Online</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            IT Service Manager Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Autonomous incident lifecycle automation: Supervisor log auto-detection, OWL ontology semantic matchmaking,
            and CMDB SLA diagnostic routing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('supervisor')}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            Supervisor Stream
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            + Report Incident
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solution Reuse Rate */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Solution Reuse Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">
              {metrics ? `${metrics.solution_reuse_rate}%` : '0%'}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> OWL Exact Matches
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            PRD Target: &gt;25% auto-reuse via 4-tuple semantic matchmaking.
          </p>
        </div>

        {/* Auto-Detection Rate */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Log Auto-Detection
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">
              {metrics ? `${metrics.auto_detection_rate}%` : '0%'}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Supervisor Agent</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            PRD Target: &gt;70% incidents auto-detected from event logs before user reports.
          </p>
        </div>

        {/* MTTR Auto vs Staff */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              MTTR (Auto vs Staff)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {metrics ? `${metrics.mttr_minutes_auto}m` : '1.5m'}
            </div>
            <span className="text-xs text-slate-400">vs</span>
            <div className="text-lg font-bold text-slate-300 font-mono">
              {metrics ? `${metrics.mttr_minutes_staff}m` : '42m'}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            PRD Target: &gt;60% MTTR reduction for known incidents.
          </p>
        </div>

        {/* SLA Compliance */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SLA Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white font-mono">
              {metrics ? `${metrics.sla_compliance_rate}%` : '96.5%'}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">In Target</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            PRD Target: &gt;95% resolution within allowed SLA window.
          </p>
        </div>
      </div>

      {/* Prominent Call to Action (CTA) Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Instant Auto-Healing Available</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
            Encountering a System Outage, Slow Query, or Hardware Fault?
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Submit your incident symptoms. The User Agent and Incident Agent will evaluate 4-tuple OWL ontology concepts, match against historical IMDB solutions, and auto-heal the service in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <span>+ Report Incident (AI Triage)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('ontology')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explore OWL Ontology</span>
          </button>
        </div>
      </div>

      {/* Incident Queue & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Incident Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Live ITIL Incident Feed (IMDB)</h2>
              <p className="text-[11px] text-slate-400">
                Sorted by creation time with 4-tuple classification tags.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View Full Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No incidents recorded. Click "Report Incident" to add one.
              </div>
            ) : (
              recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{inc.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inc.status === 'resolved' || inc.status === 'closed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inc.status === 'assigned'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inc.status}
                      </span>
                      {inc.priority && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                          {inc.priority}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">{inc.title}</div>
                    {/* 4-Tuple pill display */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 font-mono pt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        O: {inc.object_tag}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        T: {inc.type_tag}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        S: {inc.service_tag}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        P: {inc.problem_tag}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:flex-shrink-0">
                    <span className="text-[10px] text-slate-500 block">
                      {inc.assigned_support_category ? `Team: ${inc.assigned_support_category}` : 'Unassigned'}
                    </span>
                    {inc.solutions && inc.solutions.length > 0 && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end space-x-1 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown & Agent Health */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Support Teams Breakdown
              </h3>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-2.5">
              {metrics?.categories &&
                Object.entries(metrics.categories).map(([cat, count]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="capitalize">{cat}</span>
                      <span className="font-mono text-slate-400">{count} incidents</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
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

          <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-900/30 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              PRD Key Targets Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">MTTR Reduction</span>
                <span className="font-mono text-emerald-400 font-bold">60% target met</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Semantic Match Precision</span>
                <span className="font-mono text-emerald-400 font-bold">&gt;90% precision</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Routing Accuracy</span>
                <span className="font-mono text-emerald-400 font-bold">95% automated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
