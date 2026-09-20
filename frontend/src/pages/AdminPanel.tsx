import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Power,
  Server,
  CheckCircle2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import type { AgentStatus, ConfigurationItem } from '../types';

export const AdminPanel: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [factors, setFactors] = useState({ sfactor: 1.0, ofactor: 1.0, pfactor: 1.0, tfactor: 1.0 });
  const [threshold, setThreshold] = useState(12.0);
  const [cmdbItems, setCmdbItems] = useState<ConfigurationItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // New CI form
  const [newCiName, setNewCiName] = useState('');
  const [newCiType, setNewCiType] = useState('server');
  const [newCiService, setNewCiService] = useState('');
  const [newCiImpact, setNewCiImpact] = useState(2);
  const [newCiUrgency, setNewCiUrgency] = useState(2);
  const [newCiTeam] = useState('software');

  const loadAdminData = async () => {
    try {
      const [ag, cfg, cmdb] = await Promise.all([
        api.getAgents(),
        api.getMatchmakingConfig(),
        api.getCMDB(),
      ]);
      setAgents(ag || []);
      if (cfg) {
        setFactors({
          sfactor: cfg.factors.S,
          ofactor: cfg.factors.O,
          pfactor: cfg.factors.P,
          tfactor: cfg.factors.T,
        });
        setThreshold(cfg.threshold);
      }
      setCmdbItems(cmdb || []);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleAgent = async (agentName: string, isCurrentlyConnected: boolean) => {
    try {
      if (isCurrentlyConnected) {
        await api.disconnectAgent(agentName);
      } else {
        await api.connectAgent(agentName);
      }
      setNotice(`Agent '${agentName}' state updated.`);
      await loadAdminData();
    } catch (err) {
      console.error('Toggle agent failed', err);
    }
  };

  const handleUpdateFactors = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateMatchmakingConfig(factors);
      setThreshold(res.threshold);
      setNotice(`Semantic matchmaking weights updated. New threshold: ${res.threshold.toFixed(1)}`);
    } catch (err) {
      console.error('Failed to update weights', err);
    }
  };

  const handleAddCi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCiName || !newCiService) return;
    try {
      await api.createCMDBItem({
        ci_name: newCiName,
        ci_type: newCiType,
        service_name: newCiService,
        impact_level: newCiImpact,
        urgency_level: newCiUrgency,
        owner_team: newCiTeam,
      });
      setNewCiName('');
      setNewCiService('');
      setNotice(`CMDB Configuration Item added.`);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to add CI', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrator Agent & System Configuration (FR-21, FR-22)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Control agent connection states, configure OWL matchmaking weight factors, manage CMDB items, and edit SLA catalogs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid: 6 Agents Control & Matchmaker Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Connection Management (FR-21, FR-23) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Power className="w-4 h-4 text-emerald-400" />
              <span>Agent Lifecycle Control (FR-21)</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Resilience verification</span>
          </div>

          <div className="space-y-2.5">
            {agents.map((ag) => (
              <div
                key={ag.name}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2 font-bold text-slate-200">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ag.is_connected ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span>{ag.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ag.description}</p>
                </div>

                <button
                  onClick={() => handleToggleAgent(ag.name, ag.is_connected)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    ag.is_connected
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {ag.is_connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Matchmaking Weight Factors (FR-22) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>OWL Matchmaking Weights (FR-22)</span>
            </h2>
            <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
              Threshold: {threshold.toFixed(1)}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tune weight factors for the 4-tuple tags. Threshold is computed dynamically per Section 13.1:{' '}
            <code className="text-cyan-400 font-mono">3 × (Sfactor + Ofactor + Pfactor + Tfactor)</code>.
          </p>

          <form onSubmit={handleUpdateFactors} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Service Factor (Sfactor)</span>
                  <span className="font-mono font-bold text-cyan-400">{factors.sfactor.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={factors.sfactor}
                  onChange={(e) => setFactors({ ...factors, sfactor: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Object Factor (Ofactor)</span>
                  <span className="font-mono font-bold text-cyan-400">{factors.ofactor.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={factors.ofactor}
                  onChange={(e) => setFactors({ ...factors, ofactor: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Problem Factor (Pfactor)</span>
                  <span className="font-mono font-bold text-cyan-400">{factors.pfactor.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={factors.pfactor}
                  onChange={(e) => setFactors({ ...factors, pfactor: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Type Factor (Tfactor)</span>
                  <span className="font-mono font-bold text-cyan-400">{factors.tfactor.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={factors.tfactor}
                  onChange={(e) => setFactors({ ...factors, tfactor: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Save Configuration & Recompute Threshold
            </button>
          </form>
        </div>
      </div>

      {/* CMDB Configuration Items Section */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">CMDB Configuration Items ({cmdbItems.length})</h2>
          </div>
        </div>

        {/* Quick Add CI inline form */}
        <form onSubmit={handleAddCi} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <input
            type="text"
            placeholder="CI Name (e.g. prod-api-02)"
            value={newCiName}
            onChange={(e) => setNewCiName(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
            required
          />
          <input
            type="text"
            placeholder="Service (e.g. Payment)"
            value={newCiService}
            onChange={(e) => setNewCiService(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
            required
          />
          <select
            value={newCiType}
            onChange={(e) => setNewCiType(e.target.value)}
            className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
          >
            <option value="server">Server</option>
            <option value="database">Database</option>
            <option value="network_device">Network</option>
            <option value="application">Application</option>
          </select>
          <select
            value={newCiImpact}
            onChange={(e) => setNewCiImpact(parseInt(e.target.value))}
            className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
          >
            <option value={1}>Impact: 1 (Highest)</option>
            <option value={2}>Impact: 2 (High)</option>
            <option value={3}>Impact: 3 (Medium)</option>
            <option value={4}>Impact: 4 (Low)</option>
          </select>
          <select
            value={newCiUrgency}
            onChange={(e) => setNewCiUrgency(parseInt(e.target.value))}
            className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
          >
            <option value={1}>Urgency: 1 (Highest)</option>
            <option value={2}>Urgency: 2 (High)</option>
            <option value={3}>Urgency: 3 (Medium)</option>
            <option value={4}>Urgency: 4 (Low)</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add CI</span>
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cmdbItems.map((ci) => (
            <div key={ci.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{ci.ci_name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 font-mono text-[10px]">
                  {ci.ci_type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Service: {ci.service_name}</p>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Impact: {ci.impact_level}</span>
                <span>Urgency: {ci.urgency_level}</span>
                <span className="text-cyan-400">{ci.owner_team}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
