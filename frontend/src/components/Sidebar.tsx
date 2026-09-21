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
      className="w-64 border-r border-[#362F28] p-4 flex flex-col justify-between hidden lg:flex sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto bg-[#141210]"
    >
      {/* Navigation List */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono font-bold text-[#8C8479] uppercase tracking-[0.2em] px-3 mb-2">
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
                  ? 'bg-gradient-to-r from-[#C5A880]/20 to-[#A37B5C]/10 text-[#D4AF37] border border-[#524436] shadow-md shadow-black/40 font-bold'
                  : 'text-[#D8CEBF] hover:text-white hover:bg-[#1E1B18]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8C8479]'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-[#D4AF37] text-[#141210]' : 'bg-[#26211C] text-[#D8CEBF]'
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
        <div className="rounded-2xl p-3.5 border border-[#362F28] bg-[#1A1714] space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono font-bold text-[#D8CEBF] tracking-wider uppercase">
              ITIL AGENT CLUSTER
            </div>
            <span className="flex items-center space-x-1 text-[10px] text-[#B5C99A] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5C99A] animate-pulse" />
              <span>6/6 Active</span>
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-[#2E2721]">
            {agentList.map((ag) => (
              <div key={ag.name} className="flex items-center justify-between text-[#D8CEBF] py-0.5">
                <span className="flex items-center space-x-1.5 truncate">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880] flex-shrink-0" />
                  <span className="truncate">{ag.name}</span>
                </span>
                <span className="text-[9px] text-[#8C8479] font-mono flex-shrink-0">{ag.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Legal Links */}
        <div className="flex items-center justify-between px-2 text-[11px] text-[#8C8479] border-t border-[#362F28] pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className="hover:text-[#C5A880] flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3 text-[#C5A880]" />
            <span>Privacy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className="hover:text-[#D4AF37] flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Scale className="w-3 h-3 text-[#D4AF37]" />
            <span>Terms</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
