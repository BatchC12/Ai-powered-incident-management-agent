import React from 'react';
import { AlertOctagon, Home, Search, Plus } from 'lucide-react';

interface NotFoundProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigateTab, onOpenCreateModal }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      {/* Radar / Alert Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-2xl shadow-red-500/20">
          <AlertOctagon className="w-12 h-12 text-red-400 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
          404
        </div>
      </div>

      {/* Main Copy */}
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Page or Incident Not Found
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          The requested route, configuration item, or incident record does not exist in the active IMDB topology or has been archived.
        </p>
      </div>

      {/* Quick Recovery Actions (CTAs) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('incidents')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Browse Incident Queue</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-500/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Technical Diagnostics Footer */}
      <div className="pt-8 text-[11px] font-mono text-slate-400">
        Diagnostic Code: <span className="text-slate-300">ERR_ROUTING_TARGET_UNRESOLVED</span> • Blackboard Status: <span className="text-emerald-400">HEALTHY</span>
      </div>
    </div>
  );
};
