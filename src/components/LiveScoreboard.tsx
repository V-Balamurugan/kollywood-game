import React from 'react';
import { Player, CellAnswer } from '../types/game';
import { Crown, Trophy, UserX, Medal, Sparkles } from 'lucide-react';

interface LiveScoreboardProps {
  players: Record<string, Player>;
  answers: Record<string, Record<string, CellAnswer>>;
  currentUid: string;
  isHost?: boolean;
  onKickPlayer?: (targetUid: string, targetName: string) => void;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  players,
  answers,
  currentUid,
  isHost = false,
  onKickPlayer
}) => {
  const sortedPlayers = Object.values(players || {}).sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="glass-card rounded-3xl p-3.5 sm:p-5 border border-cinema-border/80 shadow-2xl space-y-3 sm:space-y-3.5">
      {/* Header with Live Pulse */}
      <div className="flex items-center justify-between pb-2.5 border-b border-cinema-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-display font-black uppercase tracking-wider text-slate-100">
            Arena Standings
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{sortedPlayers.length} Live</span>
        </span>
      </div>

      {/* Responsive Standings Grid: 1 col on desktop, 2 col on tablet/mobile if multiple players */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5 max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto pr-0.5">
        {sortedPlayers.map((player, index) => {
          const isCurrent = player.uid === currentUid;
          const playerAnswers = answers[player.uid] || {};
          const solvedCount = Object.values(playerAnswers).filter(a => a && a.correct).length;
          const isRank1 = index === 0;
          const isRank2 = index === 1;
          const isRank3 = index === 2;

          return (
            <div
              key={player.uid}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                isRank1
                  ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-cinema-surface border-amber-500/50 shadow-md shadow-amber-500/10'
                  : isCurrent
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                  : 'bg-cinema-surface border-cinema-border/70 hover:border-cinema-border'
              }`}
            >
              {/* Rank & Avatar & Details */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-2">
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-6 text-center">
                  {isRank1 ? (
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center justify-center mx-auto shadow-sm">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  ) : isRank2 ? (
                    <div className="w-6 h-6 rounded-lg bg-slate-300/15 text-slate-200 border border-slate-300/40 flex items-center justify-center mx-auto text-[11px] font-mono font-black">
                      2
                    </div>
                  ) : isRank3 ? (
                    <div className="w-6 h-6 rounded-lg bg-amber-700/20 text-amber-400 border border-amber-700/40 flex items-center justify-center mx-auto text-[11px] font-mono font-black">
                      3
                    </div>
                  ) : (
                    <span className="font-mono font-black text-xs text-cinema-muted">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                  alt={player.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cinema-dark border border-cinema-border object-cover flex-shrink-0"
                />

                {/* Name & Solved Dots */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block max-w-[90px] sm:max-w-[120px] lg:max-w-[100px] xl:max-w-[130px]">
                      {player.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[8px] sm:text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/40 font-black px-1.5 py-0.2 rounded uppercase flex-shrink-0">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Solved Cells Progress Dots (4 clues) */}
                  <div className="flex items-center gap-1 mt-1">
                    {[0, 1, 2, 3].map((cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                          cellIdx < solvedCount
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/60 scale-110'
                            : 'bg-cinema-border/70'
                        }`}
                      />
                    ))}
                    <span className="text-[9px] sm:text-[10px] text-cinema-muted font-mono ml-1 font-semibold">
                      {solvedCount}/4
                    </span>
                  </div>
                </div>
              </div>

              {/* Score & Kick Button */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="font-mono font-black text-xs sm:text-sm text-brand-400">
                  {(player.score || 0).toLocaleString()} <span className="text-[10px] text-cinema-muted font-normal">pts</span>
                </span>

                {isHost && !isCurrent && onKickPlayer && (
                  <button
                    type="button"
                    onClick={() => onKickPlayer(player.uid, player.name)}
                    title={`Kick ${player.name} from match`}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-colors active:scale-95"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

