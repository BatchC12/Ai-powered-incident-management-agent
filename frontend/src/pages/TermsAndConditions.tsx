import React from 'react';
import { Scale, AlertTriangle, Cpu, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-4 text-[#EAE2D8]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#362F28] pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-mono uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Legal & Terms of Service</span>
          </div>
          <h1 className="text-3xl font-serif font-normal text-[#F7F3EE] tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-[#8C8479]">
            Last Updated: September 20, 2026 • Enterprise Platform Agreement
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#24201C] hover:bg-[#2C2723] text-[#D8CEBF] hover:text-white text-xs font-semibold transition-all border border-[#3E362E] hover:border-[#524436] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#2D241C] text-[#C5A880] flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">Autonomous Healing</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed font-light">
            Automated solutions are applied under strict safety thresholds defined in the ontology and supervisor policies.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#2C211A] text-[#E0B589] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">ITIL SLA Boundaries</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed font-light">
            Priority-based SLAs (P1–P4) establish target MTTR windows monitored by the real-time Supervisor Agent.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#232B24] text-[#B5C99A] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">Authorized Access</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed font-light">
            Role-based segregation guarantees only verified administrators can refine ontology concepts or approve changes.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm leading-relaxed text-[#D8CEBF]">
        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using the MA-IMS (Multi-Agent Incident Management System), enterprise personnel, IT support engineers, and administrators agree to be bound by these Terms and Conditions and the ITIL framework guidelines governing enterprise infrastructure operations.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
            <span>2. Agent Autonomous Remediation & Liability</span>
          </h2>
          <p>
            The platform features autonomous auto-healing agents that execute historical solutions based on OWL ontological matchmaking:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#A8A096] ml-2 font-light">
            <li><strong>Automated Execution:</strong> Solutions matching above the safety threshold (score &gt; 12.0) are executed automatically without manual triage intervention.</li>
            <li><strong>Support Escalation:</strong> Incidents failing exact matchmaking are routed to human Support Agents with contextual CMDB topology and diagnostic evidence.</li>
            <li><strong>Operational Safety:</strong> Administrators retain ultimate authority to freeze, override, or roll back automated agent remediation actions.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E0B589]" />
            <span>3. Service Level Agreements (SLAs) & Escalation</span>
          </h2>
          <p>
            Target resolution times are computed based on incident priority:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#201C18] border border-red-500/30 text-red-300">
              <div className="font-bold text-sm">P1 Critical</div>
              <div className="text-[#8C8479] text-[11px]">SLA: 45 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-[#201C18] border border-amber-500/30 text-amber-300">
              <div className="font-bold text-sm">P2 High</div>
              <div className="text-[#8C8479] text-[11px]">SLA: 120 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-[#201C18] border border-[#524436] text-[#D8CEBF]">
              <div className="font-bold text-sm">P3 Medium</div>
              <div className="text-[#8C8479] text-[11px]">SLA: 240 Minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-[#201C18] border border-[#3E352C] text-[#A8A096]">
              <div className="font-bold text-sm">P4 Low</div>
              <div className="text-[#8C8479] text-[11px]">SLA: 480 Minutes</div>
            </div>
          </div>
          <p className="text-xs text-[#8C8479] font-light">
            The Supervisor Agent monitors SLA countdown timers in real time and automatically triggers escalations to Level 2/3 managers when the 75% elapsed threshold is exceeded.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C99A]" />
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
