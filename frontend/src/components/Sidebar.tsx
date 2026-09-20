import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  Sliders,
  Network,
  Clock,
  FileText,
  Scale,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, incidentCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents (IMDB)', icon: ShieldAlert, badge: incidentCount },
    { id: 'supervisor', label: 'Supervisor Monitor', icon: Activity },
    { id: 'admin', label: 'Agent Administration', icon: Sliders },
    { id: 'ontology', label: 'OWL Incident Ontology', icon: Network },
    { id: 'sla', label: 'SLA Governance', icon: Clock },
  ];

  const agentList = [
    { name: 'User Agent', role: 'GUI Interface' },
    { name: 'Incident Agent', role: 'IMDB & Matchmaker' },
    { name: 'Diagnostic Agent', role: 'CMDB & SLA Routing' },
    { name: 'Support Agent', role: 'Category Resolution' },
    { name: 'Supervisor Agent', role: 'Log Auto-Detect' },
    { name: 'Admin Agent', role: 'Lifecycle & Weights' },
  ];

  return (
    <aside
      aria-label="Main Navigation"
      className="w-64 border-r border-slate-800 p-4 flex flex-col justify-between hidden lg:flex sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto bg-[#070b14]"
    >
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
          ITIL Architecture
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Area: ITIL Cluster + Legal Links */}
      <div className="space-y-4 pt-4">
        {/* ITIL Multi-Agent Cluster Panel */}
        <div className="rounded-2xl p-3.5 border border-slate-800 bg-slate-900/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">
              ITIL AGENT CLUSTER
            </div>
            <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>6/6 Active</span>
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800">
            {agentList.map((ag) => (
              <div key={ag.name} className="flex items-center justify-between text-slate-300 py-0.5">
                <span className="flex items-center space-x-1.5 truncate">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="truncate">{ag.name}</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono flex-shrink-0">{ag.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Legal Links */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className="hover:text-cyan-400 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Privacy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className="hover:text-indigo-400 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Scale className="w-3 h-3 text-indigo-400" />
            <span>Terms</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
