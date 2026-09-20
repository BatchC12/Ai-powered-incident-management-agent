import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Activity,
  PlusCircle,
  UserCheck,
  Zap,
  Menu,
  X,
  LayoutDashboard,
  AlertCircle,
  Clock,
  Layers,
  Settings,
  FileText,
  Scale,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCreateModal }) => {
  const { user, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: Array<{ id: User['role']; label: string; cat?: string }> = [
    { id: 'system_admin', label: 'System Admin' },
    { id: 'it_service_manager', label: 'IT Service Manager' },
    { id: 'support_staff', label: 'Support (Software)', cat: 'software' },
    { id: 'support_staff', label: 'Support (Network)', cat: 'network' },
    { id: 'problem_manager', label: 'Problem Manager' },
    { id: 'end_user', label: 'End User' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'supervisor', label: 'Supervisor', icon: Activity },
    { id: 'sla', label: 'SLA Dashboard', icon: Clock },
    { id: 'ontology', label: 'OWL Ontology', icon: Layers },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/95 border-b border-slate-800 px-4 sm:px-6 py-2.5 shadow-xl shadow-black/40">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Branding & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  MA-IMS
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ITIL v3 Multi-Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium hidden sm:block">
                Ontology-Driven Incident Management
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search & High-Contrast Primary CTA */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-md justify-end sm:justify-start">
          <div className="relative flex-1 hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, OWL concepts, CMDB..."
              aria-label="Search incidents and concepts"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Report Incident</span>
          </button>
        </div>

        {/* Right: Telemetry & Role Switcher */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Matchmaker Telemetry badge */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300">Matchmaker:</span>
            <span className="text-[11px] font-mono font-bold text-cyan-300">OWL Exact/Plug-in</span>
          </div>

          {/* Supervisor Status badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Supervisor:</span>
            <span className="text-[11px] font-bold text-emerald-300">Active</span>
          </div>

          {/* ITIL Persona Switcher */}
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <label htmlFor="role-select-desktop" className="block text-[9px] text-slate-300 uppercase font-semibold">
                Active Role
              </label>
              <select
                id="role-select-desktop"
                value={`${user?.role}${user?.support_category ? `_${user.support_category}` : ''}`}
                onChange={(e) => {
                  const val = e.target.value;
                  const target = roles.find((r) => `${r.id}${r.cat ? `_${r.cat}` : ''}` === val);
                  if (target) switchRole(target.id, target.cat);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {roles.map((r, i) => (
                  <option key={i} value={`${r.id}${r.cat ? `_${r.cat}` : ''}`}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-3 pb-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">Switch Persona:</span>
            <select
              value={`${user?.role}${user?.support_category ? `_${user.support_category}` : ''}`}
              onChange={(e) => {
                const val = e.target.value;
                const target = roles.find((r) => `${r.id}${r.cat ? `_${r.cat}` : ''}` === val);
                if (target) switchRole(target.id, target.cat);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 px-2 py-1"
            >
              {roles.map((r, i) => (
                <option key={i} value={`${r.id}${r.cat ? `_${r.cat}` : ''}`}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-around pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleNavClick('privacy')}
              className="flex items-center space-x-1 hover:text-cyan-400"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Privacy</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('terms')}
              className="flex items-center space-x-1 hover:text-indigo-400"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Terms</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
