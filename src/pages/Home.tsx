import React, { useState } from 'react';
import {
  Play,
  Plus,
  LogIn,
  LayoutGrid,
  Film,
  User as UserIcon,
  Smile,
  Music,
  Clapperboard,
  Languages,
  Gamepad2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { joinRoom } from '../services/firebase';

interface HomeProps {
  onStartSolo: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  onOpenLibrary?: () => void;
  onRoomJoinedDirect?: (code: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  onOpenHowToPlay: _onOpenHowToPlay,
  onOpenProfile: _onOpenProfile,
  onOpenLibrary: _onOpenLibrary,
  onRoomJoinedDirect
}) => {
  const { user } = useAuth();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoinDirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = roomCodeInput.trim().toUpperCase();
    if (!clean) {
      onJoinRoom();
      return;
    }
    if (clean.length < 4) {
      setJoinError('Enter a valid 6-character code.');
      return;
    }
    if (!user) {
      onJoinRoom();
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const result = await joinRoom(clean, {
        uid: user.uid,
        displayName: user.displayName || 'Player',
        photoURL: user.photoURL
      });

      if (result.success && onRoomJoinedDirect) {
        onRoomJoinedDirect(clean);
      } else if (result.success) {
        onJoinRoom();
      } else {
        setJoinError(result.message || 'Room not found.');
      }
    } catch (err: any) {
      setJoinError(err?.message || 'Unable to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12 max-w-7xl mx-auto overflow-hidden animate-fade-in font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] right-0 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-[#0c101a]/80 text-slate-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm backdrop-blur-sm">
          <span>The Ultimate Kollywood Showdown</span>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2 mb-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white uppercase leading-tight">
            How Well Do You Know
          </h1>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_35px_rgba(6,182,212,0.9)]">
            Tamil Cinema?
          </h1>
        </div>

        {/* Subtitle Description */}
        <p className="text-slate-300 text-xs sm:text-sm text-center max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal">
          Decipher the 2×2 grid: Guess the Hero, Heroine, Movie, and Song in real-time!
        </p>

        {/* 3 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl mb-12">
          
          {/* Card 1: SOLO CHALLENGE / PLAY NOW */}
          <div
            onClick={onStartSolo}
            className="group relative rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between min-h-[170px] cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-1"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mb-4 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Solo Challenge
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Play Now
              </h3>
            </div>

            <div className="flex justify-end pt-2">
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Card 2: HOST MATCH / Create Room */}
          <div
            onClick={onCreateRoom}
            className="group relative rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between min-h-[170px] cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-1"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mb-4 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Host Match
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                Create Room
              </h3>
            </div>

            <div className="flex justify-end pt-2">
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Card 3: JOIN MATCH / Join Room */}
          <div className="relative rounded-2xl bg-[#0c101a]/85 border border-slate-800/90 hover:border-cyan-500/40 p-6 flex flex-col justify-between min-h-[170px] transition-all duration-300 shadow-md">
            <div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mb-4">
                <LogIn className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Join Match
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mb-3">
                Join Room
              </h3>

              {/* Room Code Input Field */}
              <form onSubmit={handleJoinDirect} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => {
                      setRoomCodeInput(e.target.value.toUpperCase());
                      setJoinError(null);
                    }}
                    placeholder="Enter Room Code"
                    className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-600 uppercase tracking-wider focus:outline-none transition-colors"
                  />
                </div>

                {joinError && (
                  <p className="text-[10px] text-rose-400">{joinError}</p>
                )}
              </form>
            </div>

            {/* Bottom Join CTA */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleJoinDirect()}
                disabled={isJoining}
                className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>{isJoining ? 'Joining...' : 'JOIN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* HOW THE 2X2 GRID WORKS Showcase Section */}
        <div className="w-full max-w-5xl rounded-2xl bg-[#0c101a]/90 border border-slate-800/90 p-6 sm:p-7 shadow-xl mb-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white font-display">
                  How The 2×2 Grid Works
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All 4 connected clues belong to the exact same blockbuster!
                </p>
              </div>
            </div>

            {/* Movie Preview Pill */}
            <div className="px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Ghilli (2004)</span>
            </div>
          </div>

          {/* 4 Connected Clue Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* HERO */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070a12] border border-slate-800/90 text-center flex flex-col items-center justify-center hover:border-cyan-500/40 transition-colors">
              <UserIcon className="w-5 h-5 text-cyan-400 mb-2" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Hero
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Thalapathy Vijay
              </span>
            </div>

            {/* HEROINE */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070a12] border border-slate-800/90 text-center flex flex-col items-center justify-center hover:border-pink-500/40 transition-colors">
              <Smile className="w-5 h-5 text-pink-400 mb-2" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-pink-300/80 block mb-1">
                Heroine
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Trisha
              </span>
            </div>

            {/* MOVIE */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070a12] border border-slate-800/90 text-center flex flex-col items-center justify-center hover:border-purple-500/40 transition-colors">
              <Film className="w-5 h-5 text-purple-400 mb-2" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-300/80 block mb-1">
                Movie
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Ghilli (2004)
              </span>
            </div>

            {/* SONG */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070a12] border border-slate-800/90 text-center flex flex-col items-center justify-center hover:border-teal-500/40 transition-colors">
              <Music className="w-5 h-5 text-teal-400 mb-2" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-300/80 block mb-1">
                Song
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Appadi Podu
              </span>
            </div>

          </div>
        </div>

        {/* 3 Bottom Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          
          {/* Highlight 1: 35+ Curated Blockbusters */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0c101a]/80 border border-slate-800/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                35+ Curated Blockbusters
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Spanning 80s, 90s, 2000s, and modern blockbusters with Anirudh, ARR, and Yuvan hits.
              </p>
            </div>
          </div>

          {/* Highlight 2: Fuzzy Transliteration */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0c101a]/80 border border-slate-800/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Fuzzy Transliteration
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Spelling variants (e.g. Thalapathy, Rajini, Thala) are automatically recognized.
              </p>
            </div>
          </div>

          {/* Highlight 3: Real-time Multiplayer */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0c101a]/80 border border-slate-800/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                Real-time Multiplayer
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Share 6-character room codes to battle friends live on synchronized boards.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
