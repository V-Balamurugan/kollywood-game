import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Sparkles, Film, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail, signUpWithEmail, playAsGuest } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

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
        playAsGuest(displayName);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-cinema-card border border-cinema-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/10 overflow-hidden">
        {/* Glowing background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-cinema-cardHover text-slate-400 hover:text-white border border-cinema-border/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Film className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black tracking-tight text-white">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Cinema Account'}
              {mode === 'guest' && 'Play As Guest'}
            </h2>
            <p className="text-xs text-cinema-muted">
              {mode === 'signin' && 'Sign in to track your scores, stats and streaks.'}
              {mode === 'signup' && 'Join the Kollywood Connect community.'}
              {mode === 'guest' && 'Jump straight into the game with a nickname.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-cinema-dark/80 p-1 rounded-2xl border border-cinema-border/60 mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('guest'); setError(null); }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'guest'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed space-y-2">
            <div>
              <strong>Authentication Notice:</strong> {error}
            </div>
            {error.includes('invalid-credential') && (
              <div className="pt-2 border-t border-red-500/20 space-y-2">
                <p className="text-[11px] text-slate-300">
                  If you don't have an account yet, click <strong>Sign Up</strong> below to register, or jump straight in as Guest!
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('signup');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border hover:border-brand-500/40 text-brand-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>👉 Go to Sign Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('guest');
                      playAsGuest(displayName || 'Cinema Buff');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Play as Guest</span>
                  </button>
                </div>
              </div>
            )}

            {error.includes('unauthorized-domain') && (
              <div className="pt-2 border-t border-red-500/20 space-y-2">
                <p className="text-[11px] text-slate-300">
                  Google Auth requires your current domain/IP (e.g. <code className="text-amber-400 font-mono">{window.location.hostname}</code>) to be added in <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('guest');
                    playAsGuest(displayName || 'Cinema Buff');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Play as Guest Instantly (No Setup Needed)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Google One-Click Auth */}
        {mode !== 'guest' && (
          <div className="mb-5">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-cinema-cardHover hover:bg-cinema-border/60 border border-cinema-border text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-cinema-border/60" />
              <span className="text-[11px] uppercase tracking-wider text-cinema-muted">Or with email</span>
              <div className="h-px flex-1 bg-cinema-border/60" />
            </div>
          </div>
        )}

        {/* Email & Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Player Nickname</label>
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Guest Nickname</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. CinemaLover"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-cinema-muted mt-2">
                No sign-up required! You can play solo or join rooms immediately.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
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
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-bold text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account & Play'}
                  {mode === 'guest' && 'Enter as Guest'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
