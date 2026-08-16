import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User as UserIcon, Sparkles, Film, ArrowRight, 
  Zap, LogIn, UserPlus, ArrowLeft, CheckCircle2, ShieldCheck, Dices
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

  // Sync internal mode with context
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-cinema-card border border-cinema-border rounded-3xl p-5 sm:p-7 shadow-2xl shadow-brand-500/10 overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        {/* Glowing background accent */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          title="Dismiss and Continue"
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-xl bg-cinema-cardHover text-slate-400 hover:text-white border border-cinema-border/50 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* -------------------- 1. WELCOME 3-CHOICE LANDING VIEW -------------------- */}
        {mode === 'welcome' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Badge & Title */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Film className="w-3.5 h-3.5" />
                <span>Kollywood Connect Arena</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                Welcome, Cinephile!
              </h2>
              <p className="text-xs sm:text-sm text-cinema-muted mt-1 max-w-sm mx-auto">
                How would you like to enter the 2x2 Tamil Cinema game?
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
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
                className="group relative w-full p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-brand-500/15 via-amber-500/10 to-transparent hover:from-brand-500/25 hover:via-amber-500/20 border border-brand-500/40 hover:border-brand-400 text-left transition-all duration-200 active:scale-[0.99] shadow-lg shadow-brand-500/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-black shadow-md shadow-brand-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-5 h-5 fill-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-brand-300 transition-colors">
                          Play as Guest
                        </h3>
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                          Instant Play
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Jump straight into solo puzzles & rooms. No password required!
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:translate-x-1 transition-transform flex-shrink-0">
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
                className="group relative w-full p-4 sm:p-4.5 rounded-2xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border hover:border-cyan-500/50 text-left transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-cyan-300 transition-colors">
                          Sign In
                        </h3>
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                          Returning
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Resume your scores, win streaks, and cinephile tier progress.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-cinema-card text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0">
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
                className="group relative w-full p-4 sm:p-4.5 rounded-2xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border hover:border-purple-500/50 text-left transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-display text-white group-hover:text-purple-300 transition-colors">
                          Sign Up
                        </h3>
                        <span className="text-[10px] bg-purple-500/15 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                          New Account
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                        Create your permanent profile, unlock badges & top the leaderboard.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-cinema-card text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>

            {/* Quick 1-Click Google Sign In */}
            <div className="pt-2">
              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-cinema-border/60" />
                <span className="text-[10px] uppercase tracking-wider text-cinema-muted font-bold">Or Instant Login</span>
                <div className="h-px flex-1 bg-cinema-border/60" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        )}

        {/* -------------------- 2. DETAIL FORMS (GUEST / SIGN IN / SIGN UP) -------------------- */}
        {mode !== 'welcome' && (
          <div className="animate-fade-in">
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('welcome');
                  setAuthModalMode('welcome');
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-brand-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Options</span>
              </button>

              <span className="text-[11px] text-cinema-muted">
                {mode === 'signin' && 'Step: Sign In'}
                {mode === 'signup' && 'Step: Sign Up'}
                {mode === 'guest' && 'Step: Guest Setup'}
              </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pr-6">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0">
                <Film className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-white">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'guest' && 'Play As Guest'}
                </h2>
                <p className="text-[11px] sm:text-xs text-cinema-muted">
                  {mode === 'signin' && 'Sign in to track scores and streaks.'}
                  {mode === 'signup' && 'Join the Kollywood Connect community.'}
                  {mode === 'guest' && 'Pick your nickname and jump right into the game.'}
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-cinema-dark/80 p-1 rounded-2xl border border-cinema-border/60 mb-5">
              <button
                type="button"
                onClick={() => { setMode('guest'); setAuthModalMode('guest'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'guest'
                    ? 'bg-brand-500 text-black font-black shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Guest
              </button>
              <button
                type="button"
                onClick={() => { setMode('signin'); setAuthModalMode('signin'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-brand-500 text-black font-black shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setAuthModalMode('signup'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-brand-500 text-black font-black shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed space-y-2">
                <div>
                  <strong>Notice:</strong> {error}
                </div>
                {error.includes('invalid-credential') && (
                  <div className="pt-2 border-t border-red-500/20 space-y-2">
                    <p className="text-[11px] text-slate-300">
                      No account found with this email/password. You can sign up in seconds or play as guest!
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setError(null); setMode('signup'); }}
                        className="flex-1 py-2 px-3 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border text-brand-400 font-bold text-xs"
                      >
                        👉 Sign Up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectGuest('Cinema Buff')}
                        className="flex-1 py-2 px-3 rounded-xl bg-brand-500 text-black font-bold text-xs"
                      >
                        ⚡ Play as Guest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google One-Click Auth for Sign In / Sign Up */}
            {mode !== 'guest' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="h-px flex-1 bg-cinema-border/60" />
                  <span className="text-[10px] uppercase tracking-wider text-cinema-muted font-bold">Or with email</span>
                  <div className="h-px flex-1 bg-cinema-border/60" />
                </div>
              </div>
            )}

            {/* Detail Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Player Nickname</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ThalapathyFan42"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === 'guest' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Choose Your Guest Nickname</span>
                      <button
                        type="button"
                        onClick={handleRandomizeNickname}
                        className="text-[11px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Randomize</span>
                      </button>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="e.g. ThalapathyFan99"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Nicknames */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cinema-muted block mb-1.5">
                      Popular Tamil Cinema Monikers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['ThalapathyFan', 'SuperstarBuff', 'AnirudhVibe', 'CinemaRasigan'].map((nick) => (
                        <button
                          key={nick}
                          type="button"
                          onClick={() => setDisplayName(`${nick}_${Math.floor(10 + Math.random() * 90)}`)}
                          className="px-2.5 py-1 rounded-lg bg-cinema-dark hover:bg-brand-500/20 border border-cinema-border/70 hover:border-brand-500/40 text-[11px] text-slate-300 hover:text-brand-300 transition-colors"
                        >
                          +{nick}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-cinema-muted">
                    ✓ No sign-up required! You can play solo or host/join multiplayer rooms instantly.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Connecting...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In to Arena'}
                      {mode === 'signup' && 'Create Account & Play'}
                      {mode === 'guest' && 'Enter Arena as Guest'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
