import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';

interface IncidentListProps {
  onSelectIncident: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  onSelectIncident,
  onOpenCreateModal,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const data = await api.getIncidents(params);
      setIncidents(data || []);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>Incident Management Database (IMDB)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete incident repository with OWL 4-tuple classification, SLA metrics, and verified solutions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            + Report Incident
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, affected service, or symptom..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 (Critical)</option>
              <option value="P2">P2 (High)</option>
              <option value="P3">P3 (Medium)</option>
              <option value="P4">P4 (Low)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Team:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="database">Database</option>
              <option value="security">Security</option>
              <option value="cloud">Cloud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID & Title</th>
                <th className="px-4 py-3">OWL 4-Tuple</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Team</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    {loading ? 'Loading incidents...' : 'No incidents match the selected filters.'}
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 space-y-0.5">
                      <div className="font-mono font-bold text-emerald-400">{inc.id}</div>
                      <div className="font-medium text-slate-200 line-clamp-1 max-w-sm">{inc.title}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 font-mono text-[9px] text-slate-400">
                        <span className="px-1 py-0.2 rounded bg-slate-950 border border-slate-800">
                          {inc.object_tag}
                        </span>
                        <span className="px-1 py-0.2 rounded bg-slate-950 border border-slate-800">
                          {inc.type_tag}
                        </span>
                        <span className="px-1 py-0.2 rounded bg-slate-950 border border-slate-800">
                          {inc.problem_tag}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inc.status === 'resolved' || inc.status === 'closed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inc.status === 'assigned'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          inc.priority === 'P1'
                            ? 'text-rose-400'
                            : inc.priority === 'P2'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {inc.priority || 'P3'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 capitalize">
                      {inc.assigned_support_category || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[10px]">
                      {inc.source === 'event_log' ? (
                        <span className="text-cyan-400">Supervisor Log</span>
                      ) : (
                        'User GUI'
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button className="text-slate-400 group-hover:text-emerald-400 flex items-center justify-end space-x-1 ml-auto">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
