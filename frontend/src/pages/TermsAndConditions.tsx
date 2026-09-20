import React from 'react';
import { Scale, AlertTriangle, Cpu, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-4 text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Legal & Terms of Service</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-slate-400">
            Last Updated: September 20, 2026 • Enterprise Platform Agreement
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 hover:border-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Autonomous Healing</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated solutions are applied under strict safety thresholds defined in the ontology and supervisor policies.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">ITIL SLA Boundaries</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Priority-based SLAs (P1–P4) establish target MTTR windows monitored by the real-time Supervisor Agent.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Authorized Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Role-based segregation guarantees only verified administrators can refine ontology concepts or approve changes.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm leading-relaxed text-slate-300">
        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using the MA-IMS (Multi-Agent Incident Management System), enterprise personnel, IT support engineers, and administrators agree to be bound by these Terms and Conditions and the ITIL framework guidelines governing enterprise infrastructure operations.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>2. Agent Autonomous Remediation & Liability</span>
          </h2>
          <p>
            The platform features autonomous auto-healing agents that execute historical solutions based on OWL ontological matchmaking:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 ml-2">
            <li><strong>Automated Execution:</strong> Solutions matching above the safety threshold (score &gt; 12.0) are executed automatically without manual triage intervention.</li>
            <li><strong>Support Escalation:</strong> Incidents failing exact matchmaking are routed to human Support Agents with contextual CMDB topology and diagnostic evidence.</li>
            <li><strong>Operational Safety:</strong> Administrators retain ultimate authority to freeze, override, or roll back automated agent remediation actions.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>3. Service Level Agreements (SLAs) & Escalation</span>
          </h2>
          <p>
            Target resolution times are computed based on incident priority:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/30 text-red-300">
              <div className="font-bold text-sm">P1 Critical</div>
              <div className="text-slate-400 text-[11px]">SLA: 45 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300">
              <div className="font-bold text-sm">P2 High</div>
              <div className="text-slate-400 text-[11px]">SLA: 120 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/30 text-blue-300">
              <div className="font-bold text-sm">P3 Medium</div>
              <div className="text-slate-400 text-[11px]">SLA: 240 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300">
              <div className="font-bold text-sm">P4 Low</div>
              <div className="text-slate-400 text-[11px]">SLA: 480 Minutes</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            The Supervisor Agent monitors SLA countdown timers in real time and automatically triggers escalations to Level 2/3 managers when the 75% elapsed threshold is exceeded.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>4. Intellectual Property & Academic Attribution</span>
          </h2>
          <p>
            This system is developed as an academic and enterprise-grade implementation of the ITIL multi-agent paradigm at Vasireddy Venkatadri Institute of Technology (VVIT), guided by Mrs. V. Asha Jyothi, based on research by Latrache et al. (2015).
          </p>
        </section>
      </div>
    </div>
  );
};
