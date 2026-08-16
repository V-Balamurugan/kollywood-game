import React, { useState } from 'react';
import { Play, Users, PlusCircle, LogIn, Sparkles, Trophy, Flame, Film, ArrowRight, Music, HelpCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import puzzlesData from '../data/puzzles.json';

interface HomeProps {
  onStartSolo: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  onOpenHowToPlay,
  onOpenProfile
}) => {
  const { user, openAuthModal } = useAuth();
  const [quickCode, setQuickCode] = useState('');

  return (
    <div className="relative min-h-[calc(100dvh-60px)] sm:min-h-[calc(100vh-65px)] flex flex-col justify-between px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl mx-auto">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 text-center max-w-3xl mx-auto pt-2 sm:pt-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tamil Cinema 2x2 Grid Game</span>
        </div>

        <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white mb-4 sm:mb-6 leading-tight">
          Connect The <br />
          <span className="bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
            Kollywood Blockbuster
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-1">
          4 Clues. 1 Movie. Guess the <strong className="text-brand-300">Hero</strong>, <strong className="text-pink-300">Heroine</strong>, <strong className="text-blue-300">Film</strong>, and <strong className="text-purple-300">Chartbuster Song</strong> in real-time solo or with friends!
        </p>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 sm:mb-12">
          {/* Solo Play */}
          <button
            onClick={onStartSolo}
            className="group relative p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-brand-400 to-brand-600 text-black shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[110px] sm:min-h-[140px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black/15 flex items-center justify-center">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-80 block">Single Player</span>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight flex items-center justify-between">
                Play Solo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
            </div>
          </button>

          {/* Create Room */}
          <button
            onClick={onCreateRoom}
            className="group relative p-4 sm:p-5 rounded-3xl glass-card hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/60 shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[110px] sm:min-h-[140px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cinema-muted block">Host Match</span>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center justify-between">
                Create Room
                <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
              </h3>
            </div>
          </button>

          {/* Join Room */}
          <button
            onClick={onJoinRoom}
            className="group relative p-4 sm:p-5 rounded-3xl glass-card hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/60 shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[110px] sm:min-h-[140px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cinema-muted block">Enter 6-Char Code</span>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center justify-between">
                Join Room
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </h3>
            </div>
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full pt-2 pb-8">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/60 flex items-start gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex-shrink-0">
            <Film className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">35+ Curated Blockbusters</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Thalapathy, Superstar, Ulaganayagan, Chiyaan, Thala, Dhanush, and iconic Anirudh/ARR tracks.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/60 flex items-start gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">Fuzzy Transliteration Matching</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Spelling variants (e.g. <em>Thalapathi</em>, <em>Rajini</em>, <em>Anirudh</em>) are smartly recognized.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/60 flex items-start gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">Real-time Multiplayer</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Share 6-digit room codes to battle friends simultaneously on live synchronized boards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


