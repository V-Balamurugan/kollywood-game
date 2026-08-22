import React, { useEffect } from 'react';
import { Flame, Trophy, Clock, Infinity as InfinityIcon, Film, Sparkles } from 'lucide-react';
import { sound } from '../services/sound';

interface ScoreHUDProps {
  score: number;
  streak: number;
  currentRound: number;
  totalRounds?: number;
  timeLeft: number;
  maxTime: number;
  difficulty?: string;
  year?: number;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  score,
  streak,
  currentRound,
  totalRounds,
  timeLeft,
  maxTime,
  difficulty,
  year
}) => {
  const isUntimed = maxTime === 0;

  // Play tick sound for final 5 seconds only if timer is enabled
  useEffect(() => {
    if (!isUntimed && timeLeft <= 5 && timeLeft > 0) {
      sound.playTick();
    }
  }, [timeLeft, isUntimed]);

  const timePercentage = !isUntimed && maxTime > 0 ? Math.max(0, Math.min(100, (timeLeft / maxTime) * 100)) : 100;
  const isTimeRunningLow = !isUntimed && timeLeft <= 10;

  // SVG Circular countdown geometry
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timePercentage / 100) * circumference;

  return (
    <div className="w-full glass-card rounded-2xl p-2.5 sm:p-3.5 border border-cinema-border/80 shadow-2xl mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Round Badge & Film Metadata */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="bg-gradient-to-r from-brand-500/20 to-amber-500/10 border border-brand-500/40 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 shadow-sm">
            <Film className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-brand-300">
              Movie
            </span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">
              #{currentRound}
            </span>
          </div>

          {difficulty && (
            <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider hidden xs:inline-block sm:inline-block ${difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                difficulty === 'medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                  'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
              {difficulty}
            </span>
          )}

          {year && (
            <span className="text-[10px] sm:text-xs font-mono font-bold text-cinema-muted bg-cinema-dark/80 px-2 py-0.5 rounded-lg border border-cinema-border/60 hidden sm:inline-block">
              {year}
            </span>
          )}
        </div>

        {/* Streak & Score Display & Timer */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Streak Flame */}
          <div className="flex items-center gap-1.5">
            <div className={`p-1.5 rounded-xl border transition-all ${streak > 1
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-md shadow-orange-500/20'
                : 'bg-cinema-surface text-cinema-muted border-cinema-border/60'
              }`}>
              <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 1 ? 'animate-bounce text-orange-400' : ''}`} />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-black text-cinema-muted leading-none">Streak</div>
              <div className="text-xs sm:text-sm font-black font-mono text-slate-100 flex items-center gap-1">
                <span>{streak}x</span>
                {streak >= 3 && (
                  <span className="text-[9px] text-amber-400 font-bold hidden md:inline">🔥 +bonus</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Score */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500/15 via-brand-500/20 to-amber-500/10 border border-brand-500/50 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-inner">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400" />
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-black text-brand-400 leading-none">Score</div>
              <div className="text-xs sm:text-base font-black font-mono text-white tracking-tight">
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Countdown Timer or Untimed Infinity Badge */}
          {isUntimed ? (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cinema-surface border border-cinema-border/70 text-slate-300 text-xs font-bold" title="Untimed Mode">
              <InfinityIcon className="w-4 h-4 text-brand-400" />
              <span className="hidden md:inline text-[11px] text-cinema-muted font-bold">No Timer</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <svg className="w-9 h-9 sm:w-11 sm:h-11 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-cinema-border/50"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className={`transition-all duration-300 ${isTimeRunningLow ? 'stroke-rose-500' : 'stroke-brand-400'
                    }`}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className={`absolute font-mono font-bold text-[10px] sm:text-xs ${isTimeRunningLow ? 'text-rose-400 animate-pulse font-black' : 'text-slate-100'
                }`}>
                {timeLeft}s
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


