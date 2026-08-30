import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Check, X, Lock, Volume2, BarChart2 } from 'lucide-react';
import { getStoredCookiePreferences, saveCookiePreferences, CookiePreferences } from '../utils/cookieConsent';
import { sound } from '../services/sound';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose }) => {
  const [prefs, setPrefs] = useState<CookiePreferences>(getStoredCookiePreferences());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrefs(getStoredCookiePreferences());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCookiePreferences(prefs);
    sound.playCorrect();
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      consentGiven: true,
      timestamp: Date.now()
    };
    setPrefs(allAccepted);
    saveCookiePreferences(allAccepted);
    sound.playCorrect();
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      preferences: false,
      analytics: false,
      consentGiven: true,
      timestamp: Date.now()
    };
    setPrefs(essentialOnly);
    saveCookiePreferences(essentialOnly);
    sound.playCorrect();
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0c101a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                Cookie & Storage Settings
              </h2>
              <p className="text-xs text-slate-400">
                Manage your privacy, 2-hour session security, and audio preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4 mb-6 max-h-[55vh] overflow-y-auto pr-1">
          {/* Essential / Security (Always Active) */}
          <div className="p-4 rounded-2xl bg-[#070a12] border border-cyan-500/40 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Strictly Necessary & Session Security</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enables core multiplayer buzzer synchronization, room codes, anti-cheat, and our automatic <strong>2-hour session timeout</strong> security policy.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 pt-1">
              <span className="w-5 h-5 rounded-full bg-cyan-400/30 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xs font-bold">
                ✓
              </span>
            </div>
          </div>

          {/* Preferences / Audio */}
          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800/80 hover:border-slate-700 flex items-start justify-between gap-3 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 mt-0.5">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">Audio & Experience Preferences</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Remembers your audio mute/volume choices, visual cinematic animations, and custom theme presets across game rounds.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 pt-1">
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Analytics & Stats */}
          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800/80 hover:border-slate-700 flex items-start justify-between gap-3 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 mt-0.5">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">Match History & Leaderboard Stats</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Retains your local highest win streaks, Cinephile Tier ranks, and personal movie solve stats on this device.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 pt-1">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleAcceptAll}
            className="w-full sm:flex-1 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            Accept All
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:flex-1 py-3 rounded-full bg-[#070a12] hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Save Preferences
          </button>
          <button
            onClick={handleRejectNonEssential}
            className="w-full sm:w-auto px-4 py-3 rounded-full text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};
