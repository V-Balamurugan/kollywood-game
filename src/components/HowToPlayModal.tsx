import React from 'react';
import { X, Film, Play, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c101a] border border-slate-800 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#070a12] text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#070a12] border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
              How to Play
            </h2>
            <p className="text-xs text-slate-400">The 2×2 Tamil Cinema Trivia Grid Rules</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-black text-xs flex-shrink-0">
              1
            </div>
            <div>
              <strong className="text-white block mb-0.5">The 2×2 Film Connection</strong>
              Each movie puzzle features 4 cells: <strong>Hero</strong>, <strong>Heroine</strong>, <strong>Movie</strong>, and <strong>Song</strong> — all 4 belong to the exact same blockbuster.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-400 flex items-center justify-center font-mono font-black text-xs flex-shrink-0">
              2
            </div>
            <div>
              <strong className="text-white block mb-0.5">First Letters & Transliterations</strong>
              Each cell displays its first letter (e.g. <code>V</code> for Vijay). Aliases and spelling variations are automatically recognized.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center font-mono font-black text-xs flex-shrink-0">
              3
            </div>
            <div>
              <strong className="text-white block mb-0.5">Cinema Clues Station</strong>
              Need assistance? Unlock progressive clues (Release Year, Director, Music Director, Plot Hook) from the clues drawer.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-400 flex items-center justify-center font-mono font-black text-xs flex-shrink-0">
              4
            </div>
            <div>
              <strong className="text-white block mb-0.5">Live Multiplayer Arena</strong>
              Create a custom match, share the 6-character room pass code with friends, and battle in real-time on live buzzer leaderboards.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.65)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black text-black" />
          <span>GOT IT, LET'S PLAY!</span>
        </button>
      </div>
    </div>
  );
};
