import React, { useState } from 'react';
import { 
  Film, Zap, LogIn, UserPlus, Sparkles, Mail, Lock, User as UserIcon, 
  ArrowRight, Dices, Trophy, Music, ShieldCheck, Flame, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUICK_NICKNAMES = [
  'ThalapathyFan', 'SuperstarBuff', 'AnirudhVibe', 'UlaganayaganBuff',
  'ChiyaanRasigan', 'ThalaHero', 'DhanushFan', 'CinemaRasigan'
];

export const WelcomeGate: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    playAsGuest,
    user 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [guestName, setGuestName] = useState(
    user?.displayName && !user.displayName.startsWith('Player_') 
      ? user.displayName 
      : 'ThalapathyFan'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRandomize = () => {
    const random = QUICK_NICKNAMES[Math.floor(Math.random() * QUICK_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setGuestName(`${random}_${num}`);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = guestName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    playAsGuest(chosen);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        await signInWithEmail(email, password);
      } else if (activeTab === 'signup') {
        if (!signupName.trim()) throw new Error('Please enter a player nickname.');
        await signUpWithEmail(email, password, signupName);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
    <div className="min-h-screen bg-cinema-dark text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-brand-500 selection:text-black">
      {/* Dynamic Cinema Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Simple Brand Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Film className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
                KOLLYWOOD
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                CONNECT
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-cinema-muted">Tamil Cinema 2x2 Grid Trivia Arena</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cinema-card border border-cinema-border/60 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>35+ Curated Blockbusters</span>
        </div>
      </header>

      {/* Main Login / Entry Gateway Box */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center my-auto">
        
        {/* Left Side: Cinema Showcase / Pitch */}
        <div className="flex-1 text-center lg:text-left max-w-lg lg:max-w-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-glow">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>The Ultimate Cinephile Showdown</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight tracking-tight mb-4">
            Connect The <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
              Kollywood Blockbuster
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            4 Clues. 1 Movie. Guess the <strong className="text-brand-300">Hero</strong>, <strong className="text-pink-300">Heroine</strong>, <strong className="text-blue-300">Film</strong>, and <strong className="text-purple-300">Hit Song</strong> in real-time solo or with friends!
          </p>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-left">
            <div className="p-3 rounded-2xl bg-cinema-card/80 border border-cinema-border/60">
              <Film className="w-4 h-4 text-brand-400 mb-1" />
              <div className="text-xs font-bold text-white">Classic & New</div>
              <div className="text-[10px] text-cinema-muted">Rajini to Thalapathy</div>
            </div>
            <div className="p-3 rounded-2xl bg-cinema-card/80 border border-cinema-border/60">
              <Trophy className="w-4 h-4 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-white">Live Multiplayer</div>
              <div className="text-[10px] text-cinema-muted">6-digit room codes</div>
            </div>
            <div className="p-3 rounded-2xl bg-cinema-card/80 border border-cinema-border/60">
              <Music className="w-4 h-4 text-purple-400 mb-1" />
              <div className="text-xs font-bold text-white">Audio & Clues</div>
              <div className="text-[10px] text-cinema-muted">ARR & Anirudh hits</div>
            </div>
          </div>
        </div>

        {/* Right Side: Direct Login / Entry Card */}
        <div className="w-full max-w-md bg-cinema-card/90 backdrop-blur-xl border border-cinema-border/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-brand-500/10 relative overflow-hidden">
          {/* Subtle Corner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* 3 Main Choice Tabs - Login First */}
          <div className="grid grid-cols-3 gap-1 bg-cinema-dark/90 p-1.5 rounded-2xl border border-cinema-border/70 mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setError(null); }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'signin'
                  ? 'bg-brand-500 text-black shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setError(null); }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'signup'
                  ? 'bg-brand-500 text-black shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('guest'); setError(null); }}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'guest'
                  ? 'bg-brand-500 text-black shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Guest</span>
            </button>
          </div>

          {/* Tab Content Header */}
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-display font-black text-white">
              {activeTab === 'signin' && '🔑 Sign In to Game Arena'}
              {activeTab === 'signup' && '✨ Create Cinephile Account'}
              {activeTab === 'guest' && '⚡ Play as Guest'}
            </h2>
            <p className="text-xs text-cinema-muted mt-0.5">
              {activeTab === 'signin' && 'Sign in to access your saved scores, streaks, and ranks.'}
              {activeTab === 'signup' && 'Register a permanent account to track stats and leaderboard ranking.'}
              {activeTab === 'guest' && 'Enter your nickname and start playing immediately without a password.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
              <strong>Notice:</strong> {error}
            </div>
          )}

          {/* ----------------- GUEST VIEW ----------------- */}
          {activeTab === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Player Nickname</label>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Randomize</span>
                  </button>
                </div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. ThalapathyFan42"
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Tag Pills */}
              <div>
                <span className="text-[10px] uppercase font-bold text-cinema-muted block mb-1.5">
                  Quick Moniker Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['ThalapathyFan', 'SuperstarBuff', 'AnirudhVibe', 'CinemaRasigan'].map((nick) => (
                    <button
                      key={nick}
                      type="button"
                      onClick={() => setGuestName(`${nick}_${Math.floor(10 + Math.random() * 90)}`)}
                      className="px-2.5 py-1 rounded-lg bg-cinema-dark hover:bg-brand-500/20 border border-cinema-border/70 hover:border-brand-500/40 text-[11px] text-slate-300 hover:text-brand-300 transition-colors"
                    >
                      +{nick}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-sm shadow-xl shadow-brand-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Game Arena as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-cinema-muted hover:text-brand-400 transition-colors"
                >
                  Already registered? <span className="text-brand-400 font-bold underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- SIGN IN / SIGN UP VIEW ----------------- */}
          {activeTab !== 'guest' && (
            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-cinema-border/60" />
                <span className="text-[10px] uppercase tracking-wider text-cinema-muted font-bold">Or with email</span>
                <div className="h-px flex-1 bg-cinema-border/60" />
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Player Nickname</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ThalapathyFan42"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

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
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
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
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">Connecting...</span>
                  ) : (
                    <>
                      <span>{activeTab === 'signin' ? 'Sign In & Enter Arena' : 'Create Account & Enter'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('guest')}
                  className="text-xs text-cinema-muted hover:text-brand-400 transition-colors"
                >
                  Just want to try it out? <span className="text-brand-400 font-bold underline">Play as Guest</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-cinema-muted border-t border-cinema-border/40">
        Kollywood Connect © {new Date().getFullYear()} • 2x2 Tamil Cinema Trivia Arena
      </footer>
    </div>
  );
};
