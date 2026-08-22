import React from 'react';
import { Player, CellAnswer } from '../types/game';
import { Crown, CheckCircle2, User, Trophy, UserX } from 'lucide-react';

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
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 border border-cinema-border shadow-2xl">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-cinema-border/60">
        <Trophy className="w-4 h-4 text-brand-400" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
          Live Arena Standings
        </h3>
      </div>

      <div className="space-y-2.5">
        {sortedPlayers.map((player, index) => {
          const isCurrent = player.uid === currentUid;
          const playerAnswers = answers[player.uid] || {};
          const solvedCount = Object.values(playerAnswers).filter(a => a.correct).length;

          return (
            <div
              key={player.uid}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isCurrent
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-md shadow-brand-500/10'
                  : 'bg-cinema-surface border-cinema-border/70'
                }`}
            >
              {/* Rank & Avatar & Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 text-center font-mono font-black text-xs text-cinema-muted">
                  {index === 0 ? <Crown className="w-4 h-4 text-amber-400 inline" /> : `#${index + 1}`}
                </div>

                <img
                  src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                  alt={player.name}
                  className="w-8 h-8 rounded-xl bg-cinema-dark border border-cinema-border object-cover"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white max-w-[95px] truncate">
                      {player.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-brand-500/20 text-brand-300 font-black px-1.5 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  {/* Solved cells progress (4 dots) */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {[0, 1, 2, 3].map((cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`w-2 h-2 rounded-full transition-all ${cellIdx < solvedCount
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 scale-110'
                            : 'bg-cinema-border'
                          }`}
                      />
                    ))}
                    <span className="text-[10px] text-cinema-muted font-mono ml-1">
                      {solvedCount}/4
                    </span>
                  </div>
                </div>
              </div>

              {/* Score & Kick Action */}
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs sm:text-sm text-brand-400">
                  {player.score.toLocaleString()} pts
                </span>

                {isHost && !isCurrent && onKickPlayer && (
                  <button
                    onClick={() => onKickPlayer(player.uid, player.name)}
                    title={`Kick ${player.name}`}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-colors"
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
