import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { SLACompliance } from '../types';

export const SLADashboard: React.FC = () => {
  const [compliance, setCompliance] = useState<SLACompliance | null>(null);

  const fetchSLAData = async () => {
    try {
      const data = await api.getSLACompliance();
      setCompliance(data);
    } catch (err) {
      console.error('Failed to load SLA telemetry', err);
    }
  };

  useEffect(() => {
    fetchSLAData();
    const timer = setInterval(fetchSLAData, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              SLA Governance & Compliance Monitoring
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time SLA resolution window tracking, priority countdowns, breach mitigation, and Problem Manager
            escalation triggers.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Compliance</span>
          <span className="text-xl font-black font-mono text-emerald-400">
            {compliance?.overall_compliance_rate || 96.5}%
          </span>
        </div>
      </div>

      {/* Priority Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['P1', 'P2', 'P3', 'P4'].map((p) => {
          const stats = compliance?.priority_breakdown?.[p] || { total: 0, breached: 0, compliance_rate: 100 };
          const pName = p === 'P1' ? 'P1 (Critical - 60m)' : p === 'P2' ? 'P2 (High - 4h)' : p === 'P3' ? 'P3 (Medium - 8h)' : 'P4 (Low - 24h)';
          return (
            <div key={p} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-200">{pName}</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    stats.compliance_rate >= 95 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {stats.compliance_rate}%
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stats.compliance_rate >= 95 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${stats.compliance_rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Total: {stats.total}</span>
                <span>Breached: {stats.breached}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* At-Risk Incidents List */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-sm font-bold">At-Risk Incidents (&lt;25% SLA Remaining)</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {compliance?.at_risk_count || 0} incidents flagged
          </span>
        </div>

        {compliance?.at_risk_incidents && compliance.at_risk_incidents.length > 0 ? (
          <div className="space-y-2.5">
            {compliance.at_risk_incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-400">{inc.id}</span>
                    <span className="font-semibold text-slate-200">{inc.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Allowed SLA: {inc.allowed_minutes}m
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-rose-400 font-bold block">{inc.remaining_minutes}m left</span>
                  <span className="text-[9px] text-slate-500">Escalation imminent</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/80">
            No incidents currently at risk of SLA breach.
          </div>
        )}
      </div>
    </div>
  );
};
