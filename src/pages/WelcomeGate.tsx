import React, { useState } from 'react';
import {
  Film,
  Ticket,
  Key,
  User as UserIcon,
  Gamepad2,
  Clapperboard,
  ArrowRight,
  Dices,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';

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

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [guestName, setGuestName] = useState(
    user?.displayName && !user.displayName.startsWith('Player_')
      ? user.displayName
      : 'ThalapathyFan'
  );
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLostTicketNotice, setShowLostTicketNotice] = useState(false);

  const handleRandomizeGuest = () => {
    const random = QUICK_NICKNAMES[Math.floor(Math.random() * QUICK_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setGuestName(`${random}_${num}`);
  };

  const handleGoldenTicketClick = () => {
    // Instant Golden Ticket pass: enter as VIP guest
    const chosen = guestName.trim() || `VIP_${Math.floor(1000 + Math.random() * 9000)}`;
    playAsGuest(chosen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'guest') {
        const chosen = guestName.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
        playAsGuest(chosen);
        return;
      }

      const emailToUse = username.includes('@') ? username.trim() : `${username.trim().toLowerCase()}@kolwood.club`;

      if (authMode === 'signin') {
        await signInWithEmail(emailToUse, passcode);
      } else if (authMode === 'signup') {
        if (!username.trim()) throw new Error('Please enter a VIP username or email.');
        if (!passcode || passcode.length < 6) throw new Error('Passcode must be at least 6 characters.');
        await signUpWithEmail(emailToUse, passcode, username.trim());
      }
    } catch (err: any) {
      setError(err?.message || 'Access denied. Please check your credentials.');
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
      setError(err?.message || 'Google access authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-cyan-400 selection:text-black font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24 sm:pb-28 flex-1 flex flex-col justify-center">
        
        {/* Top Hero + Auth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-14 sm:mb-20">
          
          {/* Left Column: Neon Branding & Pitch */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>The Premiere Experience</span>
            </div>

            {/* Glowing Big Title */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.75)]">
                Kollywood
              </h1>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_35px_rgba(6,182,212,0.9)]">
                Game
              </h1>
            </div>

            {/* Description Text */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              The premier 2×2 Tamil Cinema trivia showdown. Connect the Hero, Heroine, Movie, and Song in real time!
            </p>

            {/* Neon Golden Ticket CTA Button */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGoldenTicketClick}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Instant VIP Entry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('guest');
                  handleRandomizeGuest();
                }}
                className="text-xs sm:text-sm text-cyan-400/90 hover:text-cyan-300 font-bold transition-colors cursor-pointer text-center"
              >
                Choose Nickname →
              </button>
            </div>
          </div>

          {/* Right Column: Enter the Lobby Pass Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.08)]">
              
              {/* Subtle inner corner lighting */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="text-center mb-6 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  {authMode === 'signin' && 'Enter the Lobby'}
                  {authMode === 'signup' && 'Create Access Pass'}
                  {authMode === 'guest' && 'Guest Entry Pass'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {authMode === 'signin' && 'Authenticate your access pass.'}
                  {authMode === 'signup' && 'Register your permanent cinema membership.'}
                  {authMode === 'guest' && 'Pick your player tag and jump straight in.'}
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              {/* Lost Ticket Info Popup / Alert */}
              {showLostTicketNotice && (
                <div className="mb-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs leading-relaxed flex items-start justify-between gap-2">
                  <span>Forgot your pass? Use Google Sign-in or play instantly with a Golden Ticket.</span>
                  <button
                    onClick={() => setShowLostTicketNotice(false)}
                    className="text-cyan-400 hover:text-white font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* GUEST PASS FORM */}
              {authMode === 'guest' ? (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300">VIP Nickname</label>
                      <button
                        type="button"
                        onClick={handleRandomizeGuest}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Randomize</span>
                      </button>
                    </div>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="VIP Username / Moniker"
                        className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Moniker Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['ThalapathyFan', 'SuperstarBuff', 'AnirudhVibe', 'CinemaRasigan'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setGuestName(`${tag}_${Math.floor(10 + Math.random() * 90)}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.7)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>ACCESS GRANTED</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      Already have an account? <span className="text-cyan-400 font-bold">Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* AUTH PASS (SIGN IN / REGISTER) FORM */
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  {/* VIP Username / Email Input */}
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="VIP Username"
                      className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Passcode Input */}
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Passcode"
                      className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Remember Me & Lost Ticket row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Remember Me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowLostTicketNotice(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                    >
                      Lost Ticket?
                    </button>
                  </div>

                  {/* ACCESS GRANTED Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.7)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3 cursor-pointer"
                  >
                    {loading ? (
                      <span className="animate-pulse">AUTHENTICATING...</span>
                    ) : (
                      <span>ACCESS GRANTED</span>
                    )}
                  </button>

                  {/* Google Authenticate Secondary */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>Authenticate via Google</span>
                  </button>

                  {/* Switch between Signin and Register */}
                  <div className="text-center pt-2 text-xs text-slate-400">
                    {authMode === 'signin' ? (
                      <p>
                        New to the cinema?{' '}
                        <button
                          type="button"
                          onClick={() => { setAuthMode('signup'); setError(null); }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1 cursor-pointer"
                        >
                          Register here
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already registered?{' '}
                        <button
                          type="button"
                          onClick={() => { setAuthMode('signin'); setError(null); }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1 cursor-pointer"
                        >
                          Sign in here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Section: Experience Highlights */}
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Section Divider Header */}
          <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-cyan-500/50 max-w-xs" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)] text-center">
              Experience Highlights
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cyan-500/30 to-cyan-500/50 max-w-xs" />
          </div>

          {/* 3 Ticket Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Multiplayer */}
            <div className="relative flex rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] group">
              {/* Left Main Ticket Info */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                    <Gamepad2 className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Multiplayer</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Engage in real-time movie trivia battles with friends.
                  </p>
                </div>
              </div>

              {/* Perforated Stub Divider */}
              <div className="w-12 border-l border-dashed border-slate-800/90 bg-[#090d16] flex items-center justify-center relative">
                {/* Top and bottom ticket cutout semicircles */}
                <div className="absolute -top-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-b border-slate-800" />
                <div className="absolute -bottom-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-t border-slate-800" />
                
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
                  ADMIT 1
                </span>
              </div>
            </div>

            {/* Card 2: Mastery */}
            <div className="relative flex rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] group">
              {/* Left Main Ticket Info */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                    <Clapperboard className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Mastery</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Level up your cinematic knowledge and rank up.
                  </p>
                </div>
              </div>

              {/* Perforated Stub Divider */}
              <div className="w-12 border-l border-dashed border-slate-800/90 bg-[#090d16] flex items-center justify-center relative">
                <div className="absolute -top-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-b border-slate-800" />
                <div className="absolute -bottom-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-t border-slate-800" />
                
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
                  VIP
                </span>
              </div>
            </div>

            {/* Card 3: Rewards */}
            <div className="relative flex rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] group">
              {/* Left Main Ticket Info */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                    <Award className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Rewards</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Exchange points for exclusive physical merchandise.
                  </p>
                </div>
              </div>

              {/* Perforated Stub Divider */}
              <div className="w-12 border-l border-dashed border-slate-800/90 bg-[#090d16] flex items-center justify-center relative">
                <div className="absolute -top-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-b border-slate-800" />
                <div className="absolute -bottom-2 left-[-6px] w-3 h-3 rounded-full bg-[#070a12] border-t border-slate-800" />
                
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase [writing-mode:vertical-rl] rotate-180 select-none">
                  BONUS
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Fixed Footer */}
      <Footer isFixed={true} />
    </div>
  );
};
