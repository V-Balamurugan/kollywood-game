import React from 'react';
import { Film, BookOpen, Trophy, HelpCircle, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenHowToPlay?: () => void;
  onOpenProfile?: () => void;
  onOpenLibrary?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowToPlay,
  onOpenProfile,
  onOpenLibrary,
  onOpenAdmin
}) => {
  return (
    <footer className="w-full glass-panel border-t border-cinema-border/60 mt-auto safe-bottom relative overflow-hidden">
      {/* Top subtle gold glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-black shadow-md shadow-brand-500/20 flex-shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent block">
                KOLLYWOOD CONNECT
              </span>
              <span className="text-[10px] text-cinema-muted block">
                Multiplayer Tamil Cinema Trivia
              </span>
            </div>
          </div>

          {/* Copyright Section (Centered on Desktop / Clear on Mobile) */}
          <div className="text-xs text-cinema-muted space-y-1">
            <p className="text-slate-300 text-[11px] sm:text-xs">
              All Rights Reserved by <strong className="text-brand-400 font-bold">Balamurugan V</strong> © 2026
            </p>
            <p className="text-[10px] text-cinema-muted flex items-center justify-center md:justify-start gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
              <span>for Tamil Cinema Buffs worldwide</span>
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            {onOpenHowToPlay && (
              <button
                onClick={onOpenHowToPlay}
                className="px-3 py-1.5 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border/50 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
                <span>Game Rules</span>
              </button>
            )}

            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="px-3 py-1.5 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border/50 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>Film Library</span>
              </button>
            )}

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border/50 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <Trophy className="w-3.5 h-3.5 text-brand-400" />
                <span>My Stats</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
