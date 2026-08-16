import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, ArrowRight, RotateCcw, Home, Sparkles, PlusCircle, Play, StopCircle, Award, Medal, Check, Clock } from 'lucide-react';
import { Player, Puzzle, CellAnswer } from '../types/game';
import { sound } from '../services/sound';

interface GameResultModalProps {
  isFinal: boolean;
  roundNumber: number;
  totalRounds?: number;
  puzzle: Puzzle;
  userAnswers: Record<string, CellAnswer>;
  players?: Record<string, Player>;
  currentUid?: string;
  isHost?: boolean;
  nextRoundVotes?: Record<string, boolean>;
  onNextRound?: () => void;
  onVoteNextRound?: () => void;
  onStopGame?: () => void;
  onPlayAgain?: () => void;
  onCreateCustomClue?: () => void;
  onExit?: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isFinal,
  roundNumber,
  puzzle,
  userAnswers = {},
  players,
  currentUid,
  isHost = true,
  nextRoundVotes = {},
  onNextRound,
  onVoteNextRound,
  onStopGame,
  onPlayAgain,
  onCreateCustomClue,
  onExit
}) => {
  const sortedPlayers = players
    ? Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0))
    : [];

  const winner = sortedPlayers[0];
  const isCurrentWinner = winner && winner.uid === currentUid;
  const solvedCount = Object.values(userAnswers || {}).filter(a => a && a.correct).length;

  const totalPlayersCount = sortedPlayers.length;
  const readyVotesCount = sortedPlayers.filter(p => nextRoundVotes?.[p.uid]).length;
  const hasCurrentVoted = Boolean(currentUid && nextRoundVotes?.[currentUid]);

  useEffect(() => {
    sound.playVictory();
    if (isFinal) {
      // Fire celebration confetti bursts
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 }
        });
      }, 300);
    }
  }, [isFinal]);

  const handleVoteOrNext = () => {
    if (onVoteNextRound) {
      onVoteNextRound();
    } else if (onNextRound) {
      onNextRound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-cinema-card border border-cinema-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/20 my-8">
        {/* Background Ambient Lights */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-black shadow-xl shadow-brand-500/30 mb-3 animate-pop">
            {isFinal ? <Crown className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            {isFinal ? '🏆 Match Finished — Final Winner!' : `Movie #${roundNumber} Complete!`}
          </h2>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            {isFinal
              ? winner
                ? `${winner.name} scored highest with ${(winner.score || 0).toLocaleString()} points and won the game!`
                : 'Match concluded! Check out the final scores below.'
              : `Solved ${solvedCount} of 4 clues for "${puzzle?.movie?.name || 'Kollywood Film'}" (${puzzle?.year || 2024})`}
          </p>
        </div>

        {/* FINAL WINNER HERO CARD (If Game is Stopped) */}
        {isFinal && winner && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-cinema-dark border-2 border-brand-500 shadow-xl shadow-brand-500/20 text-center relative overflow-hidden animate-pop">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>Match Winner</span>
            </div>

            <div className="mt-2 flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={winner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${winner.uid}`}
                  alt={winner.name}
                  className="w-16 h-16 rounded-2xl bg-cinema-dark border-2 border-brand-400 shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-amber-400 text-black shadow">
                  <Medal className="w-3.5 h-3.5 fill-black" />
                </div>
              </div>

              <h3 className="text-lg font-display font-black text-white">
                {winner.name} {isCurrentWinner && '(You)'}
              </h3>
              
              <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                Highest Score: {(winner.score || 0).toLocaleString()} PTS 👑
              </span>

              {isCurrentWinner && (
                <div className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full">
                  🎉 Congratulations! You won this Kollywood showdown!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Film Card Solution Recap (During round recap) */}
        {!isFinal && (
          <div className="glass-panel rounded-2xl p-4 border border-cinema-border/80 mb-5 space-y-3">
            <div className="flex items-center justify-between border-b border-cinema-border/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Movie Solution Recap
              </span>
              <span className="text-xs text-cinema-muted">
                Dir: {puzzle?.director || 'Kollywood'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-cinema-cardHover/60 border border-cinema-border/40">
                <span className="text-[10px] text-cinema-muted uppercase font-bold block">Hero</span>
                <span className="font-semibold text-white truncate block">{puzzle?.hero?.name}</span>
              </div>
              <div className="p-2 rounded-xl bg-cinema-cardHover/60 border border-cinema-border/40">
                <span className="text-[10px] text-cinema-muted uppercase font-bold block">Heroine</span>
                <span className="font-semibold text-white truncate block">{puzzle?.heroine?.name}</span>
              </div>
              <div className="p-2 rounded-xl bg-cinema-cardHover/60 border border-cinema-border/40">
                <span className="text-[10px] text-cinema-muted uppercase font-bold block">Movie</span>
                <span className="font-semibold text-white truncate block">{puzzle?.movie?.name}</span>
              </div>
              <div className="p-2 rounded-xl bg-cinema-cardHover/60 border border-cinema-border/40">
                <span className="text-[10px] text-cinema-muted uppercase font-bold block">Song</span>
                <span className="font-semibold text-white truncate block">{puzzle?.song?.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Multiplayer Standings Table with Live "Next Vote" Status */}
        {sortedPlayers.length > 0 && (
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isFinal ? 'Final Leaderboard Standings' : 'Current Standings & Readiness'}
              </h4>
              {!isFinal && totalPlayersCount > 1 && (
                <span className="text-[11px] font-bold text-brand-400">
                  {readyVotesCount} / {totalPlayersCount} Ready for Next
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {sortedPlayers.map((player, idx) => {
                const isCurrent = player.uid === currentUid;
                const isRank1 = idx === 0;
                const playerReadyNext = Boolean(nextRoundVotes?.[player.uid]);

                return (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      isRank1
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : isCurrent
                        ? 'bg-brand-500/10 border-brand-500/30 text-white'
                        : 'bg-cinema-cardHover border-cinema-border/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 font-mono font-bold text-xs">
                        {isRank1 ? '👑' : `#${idx + 1}`}
                      </span>
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                        alt={player.name}
                        className="w-7 h-7 rounded-lg bg-cinema-dark border border-cinema-border object-cover"
                      />
                      <span className="text-xs font-semibold max-w-[130px] truncate">
                        {player.name} {isCurrent && '(You)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isFinal && totalPlayersCount > 1 && (
                        playerReadyNext ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cinema-muted bg-cinema-dark/80 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-400/80" />
                            Reviewing
                          </span>
                        )
                      )}

                      <span className="font-mono font-black text-xs sm:text-sm text-brand-400">
                        {(player.score || 0).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Synchronized Next Waiting Message */}
        {!isFinal && totalPlayersCount > 1 && (
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-center mb-4 space-y-0.5">
            <span className="text-xs font-bold text-white block">
              {readyVotesCount === totalPlayersCount
                ? '✓ All players ready! Starting next movie...'
                : `Waiting for all players to press Next (${readyVotesCount}/${totalPlayersCount} ready)`}
            </span>
            <p className="text-[11px] text-cinema-muted">
              Everyone stays on this page to review answers until all players are ready.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          {/* Creator Clue Trigger (Available to ANY Player!) */}
          {!isFinal && onCreateCustomClue && (
            <button
              onClick={onCreateCustomClue}
              className="w-full py-2.5 px-4 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border hover:border-brand-500/40 text-brand-400 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>🎨 Create Next Movie Clue</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            {isFinal ? (
              <>
                {onPlayAgain && (
                  <button
                    onClick={onPlayAgain}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                )}
                {onExit && (
                  <button
                    onClick={onExit}
                    className="flex-1 py-3 px-4 rounded-2xl bg-cinema-cardHover hover:bg-cinema-border/60 border border-cinema-border text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Return to Lobby / Home
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Synchronized Continue / Vote Ready Button */}
                {totalPlayersCount > 1 ? (
                  <button
                    onClick={handleVoteOrNext}
                    disabled={hasCurrentVoted}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                      hasCurrentVoted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black shadow-brand-500/25 hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {hasCurrentVoted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>✓ You are Ready! (Waiting for others...)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-black" />
                        <span>▶️ Ready for Next Movie ({readyVotesCount}/{totalPlayersCount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleVoteOrNext}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>▶️ Continue (Next Movie)</span>
                  </button>
                )}

                {/* Stop Game Button */}
                {(onStopGame || onExit) && (
                  <button
                    onClick={onStopGame || onExit}
                    className="py-3 px-4 rounded-2xl bg-cinema-cardHover hover:bg-red-500/20 border border-cinema-border hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <StopCircle className="w-4 h-4 text-red-400" />
                    <span>🛑 Stop & Leave</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
