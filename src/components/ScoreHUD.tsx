import React, { useEffect } from 'react';
import { Flame, Trophy, Infinity as InfinityIcon, Film } from 'lucide-react';
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
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timePercentage / 100) * circumference;

  return (
    <div className="w-full rounded-2xl bg-[#0c101a]/90 backdrop-blur-xl p-3 sm:p-4 border border-slate-800/90 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.06)] mb-5 font-sans">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Round Badge & Metadata */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-300">
              Round
            </span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">
              #{currentRound}{totalRounds ? `/${totalRounds}` : ''}
            </span>
          </div>

          {difficulty && (
            <span className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider hidden xs:inline-block ${
              difficulty === 'easy'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : difficulty === 'medium'
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
            }`}>
              {difficulty}
            </span>
          )}

          {year && (
            <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-400 bg-[#070a12] px-2.5 py-1 rounded-lg border border-slate-800 hidden sm:inline-block">
              {year}
            </span>
          )}
        </div>

        {/* Streak, Score & Countdown Timer */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {/* Streak Flame */}
          <div className="flex items-center gap-1.5">
            <div className={`p-1.5 rounded-xl border transition-all ${
              streak > 1
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                : 'bg-[#070a12] text-slate-500 border-slate-800'
            }`}>
              <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 1 ? 'animate-bounce text-orange-400' : ''}`} />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-500 leading-none">Streak</div>
              <div className="text-xs sm:text-sm font-black font-mono text-slate-100 flex items-center gap-1">
                <span>{streak}x</span>
                {streak >= 3 && (
                  <span className="text-[9px] text-cyan-300 font-bold hidden md:inline">🔥 +bonus</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Score */}
          <div className="flex items-center gap-2 bg-[#070a12] border border-cyan-500/30 px-3 sm:px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-cyan-400 leading-none">Score</div>
              <div className="text-xs sm:text-base font-black font-mono text-white tracking-tight">
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {isUntimed ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#070a12] border border-slate-800 text-slate-300 text-xs font-bold" title="Untimed Mode">
              <InfinityIcon className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline text-[11px] text-slate-400 font-semibold">Chill</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className={`transition-all duration-300 ${
                    isTimeRunningLow ? 'stroke-rose-500' : 'stroke-cyan-400'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className={`absolute font-mono font-black text-[10px] sm:text-xs ${
                isTimeRunningLow ? 'text-rose-400 animate-pulse' : 'text-cyan-200'
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
