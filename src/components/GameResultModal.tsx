import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, PlusCircle, Play, StopCircle, Check, Clock } from 'lucide-react';
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
  isHost: _isHost = true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c101a] border border-slate-800 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] my-auto max-h-[92vh] overflow-y-auto">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-cyan-400 text-black shadow-[0_0_25px_rgba(6,182,212,0.6)] mb-3 animate-fade-in">
            {isFinal ? <Crown className="w-8 h-8 fill-black" /> : <Trophy className="w-8 h-8 fill-black" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
            {isFinal ? '🏆 Arena Champion Decided!' : `Movie #${roundNumber} Complete!`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isFinal
              ? isCurrentWinner
                ? '🌟 Incredible! You took 1st place in the cinema arena showdown!'
                : `👑 ${winner?.name || 'Top Contestant'} conquered the leaderboard!`
              : solvedCount === 4
              ? '🎉 Perfect round! All 4 interconnected cinema clues were identified.'
              : `Round concluded! You solved ${solvedCount}/4 movie clues.`}
          </p>
        </div>

        {/* 2x2 Movie Clue Overview */}
        <div className="rounded-2xl bg-[#070a12] border border-slate-800 p-4 mb-5 space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <img
              src={puzzle?.movie?.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${puzzle?.movie?.name}`}
              alt={puzzle?.movie?.name}
              className="w-12 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-display font-black text-white text-base truncate">
                {puzzle?.movie?.name}
              </h3>
              <span className="text-xs font-bold text-cyan-400 block">
                {puzzle?.year} • {puzzle?.genre || 'Tamil Cinema'}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Dir: <strong className="text-slate-200">{puzzle?.director || 'Tamil Director'}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[9px] uppercase font-bold text-cyan-400 block">Hero</span>
              <span className="font-bold text-white truncate block">{puzzle?.hero?.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[9px] uppercase font-bold text-pink-400 block">Heroine</span>
              <span className="font-bold text-white truncate block">{puzzle?.heroine?.name}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0c101a] border border-slate-800 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-purple-400 block">Song</span>
                <span className="font-bold text-white truncate block">{puzzle?.song?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplayer Standings (if applicable) */}
        {sortedPlayers.length > 1 && (
          <div className="rounded-2xl bg-[#070a12] border border-slate-800 p-4 mb-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Arena Leaderboard
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {sortedPlayers.map((player, idx) => {
                const isRank1 = idx === 0;
                const isCurrent = player.uid === currentUid;
                const playerReadyNext = nextRoundVotes?.[player.uid];

                return (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isRank1
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : isCurrent
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-white'
                        : 'bg-[#0c101a] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <span className="w-5 text-center font-mono font-bold text-slate-500">
                        {isRank1 ? '👑' : `#${idx + 1}`}
                      </span>
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                        alt={player.name}
                        className="w-7 h-7 rounded-lg bg-black border border-slate-800 object-cover flex-shrink-0"
                      />
                      <span className="font-bold truncate text-white">
                        {player.name} {isCurrent && <span className="text-cyan-400 text-[10px]">(You)</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isFinal && totalPlayersCount > 1 && (
                        playerReadyNext ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Reviewing</span>
                          </span>
                        )
                      )}

                      <span className="font-mono font-black text-cyan-300">
                        {(player.score || 0).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          {!isFinal && onCreateCustomClue && (
            <button
              onClick={onCreateCustomClue}
              className="w-full py-3 px-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>CREATE CUSTOM DIRECTOR CLUE</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {isFinal ? (
              <>
                {onPlayAgain && (
                  <button
                    onClick={onPlayAgain}
                    className="flex-1 py-3.5 px-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>PLAY AGAIN</span>
                  </button>
                )}
                {onExit && (
                  <button
                    onClick={onExit}
                    className="flex-1 py-3.5 px-4 rounded-full bg-[#070a12] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>RETURN TO ARENA</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {totalPlayersCount > 1 ? (
                  <button
                    onClick={handleVoteOrNext}
                    disabled={hasCurrentVoted}
                    className={`flex-1 py-3.5 px-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      hasCurrentVoted
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-black'
                    }`}
                  >
                    {hasCurrentVoted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span>Ready ({readyVotesCount}/{totalPlayersCount})</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-black text-black" />
                        <span>READY FOR NEXT ({readyVotesCount}/${totalPlayersCount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleVoteOrNext}
                    className="flex-1 py-3.5 px-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-black text-black" />
                    <span>NEXT MOVIE</span>
                  </button>
                )}

                {(onStopGame || onExit) && (
                  <button
                    onClick={onStopGame || onExit}
                    className="py-3.5 px-5 rounded-full bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Exit</span>
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
