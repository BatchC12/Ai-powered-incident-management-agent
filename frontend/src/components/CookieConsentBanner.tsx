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
      <div className="p-5 rounded-2xl bg-[#1A1714]/95 backdrop-blur-xl border border-[#3E352C] shadow-2xl shadow-black/80 text-[#EAE2D8] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2B241D] border border-[#4C3B2E] text-[#D4AF37] flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-semibold text-[#F7F3EE]">Privacy & Cookie Settings</h2>
              <div className="flex items-center space-x-1 text-[11px] text-[#B5C99A] font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>GDPR / CCPA Compliant</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-[#8C8479] hover:text-[#F7F3EE] p-1 rounded-lg hover:bg-[#25201C] transition-colors"
            title="Dismiss with essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#A8A096] leading-relaxed font-light">
          We use strictly necessary cookies to maintain session state and optional telemetry to optimize multi-agent response times. We never share data with advertising third parties.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#2C2620] text-xs">
          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="text-[#C5A880] hover:text-[#D4AF37] underline font-medium cursor-pointer"
          >
            Read Privacy Policy
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 rounded-lg bg-[#25201C] hover:bg-[#2E2722] text-[#D8CEBF] hover:text-white font-semibold transition-all border border-[#3A3229] cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C5A880] to-[#A37B5C] hover:from-[#D4B993] hover:to-[#B58A6A] text-[#141210] font-bold shadow-lg shadow-[#A37B5C]/20 transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
