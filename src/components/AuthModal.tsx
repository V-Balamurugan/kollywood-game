import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User as UserIcon, Film, ArrowRight,
  Zap, LogIn, UserPlus, ArrowLeft, ShieldCheck, Dices
} from 'lucide-react';
import { useAuth, AuthModalMode } from '../context/AuthContext';

const QUICK_NICKNAMES = [
  'ThalapathyFan', 'SuperstarBuff', 'AnirudhVibe', 'UlaganayaganBuff',
  'ChiyaanRasigan', 'ThalaHero', 'DhanushFan', 'CinemaRasigan'
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    playAsGuest,
    user
  } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(authModalMode || 'welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode || 'welcome');
      setError(null);
      if (!displayName && user?.displayName && !user.displayName.startsWith('Player_')) {
        setDisplayName(user.displayName);
      }
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleRandomizeNickname = () => {
    const random = QUICK_NICKNAMES[Math.floor(Math.random() * QUICK_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setDisplayName(`${random}_${num}`);
  };

  const handleDirectGuest = (customName?: string) => {
    const chosen = (customName || displayName || '').trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    playAsGuest(chosen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Please enter a display name.');
        await signUpWithEmail(email, password, displayName);
      } else if (mode === 'guest') {
        handleDirectGuest();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c101a] border border-slate-800 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          title="Dismiss and Continue"
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#070a12] text-slate-400 hover:text-white border border-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. WELCOME 3-CHOICE LANDING VIEW */}
        {mode === 'welcome' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider mb-3">
                <Film className="w-3.5 h-3.5" />
                <span>KOLLYWOOD GAME ARENA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
                Welcome, Cinephile!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                How would you like to enter the 2×2 Tamil Cinema arena?
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* 3 Main Choice Cards */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Option 1: Play as Guest */}
              <button
                type="button"
                onClick={() => {
                  setMode('guest');
                  setAuthModalMode('guest');
                }}
                className="group relative w-full p-4 sm:p-5 rounded-2xl bg-[#070a12] hover:bg-cyan-950/20 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all shadow-lg cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5 fill-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-cyan-300 transition-colors">
                          Play as Guest
                        </h3>
                        <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-black px-2 py-0.5 rounded-full border border-cyan-500/30">
                          Instant Pass
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Jump straight into solo puzzles & rooms. No password required!
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0c101a] text-cyan-400 flex items-center justify-center group-hover:translate-x-1 transition-transform flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Option 2: Sign In */}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setAuthModalMode('signin');
                }}
                className="group relative w-full p-4 sm:p-5 rounded-2xl bg-[#070a12] hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-cyan-300 transition-colors">
                          Sign In
                        </h3>
                        <span className="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-800">
                          Returning
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Resume your scores, win streaks, and cinephile tier progress.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0c101a] text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Option 3: Sign Up */}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthModalMode('signup');
                }}
                className="group relative w-full p-4 sm:p-5 rounded-2xl bg-[#070a12] hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-purple-300 transition-colors">
                          Sign Up
                        </h3>
                        <span className="text-[10px] bg-purple-950/80 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                          New Profile
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Create your permanent profile, unlock badges & top the leaderboard.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0c101a] text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>

            {/* Quick 1-Click Google Sign In */}
            <div className="pt-2">
              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Or Instant Login</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#070a12] hover:bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.3L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. FORM MODES: GUEST / SIGNIN / SIGNUP */}
        {mode !== 'welcome' && (
          <div className="space-y-4 animate-fade-in">
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Options</span>
            </button>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                {mode === 'guest' && 'Quick Guest Entry'}
                {mode === 'signin' && 'Sign In to Profile'}
                {mode === 'signup' && 'Create Cinephile Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'guest' && 'Choose your cinema pseudonym and enter immediately.'}
                {mode === 'signin' && 'Enter your credentials to load your saved rank & scores.'}
                {mode === 'signup' && 'Register your permanent account with email.'}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {(mode === 'signup' || mode === 'guest') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">
                      Contestant Name
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomizeNickname}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. ThalapathyFan_99"
                      className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none"
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}

              {mode !== 'guest' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] disabled:opacity-50 transition-all cursor-pointer mt-2"
              >
                {loading ? 'PROCESSING...' : mode === 'guest' ? 'ENTER AS GUEST' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
