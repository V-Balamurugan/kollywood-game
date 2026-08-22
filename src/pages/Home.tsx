import React, { useState } from 'react';
import {
  Play, Users, PlusCircle, Sparkles, Trophy, Film,
  ArrowRight, Music, Heart, User, CheckCircle2, Clapperboard, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onStartSolo: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  onOpenLibrary?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  onOpenHowToPlay,
  onOpenProfile,
  onOpenLibrary
}) => {
  const { user } = useAuth();
  const [previewSample, setPreviewSample] = useState<'sample1' | 'sample2'>('sample1');

  const sampleMovies = {
    sample1: {
      title: 'Ghilli',
      year: 2004,
      hero: 'Thalapathy Vijay',
      heroine: 'Trisha',
      song: 'Appadi Podu',
      director: 'Dharani',
      music: 'Vidyasagar'
    },
    sample2: {
      title: 'Vikram',
      year: 2022,
      hero: 'Kamal Haasan',
      heroine: 'Gayathrie',
      song: 'Pathala Pathala',
      director: 'Lokesh Kanagaraj',
      music: 'Anirudh'
    }
  };

  const currentSample = sampleMovies[previewSample];

  return (
    <div className="relative min-h-[calc(100dvh-65px)] flex flex-col justify-between px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl mx-auto overflow-hidden animate-fade-in">
      {/* Dynamic Ambient Background Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-brand-500/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-80 h-80 bg-rose-500/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-80 h-80 bg-blue-500/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Header Area */}
      <div className="relative z-10 text-center max-w-4xl mx-auto pt-2 sm:pt-4">
        {/* Emblem Hero Logo */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-brand-500 to-rose-500 opacity-60 blur-xl group-hover:opacity-100 transition duration-500" />
            <img
              src="/logo.png"
              alt="Kollywood Game"
              className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover border-2 border-brand-400/80 shadow-2xl shadow-brand-500/30 transform hover:scale-105 transition-all duration-300"
            />
          </div>
        </div>

        {/* Cinema Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-brand-500/10 to-amber-500/15 border border-brand-500/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-4 sm:mb-5 shadow-lg shadow-brand-500/10">
          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
          <span>The Ultimate Kollywood Showdown</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>

        {/* Impactful Cinema Title */}
        <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.08]">
          HOW WELL DO YOU KNOW <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
            TAMIL CINEMA?
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 font-normal">
          Decipher the 2x2 grid. Guess the <strong className="text-amber-400 font-bold">Hero</strong>, <strong className="text-rose-400 font-bold">Heroine</strong>, <strong className="text-blue-400 font-bold">Movie</strong>, and <strong className="text-purple-400 font-bold">Song</strong> in real-time solo or with friends!
        </p>

        {/* Primary Action Buttons Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 sm:mb-14">
          {/* Dominant PLAY SOLO Card */}
          <button
            onClick={onStartSolo}
            className="group relative p-5 sm:p-6 rounded-3xl btn-cinema-primary text-black shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 text-left flex flex-col justify-between min-h-[140px] sm:min-h-[160px] border border-amber-300/50 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/15 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <Play className="w-5 h-5 fill-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 text-black px-2.5 py-0.5 rounded-full">
                Endless Mode
              </span>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider opacity-85 block">Solo Challenge</span>
              <h3 className="text-lg sm:text-xl font-black font-display tracking-tight flex items-center justify-between">
                <span>PLAY NOW</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h3>
            </div>
          </button>

          {/* Host Match */}
          <button
            onClick={onCreateRoom}
            className="group relative p-5 sm:p-6 rounded-3xl glass-card glass-card-hover border border-cinema-border/80 hover:border-brand-500/60 shadow-xl text-left flex flex-col justify-between min-h-[140px] sm:min-h-[160px] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center shadow-md">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cinema-muted bg-cinema-dark px-2.5 py-0.5 rounded-full border border-cinema-border/60">
                Multiplayer
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-muted block">Host Match</span>
              <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center justify-between">
                <span>Create Room</span>
                <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1.5 transition-transform" />
              </h3>
            </div>
          </button>

          {/* Join Room */}
          <button
            onClick={onJoinRoom}
            className="group relative p-5 sm:p-6 rounded-3xl glass-card glass-card-hover border border-cinema-border/80 hover:border-brand-500/60 shadow-xl text-left flex flex-col justify-between min-h-[140px] sm:min-h-[160px] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cinema-muted bg-cinema-dark px-2.5 py-0.5 rounded-full border border-cinema-border/60">
                Enter Code
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-muted block">Join Match</span>
              <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center justify-between">
                <span>Join Room</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1.5 transition-transform" />
              </h3>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive 2x2 Grid Gameplay Preview Teaser */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mb-10">
        <div className="glass-card rounded-3xl p-5 sm:p-7 border border-cinema-border/90 relative overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cinema-border/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider">
                  How The 2x2 Grid Works
                </h3>
                <p className="text-[11px] text-cinema-muted">
                  All 4 connected clues belong to the exact same blockbuster!
                </p>
              </div>
            </div>

            {/* Toggle Preview Film */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-cinema-dark p-1 rounded-2xl border border-cinema-border/70 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewSample('sample1')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  previewSample === 'sample1'
                    ? 'btn-cinema-primary text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎬 Ghilli (2004)
              </button>
              <button
                type="button"
                onClick={() => setPreviewSample('sample2')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  previewSample === 'sample2'
                    ? 'btn-cinema-primary text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎬 Vikram (2022)
              </button>
            </div>
          </div>

          {/* 2x2 Interactive Demonstration Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* HERO */}
            <div className="p-4 rounded-2xl card-category-hero border text-center relative overflow-hidden group transition-all">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-md">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-black text-amber-400 block mb-0.5 tracking-wider">Hero</span>
              <span className="text-xs sm:text-sm font-black text-white block">{currentSample.hero}</span>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Starts: {currentSample.hero.charAt(0)}</span>
              </div>
            </div>

            {/* HEROINE */}
            <div className="p-4 rounded-2xl card-category-heroine border text-center relative overflow-hidden group transition-all">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-black text-rose-400 block mb-0.5 tracking-wider">Heroine</span>
              <span className="text-xs sm:text-sm font-black text-white block">{currentSample.heroine}</span>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Starts: {currentSample.heroine.charAt(0)}</span>
              </div>
            </div>

            {/* MOVIE */}
            <div className="p-4 rounded-2xl card-category-movie border text-center relative overflow-hidden group transition-all">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-black text-blue-400 block mb-0.5 tracking-wider">Movie</span>
              <span className="text-xs sm:text-sm font-black text-white block truncate">
                {currentSample.title} ({currentSample.year})
              </span>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Starts: {currentSample.title.charAt(0)}</span>
              </div>
            </div>

            {/* SONG */}
            <div className="p-4 rounded-2xl card-category-song border text-center relative overflow-hidden group transition-all">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-md">
                <Music className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-black text-purple-400 block mb-0.5 tracking-wider">Song</span>
              <span className="text-xs sm:text-sm font-black text-white block truncate">{currentSample.song}</span>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Starts: {currentSample.song.charAt(0)}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-cinema-border/50">
            <span className="text-xs text-cinema-muted font-medium">
              🎬 Directed by <strong className="text-white">{currentSample.director}</strong> • Music by{' '}
              <strong className="text-amber-300">{currentSample.music}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 max-w-5xl mx-auto w-full pb-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/70 flex items-start gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white mb-1">35+ Curated Blockbusters</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Spanning 80s, 90s, 2000s, and modern blockbusters with Anirudh, ARR, and Yuvan hits.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/70 flex items-start gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white mb-1">Fuzzy Transliteration Matching</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Spelling variants (e.g. <em>Thalapathi</em>, <em>Rajini</em>, <em>Thala</em>) are automatically recognized.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cinema-border/70 flex items-start gap-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white mb-1">Real-time Multiplayer Arena</h4>
            <p className="text-[11px] sm:text-xs text-cinema-muted leading-relaxed">
              Share 6-character room codes to battle friends live on synchronized boards with instant feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
