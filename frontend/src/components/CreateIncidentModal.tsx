import React, { useState, useRef, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertTriangle, ShieldAlert, Bot } from 'lucide-react';
import { api } from '../services/api';
import { analytics } from '../services/analytics';
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
  const [title, setTitle] = useState('');
  const [objectTag, setObjectTag] = useState('web browser');
  const [typeTag, setTypeTag] = useState('application');
  const [serviceTag, setServiceTag] = useState('mailing');
  const [problemTag, setProblemTag] = useState('timeout');
  const [description, setDescription] = useState('');
  
  // Bot protection state
  const [honeypot, setHoneypot] = useState('');
  const [botBlocked, setBotBlocked] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Form validation errors
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<IncidentSubmissionResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      mountTimeRef.current = Date.now();
      setBotBlocked(false);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation logic
  const validate = () => {
    const errs: { title?: string; description?: string } = {};
    if (!title.trim()) {
      errs.title = 'Incident title is required.';
    } else if (title.trim().length < 6) {
      errs.title = 'Title must be at least 6 characters.';
    } else if (title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Incident description is required.';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters of diagnostic detail.';
    }

    return errs;
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (touched.title) {
      const errs = validate();
      setErrors((prev) => ({ ...prev, title: errs.title }));
    }
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (touched.description) {
      const errs = validate();
      setErrors((prev) => ({ ...prev, description: errs.description }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true });

    // 1. Spam Bot Protection: Honeypot check
    if (honeypot.trim().length > 0) {
      console.warn('[Security] Automated submission blocked via honeypot trap.');
      setBotBlocked(true);
      return;
    }

    // 2. Spam Bot Protection: Fast submission velocity check (< 1.2s)
    const elapsedSeconds = (Date.now() - mountTimeRef.current) / 1000;
    if (elapsedSeconds < 1.2) {
      console.warn('[Security] Submission rejected: form completed unnaturally fast (bot detection).');
      setBotBlocked(true);
      return;
    }

    // 3. Validation Check
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setBotBlocked(false);

    try {
      const fullDescription = title.trim() ? `[${title.trim()}] ${description.trim()}` : description.trim();
      const res = await api.createIncident({
        object_tag: objectTag,
        type_tag: typeTag,
        service_tag: serviceTag,
        problem_tag: problemTag,
        description: fullDescription,
      });

      analytics.trackEvent('incident_created', {
        id: res.incident_id,
        match_type: res.match_type,
        object: objectTag,
        type: typeTag,
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
    setTitle('');
    setDescription('');
    setHoneypot('');
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-[#0b101b] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-bold text-white">
                User Agent — Report Incident (FR-3)
              </h2>
              <p className="text-[11px] text-slate-300">
                Submit with 4-tuple semantic tags for automated OWL matchmaking & auto-healing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {botBlocked && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
              <Bot className="w-4 h-4 shrink-0 text-red-400" />
              <span>Automated submission detected and blocked by rate-limiting security filter.</span>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Invisible Honeypot Field for Spam Bot Protection */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none', height: 0 }}
              >
                <label htmlFor="website_bot_trap">Do not fill this field</label>
                <input
                  id="website_bot_trap"
                  type="text"
                  name="website_bot_trap"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Title Field with Validation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="incident-title" className="text-xs font-semibold text-slate-200">
                    Incident Title <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">{title.length}/120</span>
                </div>
                <input
                  id="incident-title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                  placeholder="e.g., VPN Gateway rejecting authentication tokens"
                  aria-invalid={Boolean(touched.title && errors.title)}
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    touched.title && errors.title
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {touched.title && errors.title && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* 4-Tuple Semantic Tag Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="sm:col-span-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>OWL 4-Tuple Classification (Section 6)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Object, Type, Service, Problem</span>
                </div>

                <div>
                  <label htmlFor="object-tag" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Object (Source Component)
                  </label>
                  <select
                    id="object-tag"
                    value={objectTag}
                    onChange={(e) => setObjectTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  <label htmlFor="type-tag" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Type (Category)
                  </label>
                  <select
                    id="type-tag"
                    value={typeTag}
                    onChange={(e) => setTypeTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="application">Application</option>
                    <option value="hardware">Hardware</option>
                    <option value="network">Network</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="service-tag" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Service (Affected Service)
                  </label>
                  <select
                    id="service-tag"
                    value={serviceTag}
                    onChange={(e) => setServiceTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                  <label htmlFor="problem-tag" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Problem (Observed Symptom)
                  </label>
                  <select
                    id="problem-tag"
                    value={problemTag}
                    onChange={(e) => setProblemTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="timeout">Timeout</option>
                    <option value="shutdown">Shutdown</option>
                    <option value="fault">Fault</option>
                    <option value="error">Error</option>
                    <option value="crash">Crash</option>
                  </select>
                </div>
              </div>

              {/* Symptom Description Field with Validation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="incident-desc" className="text-xs font-semibold text-slate-200">
                    Detailed Symptom & Diagnostics <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Min 15 chars</span>
                </div>
                <textarea
                  id="incident-desc"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  placeholder="Describe error logs, stack traces, impacted hosts, or error behavior observed..."
                  rows={3}
                  aria-invalid={Boolean(touched.description && errors.description)}
                  className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors ${
                    touched.description && errors.description
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {touched.description && errors.description && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons with High-Contrast CTA */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit to AI Triage Agent</span>
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
                      ? `Exact Match Found (${result.matched_incident_id}) — Auto-Heal Triggered!`
                      : 'Diagnostic Routing in Progress'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">{result.message}</p>
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
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Close & View Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
