import React from 'react';
import { Shield, FileText, Scale } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="w-full bg-[#0E0D0B] border-t border-[#2E2721] text-[#D8CEBF] py-8 px-4 lg:px-8 mt-auto z-20">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Branding & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#D4AF37] via-[#C5A880] to-[#8C6D53] flex items-center justify-center text-[#141210] shadow-md shadow-[#A37B5C]/20">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#F7F3EE] tracking-wide text-sm font-serif">MA-IMS Platform</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#232B24] border border-[#3A4A3C] text-[#B5C99A] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#B5C99A] animate-pulse" />
            <span>ITIL Multi-Agent Engine Online</span>
          </div>
        </div>

        {/* Center: Legal & Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#D8CEBF]">
          <button
            type="button"
            onClick={() => onNavigateTab('privacy')}
            className="hover:text-[#C5A880] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Privacy Policy</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('terms')}
            className="hover:text-[#D4AF37] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Terms & Conditions</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('ontology')}
            className="hover:text-[#C5A880] transition-colors cursor-pointer"
          >
            <span>OWL Ontology</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('sla')}
            className="hover:text-[#E0B589] transition-colors cursor-pointer"
          >
            <span>SLA Performance</span>
          </button>
          <a
            href="https://github.com/BatchC12/Ai-powered-incident-management-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center space-x-1"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Right: Academic Attribution */}
        <div className="text-xs text-[#8C8479] text-center md:text-right font-mono">
          <span>Batch CSM-C12 • VVIT</span>
          <span className="mx-2">•</span>
          <span>Latrache et al. (2015)</span>
        </div>
      </div>
    </footer>
  );
};
