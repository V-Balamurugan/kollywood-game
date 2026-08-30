import React from 'react';
import { Player, CellAnswer } from '../types/game';
import { Crown, Trophy, UserX } from 'lucide-react';

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
    <div className="rounded-3xl bg-[#0c101a]/90 p-4 sm:p-5 border border-slate-800/90 shadow-2xl space-y-3.5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-display font-black uppercase tracking-wider text-slate-100">
            Standings
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{sortedPlayers.length} Live</span>
        </span>
      </div>

      {/* Standings List */}
      <div className="grid grid-cols-1 gap-2 max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto pr-0.5">
        {sortedPlayers.map((player, index) => {
          const isCurrent = player.uid === currentUid;
          const playerAnswers = answers[player.uid] || {};
          const solvedCount = Object.values(playerAnswers).filter(a => a && a.correct).length;
          const isRank1 = index === 0;

          return (
            <div
              key={player.uid}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isRank1
                  ? 'bg-gradient-to-r from-amber-950/40 via-[#070a12] to-[#070a12] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : isCurrent
                  ? 'bg-[#070a12] border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                  : 'bg-[#070a12] border-slate-800/80'
              }`}
            >
              {/* Rank & Avatar & Name */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div className="flex-shrink-0 w-6 text-center">
                  {isRank1 ? (
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center justify-center mx-auto shadow-sm">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  ) : (
                    <span className="font-mono font-black text-xs text-slate-500">
                      #{index + 1}
                    </span>
                  )}
                </div>

                <img
                  src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                  alt={player.name}
                  className="w-8 h-8 rounded-xl bg-black border border-slate-800 object-cover flex-shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block max-w-[100px]">
                      {player.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-black px-1.5 py-0.2 rounded uppercase flex-shrink-0">
                        YOU
                      </span>
                    )}
                  </div>
                  {solvedCount > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < solvedCount ? 'bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Score & Host Kick */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="font-mono font-black text-xs sm:text-sm text-cyan-300 tracking-tight">
                  {(player.score || 0).toLocaleString()}
                </div>

                {isHost && !isCurrent && onKickPlayer && (
                  <button
                    onClick={() => onKickPlayer(player.uid, player.name)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950 transition-colors"
                    title="Kick player"
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
