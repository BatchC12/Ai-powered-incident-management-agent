import React from 'react';
import {
  ShieldAlert,
  Search,
  Activity,
  PlusCircle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab, onOpenCreateModal }) => {
  const { user, switchRole } = useAuth();

  const roles: Array<{ id: User['role']; label: string; cat?: string }> = [
    { id: 'system_admin', label: 'System Admin' },
    { id: 'it_service_manager', label: 'IT Service Manager' },
    { id: 'support_staff', label: 'Support (Software)', cat: 'software' },
    { id: 'support_staff', label: 'Support (Network)', cat: 'network' },
    { id: 'problem_manager', label: 'Problem Manager' },
    { id: 'end_user', label: 'End User' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/95 border-b border-slate-800/80 px-6 py-2.5 shadow-xl shadow-black/40">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                MA-IMS
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ITIL v3 Multi-Agent
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Ontology-Driven Incident Management Platform
            </p>
          </div>
        </div>

        {/* Center: Search & Create Button */}
        <div className="flex items-center space-x-3 flex-1 max-w-lg">
          <div className="relative flex-1 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, OWL concepts, CMDB services..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Right: Telemetry & Role Switcher */}
        <div className="flex items-center space-x-4">
          {/* Matchmaker Telemetry badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Matchmaker:</span>
            <span className="text-[11px] font-mono font-bold text-cyan-400">OWL Exact/Plug-in</span>
          </div>

          {/* Supervisor Status badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">Supervisor:</span>
            <span className="text-[11px] font-bold text-emerald-400">Polling</span>
          </div>

          {/* ITIL Persona Switcher */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Role</div>
              <select
                value={user.support_category ? `${user.role}:${user.support_category}` : user.role}
                onChange={(e) => {
                  const val = e.target.value;
                  const [r, cat] = val.split(':');
                  switchRole(r as User['role'], cat);
                }}
                className="text-xs font-bold text-emerald-400 bg-transparent border-0 focus:outline-none cursor-pointer"
              >
                {roles.map((r, i) => {
                  const val = r.cat ? `${r.id}:${r.cat}` : r.id;
                  return (
                    <option key={i} value={val} className="bg-slate-900 text-slate-200">
                      {r.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
