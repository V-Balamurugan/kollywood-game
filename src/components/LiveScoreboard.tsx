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
    <div className="glass-panel rounded-2xl p-4 border border-cinema-border/70 shadow-xl">
      <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-cinema-border/50">
        <Trophy className="w-4 h-4 text-brand-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
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
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-sm shadow-brand-500/10'
                  : 'bg-cinema-card/70 border-cinema-border/40'
              }`}
            >
              {/* Rank & Avatar & Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 text-center font-mono font-bold text-xs text-cinema-muted">
                  {index === 0 ? <Crown className="w-4 h-4 text-amber-400 inline" /> : `#${index + 1}`}
                </div>

                <img
                  src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                  alt={player.name}
                  className="w-8 h-8 rounded-lg bg-cinema-cardHover border border-cinema-border object-cover"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white max-w-[90px] truncate">
                      {player.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-brand-500/20 text-brand-400 font-bold px-1 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  {/* Solved cells progress (4 dots) */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {[0, 1, 2, 3].map((cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`w-2 h-2 rounded-full ${
                          cellIdx < solvedCount
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                            : 'bg-cinema-border/60'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-cinema-muted ml-1">
                      {solvedCount}/4 solved
                    </span>
                  </div>
                </div>
              </div>

              {/* Score & Kick Action */}
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs sm:text-sm text-brand-400">
                  {player.score.toLocaleString()}
                </span>

                {isHost && !isCurrent && onKickPlayer && (
                  <button
                    onClick={() => onKickPlayer(player.uid, player.name)}
                    title={`Kick ${player.name}`}
                    className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <UserX className="w-3 h-3" />
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
