import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Zap,
  Code,
  History,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident, MatchResults } from '../types';

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [matches, setMatches] = useState<MatchResults | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [solutionText, setSolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'matchmaker' | 'xml' | 'audit'>('matchmaker');

  const loadIncidentData = async () => {
    try {
      const [inc, matchData, audit] = await Promise.all([
        api.getIncidentById(incidentId),
        api.getIncidentMatches(incidentId),
        api.getIncidentAudit(incidentId),
      ]);
      setIncident(inc);
      setMatches(matchData);
      setAuditTrail(audit || []);
    } catch (err) {
      console.error('Failed to load incident detail', err);
    }
  };

  useEffect(() => {
    loadIncidentData();
  }, [incidentId]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionText.trim()) return;

    setIsResolving(true);
    try {
      await api.resolveIncident(incidentId, solutionText);
      setSolutionText('');
      await loadIncidentData();
    } catch (err) {
      console.error('Failed to resolve incident', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.closeIncident(incidentId);
      await loadIncidentData();
    } catch (err) {
      console.error('Failed to close incident', err);
    }
  };

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading incident record...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incidents Queue</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono font-bold text-emerald-400">{incident.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  incident.status === 'resolved' || incident.status === 'closed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : incident.status === 'assigned'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {incident.status}
              </span>
              {incident.priority && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-200">
                  Priority {incident.priority}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{incident.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{incident.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            {incident.status !== 'closed' && (
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Incident
              </button>
            )}
          </div>
        </div>

        {/* 4-Tuple Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Object (O)</span>
            <div className="text-xs font-semibold text-emerald-400 font-mono">{incident.object_tag}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Type (T)</span>
            <div className="text-xs font-semibold text-cyan-400 font-mono">{incident.type_tag}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Service (S)</span>
            <div className="text-xs font-semibold text-indigo-400 font-mono">{incident.service_tag}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Problem (P)</span>
            <div className="text-xs font-semibold text-amber-400 font-mono">{incident.problem_tag}</div>
          </div>
        </div>
      </div>

      {/* Solutions Display */}
      {incident.solutions && incident.solutions.length > 0 && (
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="text-sm font-bold">Recorded ITIL Resolution</h2>
          </div>
          {incident.solutions.map((sol) => (
            <div
              key={sol.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1 font-mono text-xs text-slate-200"
            >
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                Method: {sol.resolution_method}
              </div>
              <p className="leading-relaxed">{sol.solution_text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Support Staff Solution Entry */}
      {incident.status !== 'resolved' && incident.status !== 'closed' && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Support Agent Resolution Submission (FR-17)
          </h3>
          <p className="text-[11px] text-slate-400">
            Submit verified solution. The solution will be recorded in the IMDB and reused for future matching incidents.
          </p>
          <form onSubmit={handleResolve} className="space-y-3">
            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Enter technical fix details, commands executed, or remediation steps..."
              rows={3}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isResolving || !solutionText.trim()}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Solution & Resolve</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subtabs: Matchmaker / XML / Audit Trail */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubTab('matchmaker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'matchmaker'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>OWL Semantic Matchmaker</span>
          </button>
          <button
            onClick={() => setActiveSubTab('xml')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'xml'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>XML Representation (FR-4)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'audit'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ITIL Audit Trail ({auditTrail.length})</span>
          </button>
        </div>

        {/* Tab 1: Semantic Matchmaker Results */}
        {activeSubTab === 'matchmaker' && (
          <div className="space-y-4">
            {matches && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Matchmaker Threshold: {matches.threshold.toFixed(1)}</span>
                <span className="text-slate-400">
                  Factors: S={matches.factors.S} O={matches.factors.O} P={matches.factors.P} T={matches.factors.T}
                </span>
              </div>
            )}

            {/* Exact Incident Table */}
            <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Exact Incident Table (Score &gt;= {matches?.threshold.toFixed(1)})</span>
              </h3>
              {matches?.exact_matches && matches.exact_matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.exact_matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-emerald-400">{m.id}: {m.title}</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Score: {m.score.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2 rounded">
                        Solution: {m.solution}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No exact matches in IMDB for this 4-tuple combination.</p>
              )}
            </div>

            {/* Possible Incident Table */}
            <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Possible Incident Table (Suggestions for Support Staff)</span>
              </h3>
              {matches?.possible_matches && matches.possible_matches.length > 0 ? (
                <div className="space-y-2">
                  {matches.possible_matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-300">{m.id}: {m.title}</span>
                        <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                          Score: {m.score.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                        Past Solution: {m.solution}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No similar incidents found in knowledge pool.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: XML Representation */}
        {activeSubTab === 'xml' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-400">
            <pre className="whitespace-pre-wrap">{incident.xml_representation || 'No XML record generated.'}</pre>
          </div>
        )}

        {/* Tab 3: ITIL Audit Trail */}
        {activeSubTab === 'audit' && (
          <div className="space-y-2">
            {auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start space-x-3 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{entry.agent_name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                      {entry.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{entry.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
