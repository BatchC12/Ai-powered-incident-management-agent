import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  Sliders,
  Network,
  Clock,
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
    { name: 'User Agent', role: 'GUI Interface', active: true },
    { name: 'Admin Agent', role: 'Lifecycle & Weights', active: true },
    { name: 'Supervisor Agent', role: 'Log Auto-Detect', active: true },
    { name: 'Incident Agent', role: 'IMDB & Matchmaker', active: true },
    { name: 'Diagnostic Agent', role: 'CMDB & SLA Routing', active: true },
    { name: 'Support Agents', role: 'Category Resolution', active: true },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between hidden lg:flex sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto bg-[#090d16]">
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
          ITIL Architecture
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ITIL Multi-Agent Cluster Panel */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 mt-6 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">ITIL AGENT CLUSTER</div>
          <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>6/6 Active</span>
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800/80">
          {agentList.map((ag) => (
            <div key={ag.name} className="flex items-center justify-between text-slate-300 py-0.5">
              <span className="flex items-center space-x-1.5 truncate">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{ag.name}</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{ag.role}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
