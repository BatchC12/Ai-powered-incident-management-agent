import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-4 text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Compliance & Governance</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">
            Last Updated: September 20, 2026 • ITIL-Compliant Multi-Agent System (MA-IMS)
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
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Data Minimization</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only technical diagnostics (CMDB telemetry, error logs, incident descriptions) are captured for ITIL triage.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Zero Third-Party Ads</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never sell, monetize, or share your telemetry or operational logs with external advertising networks.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Audit & Transparency</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full audit trails track every AI agent action, solution reuse, and SLA metric calculation in the blackboard.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm leading-relaxed text-slate-300">
        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When utilizing the Multi-Agent Incident Management System (MA-IMS), we collect operational information necessary to automate triage, semantic matchmaking, and IT resolution:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 ml-2">
            <li><strong>Incident Telemetry:</strong> Incident title, 4-tuple semantic tags (Object, Type, Service, Problem), severity, and descriptions.</li>
            <li><strong>System Metadata:</strong> CMDB configuration item IDs, server hostnames, network port statuses, and error traces.</li>
            <li><strong>User Identifiers:</strong> Internal organizational email addresses, department role (End User, Support Technician, Administrator).</li>
            <li><strong>Performance Analytics:</strong> Client page load speed, session durations, and error logs for system optimization.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>2. Multi-Agent Data Processing & AI Inference</span>
          </h2>
          <p>
            Incident records are processed locally through our 6 ITIL-compliant software agents (User, Incident, Diagnostic, Support, Supervisor, and Administrator Agents).
          </p>
          <p className="text-xs text-slate-400">
            Semantic matchmaking evaluates mathematical similarities across the OWL ontology hierarchy. Automated solutions are applied only when the similarity metric exceeds the verified safety threshold, minimizing human error and latency.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>3. Cookie & Local Storage Usage</span>
          </h2>
          <p>
            We use essential local storage keys to preserve session context and system state:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-400 border border-slate-800">
              <thead className="bg-slate-800/60 text-slate-200">
                <tr>
                  <th className="p-2.5">Key</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-2.5 font-mono text-cyan-300">ma_ims_user</td>
                  <td className="p-2.5">Session authentication & active user role</td>
                  <td className="p-2.5">Persistent / Logout</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-cyan-300">ma_ims_cookie_consent</td>
                  <td className="p-2.5">User consent preferences for analytics</td>
                  <td className="p-2.5">1 Year</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-cyan-300">ma_ims_theme</td>
                  <td className="p-2.5">Display contrast & UI preferences</td>
                  <td className="p-2.5">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>4. Data Retention & Erasure</span>
          </h2>
          <p>
            Incident logs are retained in the Incident Management Database (IMDB) according to ITIL governance guidelines for post-incident reviews and machine learning ontology training. You may request data export or redaction of specific personal tokens at any time via the Administrator Console.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>5. Contact & Data Protection Officer</span>
          </h2>
          <p>
            For privacy inquiries, audit requests, or compliance filings, contact the engineering team:
          </p>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
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
