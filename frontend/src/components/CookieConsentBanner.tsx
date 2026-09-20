import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../services/analytics';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      // Show after a brief delay for smooth UX
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent({ analytics: true });
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    setCookieConsent({ analytics: false });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 text-slate-200 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Privacy & Cookie Settings</h2>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>GDPR / CCPA Compliant</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss with essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use strictly necessary cookies to maintain session state and optional telemetry to optimize multi-agent response times. We never share data with advertising third parties.
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            Read Privacy Policy
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-all border border-slate-700 cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
