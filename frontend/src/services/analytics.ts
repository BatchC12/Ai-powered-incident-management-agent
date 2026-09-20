/**
 * Privacy-Preserving Event Telemetry & Analytics Service.
 * Respects GDPR/CCPA cookie consent stored in `ma_ims_cookie_consent`.
 * Never sends data to third-party ad networks.
 */

export interface AnalyticsPreferences {
  necessary: boolean;
  analytics: boolean;
  timestamp: string;
}

const CONSENT_KEY = 'ma_ims_cookie_consent';

export const getCookieConsent = (): AnalyticsPreferences | null => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCookieConsent = (preferences: Partial<AnalyticsPreferences>) => {
  const fullPrefs: AnalyticsPreferences = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullPrefs));
  } catch (e) {
    console.warn('Unable to persist cookie consent:', e);
  }
};

class AnalyticsService {
  private queue: Array<{ event: string; payload?: Record<string, any>; time: string }> = [];

  public trackPageView(page: string) {
    const consent = getCookieConsent();
    if (!consent?.analytics) return;

    this.record('page_view', { page, url: window.location.pathname });
  }

  public trackEvent(eventName: string, properties?: Record<string, any>) {
    const consent = getCookieConsent();
    if (!consent?.analytics) return;

    this.record(eventName, properties);
  }

  private record(event: string, payload?: Record<string, any>) {
    const item = { event, payload, time: new Date().toISOString() };
    this.queue.push(item);
    // Keep local buffer compact (max 50 events)
    if (this.queue.length > 50) this.queue.shift();

    if ((import.meta as any).env?.DEV) {
      console.log(`[MA-IMS Analytics] ${event}`, payload || '');
    }
  }

  public getRecentEvents() {
    return [...this.queue];
  }
}

export const analytics = new AnalyticsService();
