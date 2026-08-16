import React from 'react';
import { X, Film, CheckCircle2, Lightbulb, Users, Flame, Trophy } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-cinema-card border border-cinema-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-cinema-cardHover text-slate-400 hover:text-white border border-cinema-border/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-black shadow-lg shadow-brand-500/20">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white">How to Play</h2>
            <p className="text-xs text-cinema-muted">The ultimate 2x2 Tamil cinema trivia challenge</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-2xl bg-cinema-cardHover/60 border border-cinema-border/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <strong className="text-white block mb-0.5">The 2x2 Film Connection</strong>
              Each round features 4 cells: <strong>Hero</strong>, <strong>Heroine</strong>, <strong>Movie</strong>, and <strong>Song</strong> — all from the exact same Kollywood blockbuster.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-cardHover/60 border border-cinema-border/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <strong className="text-white block mb-0.5">First Letters & Guessing</strong>
              Each cell starts with its first letter (e.g. <code>V</code>). Type your guess and press enter. Spelling transliterations and common aliases are forgivingly fuzzy matched!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-cardHover/60 border border-cinema-border/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <strong className="text-white block mb-0.5">Photo Reveal & Scoring</strong>
              Correct guesses unlock HD actor headshots, posters, or song thumbnails + award up to <strong>250 pts</strong> per cell. Faster guesses and streaks multiply your score.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cinema-cardHover/60 border border-cinema-border/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <strong className="text-white block mb-0.5">Multiplayer Rooms</strong>
              Create a custom room, share the 6-character code (e.g. <code>K7X2QP</code>) with friends, and compete in real-time on live leaderboards!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm shadow-lg shadow-brand-500/25 transition-colors"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
