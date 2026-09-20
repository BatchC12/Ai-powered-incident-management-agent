import React, { useEffect, useState } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { EventLog, SupervisorStatus } from '../types';

export const SupervisorMonitor: React.FC = () => {
  const [status, setStatus] = useState<SupervisorStatus | null>(null);
  const [logs, setLogs] = useState<EventLog[]>([]);

  // Injection Form State
  const [sourceSystem, setSourceSystem] = useState('prod-web-01');
  const [serviceName, setServiceName] = useState('Payment Gateway');
  const [logLevel, setLogLevel] = useState('CRITICAL');
  const [message, setMessage] = useState('HTTP 504 Gateway Timeout detected on checkout endpoint');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionNotice, setInjectionNotice] = useState<string | null>(null);

  const fetchStatusAndLogs = async () => {
    try {
      const [st, lg] = await Promise.all([
        api.getSupervisorStatus(),
        api.getEventLogs({ limit: 40 }),
      ]);
      setStatus(st);
      setLogs(lg || []);
    } catch (err) {
      console.error('Failed to fetch supervisor telemetry', err);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
    const timer = setInterval(fetchStatusAndLogs, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = async () => {
    await api.startSupervisor();
    await fetchStatusAndLogs();
  };

  const handleStop = async () => {
    await api.stopSupervisor();
    await fetchStatusAndLogs();
  };

  const handlePollNow = async () => {
    const res = await api.pollSupervisorNow();
    setInjectionNotice(`Manual poll executed: detected ${res.detected_events} incidents.`);
    await fetchStatusAndLogs();
  };

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsInjecting(true);
    setInjectionNotice(null);
    try {
      await api.injectEventLog({
        source_system: sourceSystem,
        service_name: serviceName,
        log_level: logLevel,
        message,
      });
      setInjectionNotice(`Log injected! Supervisor auto-detection triggered.`);
      setMessage('');
      await fetchStatusAndLogs();
    } catch (err) {
      console.error('Failed to inject log', err);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Supervisor Agent & Event Log Monitor (FR-1, FR-2)
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Continuously inspects raw system event logs, applies noise suppression & duplicate detection (FR-5),
            classifies 4-tuple tags, and dispatches incident queries to the Incident Agent.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {status?.is_monitoring ? (
            <button
              onClick={handleStop}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Pause Detection</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Detection</span>
            </button>
          )}

          <button
            onClick={handlePollNow}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent State</span>
          <div className="text-base font-bold text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{status?.is_monitoring ? 'Monitoring' : 'Paused'}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-Detected Incidents</span>
          <div className="text-xl font-bold font-mono text-white">{status?.detected_count || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suppressed Duplicates</span>
          <div className="text-xl font-bold font-mono text-cyan-400">{status?.suppressed_count || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Polling Interval</span>
          <div className="text-xl font-bold font-mono text-indigo-400">{status?.poll_interval_seconds || 15}s</div>
        </div>
      </div>

      {/* Grid: Inject Log Form (Left) & Live Log Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Injector Form for Demo */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Cpu className="w-5 h-5" />
            <h2 className="text-sm font-bold">Simulate Error Activity</h2>
          </div>
          <p className="text-[11px] text-slate-400">
            Inject abnormal log messages to demonstrate real-time Supervisor Agent detection and classification.
          </p>

          {injectionNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{injectionNotice}</span>
            </div>
          )}

          <form onSubmit={handleInject} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Source System</label>
              <input
                type="text"
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Log Level</label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Log Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isInjecting || !message.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isInjecting ? 'Injecting...' : 'Inject Event Log & Trigger Agent'}
            </button>
          </form>
        </div>

        {/* Live Event Log Stream */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">Event Log Database Stream</h2>
            <span className="text-[11px] text-slate-500 font-mono">{logs.length} entries recorded</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No event logs found.</div>
            ) : (
              logs.map((lg) => (
                <div
                  key={lg.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          lg.log_level === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : lg.log_level === 'ERROR'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lg.log_level}
                      </span>
                      <span className="text-slate-300 font-semibold">{lg.source_system}</span>
                      <span className="text-slate-500">({lg.service_name})</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                      {lg.incident_id ? (
                        <span className="text-emerald-400 font-bold">Created {lg.incident_id}</span>
                      ) : lg.processed_by_supervisor ? (
                        <span className="text-slate-500">Processed</span>
                      ) : (
                        <span className="text-amber-400">Unprocessed</span>
                      )}
                      <span>{new Date(lg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-mono text-[11px]">{lg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
