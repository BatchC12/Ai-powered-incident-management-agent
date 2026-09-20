import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { IncidentSubmissionResponse } from '../types';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (incidentId: string) => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated,
}) => {
  const [objectTag, setObjectTag] = useState('web browser');
  const [typeTag, setTypeTag] = useState('application');
  const [serviceTag, setServiceTag] = useState('mailing');
  const [problemTag, setProblemTag] = useState('timeout');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<IncidentSubmissionResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createIncident({
        object_tag: objectTag,
        type_tag: typeTag,
        service_tag: serviceTag,
        problem_tag: problemTag,
        description,
      });
      setResult(res);
      if (onIncidentCreated) {
        onIncidentCreated(res.incident_id);
      }
    } catch (err) {
      console.error('Failed to submit incident', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setResult(null);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0b101b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">User Agent — Report Incident (FR-3)</h2>
              <p className="text-[11px] text-slate-400">
                Submit an incident with 4-tuple tags for OWL semantic matchmaking.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 4-Tuple Semantic Tag Selectors */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="col-span-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>OWL 4-Tuple Classification (Section 6)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Object, Type, Service, Problem</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Object (Source component)
                  </label>
                  <select
                    value={objectTag}
                    onChange={(e) => setObjectTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="web browser">Web Browser</option>
                    <option value="printer">Printer</option>
                    <option value="server">Server</option>
                    <option value="router">Router</option>
                    <option value="database">Database</option>
                    <option value="firewall">Firewall</option>
                    <option value="loadbalancer">Load Balancer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Type (Category)
                  </label>
                  <select
                    value={typeTag}
                    onChange={(e) => setTypeTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="application">Application</option>
                    <option value="hardware">Hardware</option>
                    <option value="network">Network</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Service (Affected Service)
                  </label>
                  <select
                    value={serviceTag}
                    onChange={(e) => setServiceTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mailing">Corporate Mailing</option>
                    <option value="printing">Printing Service</option>
                    <option value="connection">Connection / Gateway</option>
                    <option value="authentication">Single Sign-On / Auth</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Core Banking">Core Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Problem (Observed Symptom)
                  </label>
                  <select
                    value={problemTag}
                    onChange={(e) => setProblemTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="timeout">Timeout</option>
                    <option value="shutdown">Shutdown</option>
                    <option value="fault">Fault</option>
                    <option value="error">Error</option>
                    <option value="crash">Crash</option>
                  </select>
                </div>
              </div>

              {/* Symptom Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Symptom & Incident Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, error codes, affected users, or system behavior..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Incident Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Results Presentation after Matchmaking */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  result.match_type === 'exact'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {result.match_type === 'exact' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="font-bold text-sm">
                    {result.match_type === 'exact'
                      ? `Exact Match Found (${result.matched_incident_id}) — Solution Auto-Reused!`
                      : 'Diagnostic Routing in Progress'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{result.message}</p>
              </div>

              {result.solution && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Auto-Applied Solution from IMDB Knowledge Base
                  </div>
                  <p className="text-xs text-slate-200 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {result.solution}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
