import React from 'react';
import { X, Film, CheckCircle2, Lightbulb, Users, Flame, Trophy, Play } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card border border-cinema-border/90 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-xl bg-cinema-surface text-slate-400 hover:text-white border border-cinema-border/60 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
            <Film className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-display font-black text-white">How to Play</h2>
            <p className="text-[11px] sm:text-xs text-cinema-muted">The ultimate 2x2 Tamil cinema trivia challenge</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/60 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-black flex-shrink-0">
              1
            </div>
            <div>
              <strong className="text-white block mb-0.5">The 2x2 Film Connection</strong>
              Each movie puzzle features 4 cells: <strong>Hero</strong>, <strong>Heroine</strong>, <strong>Movie</strong>, and <strong>Song</strong> — all from the exact same Tamil blockbuster.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/60 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-black flex-shrink-0">
              2
            </div>
            <div>
              <strong className="text-white block mb-0.5">First Letters & Transliterations</strong>
              Each cell starts with its first letter (e.g. <code>V</code> for Vijay). Transliterations and actor/director aliases are forgivingly matched.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/60 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-black flex-shrink-0">
              3
            </div>
            <div>
              <strong className="text-white block mb-0.5">Cinema Clues Station</strong>
              Stuck? Unlock progressive clues (Year, Director, Plot Hook) from the Cinema Clues Station or ask the room Director.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/60 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-black flex-shrink-0">
              4
            </div>
            <div>
              <strong className="text-white block mb-0.5">Live Multiplayer Arena</strong>
              Create a custom match, share the 6-digit code (e.g. <code>K7X2QP</code>) with friends, and battle in real-time on live leaderboards.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl btn-cinema-primary text-black font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>GOT IT, LET'S PLAY!</span>
        </button>
      </div>
    </div>
  );
};
