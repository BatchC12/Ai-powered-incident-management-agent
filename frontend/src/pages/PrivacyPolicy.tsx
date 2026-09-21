import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-4 text-[#EAE2D8]">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#362F28] pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#C5A880] text-xs font-mono uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Compliance & Governance</span>
          </div>
          <h1 className="text-3xl font-serif font-normal text-[#F7F3EE] tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-[#8C8479]">
            Last Updated: September 20, 2026 • ITIL-Compliant Multi-Agent System (MA-IMS)
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
          <div className="w-8 h-8 rounded-xl bg-[#2B241D] text-[#C5A880] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">Data Minimization</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed">
            Only technical diagnostics (CMDB telemetry, error logs, incident descriptions) are captured for ITIL triage.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#232B24] text-[#B5C99A] flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">Zero Third-Party Ads</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed">
            We never sell, monetize, or share your telemetry or operational logs with external advertising networks.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#2D251D] text-[#D4AF37] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#F7F3EE]">Audit & Transparency</h2>
          <p className="text-xs text-[#8C8479] leading-relaxed">
            Full audit trails track every AI agent action, solution reuse, and SLA metric calculation in the blackboard.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm leading-relaxed text-[#D8CEBF]">
        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When utilizing the Multi-Agent Incident Management System (MA-IMS), we collect operational information necessary to automate triage, semantic matchmaking, and IT resolution:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#A8A096] ml-2 font-light">
            <li><strong>Incident Telemetry:</strong> Incident title, 4-tuple semantic tags (Object, Type, Service, Problem), severity, and descriptions.</li>
            <li><strong>System Metadata:</strong> CMDB configuration item IDs, server hostnames, network port statuses, and error traces.</li>
            <li><strong>User Identifiers:</strong> Internal organizational email addresses, department role (End User, Support Technician, Administrator).</li>
            <li><strong>Performance Analytics:</strong> Client page load speed, session durations, and error logs for system optimization.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>2. Multi-Agent Data Processing & AI Inference</span>
          </h2>
          <p>
            Incident records are processed locally through our 6 ITIL-compliant software agents (User, Incident, Diagnostic, Support, Supervisor, and Administrator Agents).
          </p>
          <p className="text-xs text-[#A8A096] font-light">
            Semantic matchmaking evaluates mathematical similarities across the OWL ontology hierarchy. Automated solutions are applied only when the similarity metric exceeds the verified safety threshold, minimizing human error and latency.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#B5C99A]" />
            <span>3. Cookie & Local Storage Usage</span>
          </h2>
          <p>
            We use essential local storage keys to preserve session context and system state:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#A8A096] border border-[#362F28]">
              <thead className="bg-[#24201C] text-[#F7F3EE]">
                <tr>
                  <th className="p-2.5">Key</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#362F28]">
                <tr>
                  <td className="p-2.5 font-mono text-[#C5A880]">ma_ims_user</td>
                  <td className="p-2.5">Session authentication & active user role</td>
                  <td className="p-2.5">Persistent / Logout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#C5A880]">ma_ims_cookie_consent</td>
                  <td className="p-2.5">User consent preferences for analytics</td>
                  <td className="p-2.5">1 Year</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-[#C5A880]">ma_ims_theme</td>
                  <td className="p-2.5">Display contrast & UI preferences</td>
                  <td className="p-2.5">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E0B589]" />
            <span>4. Data Retention & Erasure</span>
          </h2>
          <p>
            Incident logs are retained in the Incident Management Database (IMDB) according to ITIL governance guidelines for post-incident reviews and machine learning ontology training. You may request data export or redaction of specific personal tokens at any time via the Administrator Console.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#1A1714] border border-[#362F28] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#F7F3EE] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#A37B5C]" />
            <span>5. Contact & Data Protection Officer</span>
          </h2>
          <p>
            For privacy inquiries, audit requests, or compliance filings, contact the engineering team:
          </p>
          <div className="p-4 rounded-xl bg-[#141210] border border-[#362F28] text-xs font-mono text-[#D8CEBF] space-y-1">
            <p><strong>Department:</strong> Department of Computer Science & Engineering (AI & ML)</p>
            <p><strong>Institution:</strong> Vasireddy Venkatadri Institute of Technology (VVIT)</p>
            <p><strong>Batch ID:</strong> CSM-C12 • Project Guide: Mrs. V. Asha Jyothi</p>
            <p><strong>Contact:</strong> dev@vvit.ac.in</p>
          </div>
        </section>
      </div>
    </div>
  );
};
