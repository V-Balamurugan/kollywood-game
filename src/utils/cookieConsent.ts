export interface CookiePreferences {
  essential: boolean; // Always true
  preferences: boolean; // Sound volume, visual fx, theme
  analytics: boolean; // Match history, win streak, leaderboards
  consentGiven: boolean;
  timestamp: number;
}

const COOKIE_NAME = 'kollywood_cookie_consent';
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  preferences: true,
  analytics: true,
  consentGiven: false,
  timestamp: 0
};

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = 30 * 24 * 60 * 60): void {
  if (typeof document === 'undefined') return;
  const secureFlag = window.location.protocol === 'https:' ? '; Secure; SameSite=Lax' : '; SameSite=Lax';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/${secureFlag}`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/`;
}

export function getStoredCookiePreferences(): CookiePreferences {
  try {
    const raw = getCookie(COOKIE_NAME);
    if (raw) {
      return JSON.parse(raw) as CookiePreferences;
    }
    const local = localStorage.getItem(COOKIE_NAME);
    if (local) {
      return JSON.parse(local) as CookiePreferences;
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_PREFERENCES;
}

export function saveCookiePreferences(prefs: Partial<CookiePreferences>): CookiePreferences {
  const updated: CookiePreferences = {
    ...DEFAULT_PREFERENCES,
    ...prefs,
    essential: true, // Non-negotiable
    consentGiven: true,
    timestamp: Date.now()
  };

  const serialized = JSON.stringify(updated);
  setCookie(COOKIE_NAME, serialized, 365 * 24 * 60 * 60); // 1 year consent retention
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COOKIE_NAME, serialized);
  }

  // Dispatch event for components to react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kollywood_cookie_consent_updated', { detail: updated }));
  }

  return updated;
}
