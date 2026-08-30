import React, { useState, useEffect, useRef } from 'react';
import { ScoreHUD } from '../components/ScoreHUD';
import { GameBoard } from '../components/GameBoard';
import { LiveScoreboard } from '../components/LiveScoreboard';
import { GameResultModal } from '../components/GameResultModal';
import { CreatePuzzleModal } from '../components/CreatePuzzleModal';
import { DirectorConsole } from '../components/DirectorConsole';
import { CellCategory, Puzzle, CellAnswer, Room, DirectorHint, HintRequest } from '../types/game';
import { subscribeToRoom, submitSharedCellAnswer, advanceRound, updateUserStats, setCustomPuzzleAndStart, awardCreatorHintBounty, requestDirectorHint, sendDirectorHint, kickPlayerFromRoom, leaveRoom, voteNextRound } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getAllPuzzles } from '../services/puzzleManager';
import { PlusCircle, LogOut, AlertTriangle, UserMinus, Home, Shield, Users } from 'lucide-react';

interface MultiplayerGameProps {
  roomCode: string;
  onExitHome: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomCode,
  onExitHome
}) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRoundEnded, setIsRoundEnded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isCreateNextModalOpen, setIsCreateNextModalOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [playerLeftToast, setPlayerLeftToast] = useState<string | null>(null);
  const [autoExitModal, setAutoExitModal] = useState<{
    title: string;
    message: string;
    countdown: number;
  } | null>(null);
  const [directorRole, setDirectorRole] = useState<'director' | 'player'>('director');

  const lastNotifiedLeftTimestamp = useRef<number>(0);
  const hasHandledExit = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to live room updates
  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) {
        onExitHome();
        return;
      }

      if (user && updatedRoom.players && !updatedRoom.players[user.uid]) {
        if (!hasHandledExit.current) {
          hasHandledExit.current = true;
          setAutoExitModal({
            title: 'Removed from Match',
            message: 'You were removed from the match by the host.',
            countdown: 3
          });
        }
        return;
      }

      setRoom(updatedRoom);
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid, onExitHome]);

  // 1b. Handle player departures & automatic 2-player exit
  useEffect(() => {
    if (!room || !user) return;

    if (room.status === 'finished' && room.closedReason === 'player-left') {
      if (!hasHandledExit.current) {
        hasHandledExit.current = true;
        const leftName = room.lastLeftPlayer?.name || 'The other contestant';
        setAutoExitModal({
          title: '🎮 Match Ended',
          message: `${leftName} has left the game. Since there were only 2 players, the match has concluded.`,
          countdown: 3
        });
      }
      return;
    }

    if (room.status === 'finished' && room.closedReason === 'host-left') {
      if (!hasHandledExit.current) {
        hasHandledExit.current = true;
        setAutoExitModal({
          title: '👑 Host Ended Match',
          message: 'The room host has left the match. Returning to Home...',
          countdown: 3
        });
      }
      return;
    }

    if (room.lastLeftPlayer && room.lastLeftPlayer.uid !== user.uid) {
      if (room.lastLeftPlayer.timestamp !== lastNotifiedLeftTimestamp.current) {
        lastNotifiedLeftTimestamp.current = room.lastLeftPlayer.timestamp;
        setPlayerLeftToast(`👋 ${room.lastLeftPlayer.name} has left the match.`);
        const t = setTimeout(() => setPlayerLeftToast(null), 4500);
        return () => clearTimeout(t);
      }
    }
  }, [room?.status, room?.closedReason, room?.lastLeftPlayer, user?.uid]);

  // Auto exit countdown ticker
  useEffect(() => {
    if (!autoExitModal) return;
    if (autoExitModal.countdown <= 0) {
      onExitHome();
      return;
    }
    const timer = setTimeout(() => {
      setAutoExitModal(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoExitModal, onExitHome]);

  // Synchronized countdown timer
  useEffect(() => {
    if (!room || room.status === 'finished') return;

    const roundDuration = room.settings?.roundTimeSeconds ?? 60;
    if (roundDuration === 0) return;

    const startTime = room.roundStartTime || room.createdAt || Date.now();

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, roundDuration - elapsedSeconds);
      setTimeLeft(remaining);

      if (remaining <= 0 && !isRoundEnded) {
        setIsRoundEnded(true);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.roundStartTime, room?.currentPuzzleIndex, room?.status, room?.settings?.roundTimeSeconds, isRoundEnded]);

  useEffect(() => {
    setIsRoundEnded(false);
  }, [room?.currentPuzzleIndex, room?.customPuzzle?.id]);

  const sharedAnswers = room?.sharedAnswers || {};
  const solvedCount = Object.values(sharedAnswers).filter(a => a && a.correct).length;
  const isRoundClear = solvedCount === 4;

  useEffect(() => {
    if (isRoundClear && !isRoundEnded) {
      setIsRoundEnded(true);
    }
  }, [isRoundClear, isRoundEnded]);

  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
        <p className="text-sm text-slate-400">Connecting to game arena...</p>
      </div>
    );
  }

  const allPuzzles = getAllPuzzles();
  const currentIdx = room.currentPuzzleIndex || 0;
  const currentPuzzleId = room.puzzleIds && room.puzzleIds.length > 0
    ? room.puzzleIds[currentIdx % room.puzzleIds.length]
    : null;

  // Resolve exact active puzzle without ever falling back to a random puzzle if custom was chosen
  let currentPuzzle: Puzzle;
  if (room.customPuzzle && room.customPuzzle.movie?.name) {
    currentPuzzle = room.customPuzzle;
  } else if (currentPuzzleId) {
    const found = allPuzzles.find(p => p.id === currentPuzzleId);
    if (found) {
      currentPuzzle = found;
    } else {
      // Check stored custom puzzle library
      const localCustom = getAllPuzzles();
      currentPuzzle = localCustom.find(p => p.id === currentPuzzleId) || allPuzzles[0];
    }
  } else if (room.currentCreatorUid) {
    // If creator is set but network delayed the customPuzzle object, find creator's puzzle
    const creatorPuzzles = allPuzzles.filter(p => p.creatorUid === room.currentCreatorUid);
    currentPuzzle = creatorPuzzles[creatorPuzzles.length - 1] || allPuzzles[0];
  } else {
    currentPuzzle = allPuzzles[0];
  }

  const myPlayer = room.players?.[user.uid] || {
    uid: user.uid,
    name: user.displayName || 'Contestant',
    score: 0,
    ready: true
  };

  const isHost = room.hostUid === user.uid;
  const isCreatorOfMovie = currentPuzzle.creatorUid === user.uid;
  const isSpectator = isCreatorOfMovie && directorRole === 'director';
  const totalPlayersCount = Object.keys(room.players || {}).length;
  const isFinal = room.settings?.totalRounds ? (room.currentPuzzleIndex + 1) >= room.settings.totalRounds : false;

  const handleCellSolved = async (category: CellCategory, answer: CellAnswer) => {
    if (isSpectator || !user) return;
    const speedBonus = (room.settings?.roundTimeSeconds ?? 60) > 0 ? Math.floor((timeLeft / (room.settings?.roundTimeSeconds ?? 60)) * 200) : 0;
    const cellScore = 250 + speedBonus;
    const currentScore = myPlayer.score || 0;

    setStreak(s => s + 1);

    await submitSharedCellAnswer(roomCode, category, answer, {
      uid: user.uid,
      name: user.displayName || 'Player',
      avatar: user.photoURL || undefined
    }, cellScore, currentScore);
  };

  const handleUnlockHint = async (_hintLevel: number) => {
    if (user && !user.isGuest) {
      updateUserStats(user.uid, user.displayName || 'Player', 0, false, streak, {
        mode: 'multiplayer',
        roundsPlayed: 1
      });
    }
  };

  const handleAskDirector = async () => {
    if (!user || isCreatorOfMovie) return;
    await requestDirectorHint(roomCode, {
      uid: user.uid,
      name: user.displayName || 'Player'
    });
  };

  const handleSendDirectorHint = async (message: string) => {
    if (!user || !isCreatorOfMovie) return;
    await sendDirectorHint(roomCode, user.displayName || 'Director', user.uid, message, 100);
    await awardCreatorHintBounty(roomCode, user.uid, 100);
  };

  const handleNextRound = async () => {
    if (!isHost) return;
    const nextIdx = (room.currentPuzzleIndex || 0) + 1;
    const isFinished = room.settings?.totalRounds ? nextIdx >= room.settings.totalRounds : false;
    await advanceRound(roomCode, nextIdx, isFinished);
  };

  const handleVoteNext = async () => {
    if (!user) return;
    await voteNextRound(roomCode, user.uid);
  };

  const handleCustomNextRound = async (customPuzzle: Puzzle) => {
    setIsCreateNextModalOpen(false);
    const directorPuzzle: Puzzle = {
      ...customPuzzle,
      createdBy: user.displayName || 'Director',
      creatorUid: user.uid
    };
    await setCustomPuzzleAndStart(roomCode, directorPuzzle);
  };

  const handleStopGame = async () => {
    if (!isHost) return;
    const currentIdx = room.currentPuzzleIndex || 0;
    await advanceRound(roomCode, currentIdx, true);
  };

  const handleKickPlayer = async (targetUid: string, targetName: string) => {
    if (!isHost || targetUid === user.uid) return;
    if (window.confirm(`Kick ${targetName} from the match?`)) {
      await kickPlayerFromRoom(roomCode, targetUid);
    }
  };

  const handleExitMatch = async () => {
    setIsConfirmLeaveOpen(false);
    if (user) {
      await leaveRoom(roomCode, user.uid);
    }
    onExitHome();
  };

  const safeDirectorHints: DirectorHint[] = room.directorHints || [];
  const safeHintRequests: HintRequest[] = room.hintRequests || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 font-sans animate-fade-in relative">
      {/* Toast Alert */}
      {playerLeftToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0c101a] border-2 border-cyan-500/60 shadow-2xl text-white text-xs sm:text-sm font-bold">
          <UserMinus className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{playerLeftToast}</span>
        </div>
      )}

      {/* Top Match Arena Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 px-3 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Shield className="w-3.5 h-3.5" />
            <span>ARENA: {roomCode}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{totalPlayersCount} Players</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCreatorOfMovie && totalPlayersCount > 1 && (
            <div className="flex items-center gap-1 bg-[#0c101a] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDirectorRole('director')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  directorRole === 'director'
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👑 Director Mode
              </button>
              <button
                type="button"
                onClick={() => setDirectorRole('player')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  directorRole === 'player'
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎮 Play Along
              </button>
            </div>
          )}

          <button
            onClick={() => setIsConfirmLeaveOpen(true)}
            title="Leave Match"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Match</span>
          </button>
        </div>
      </div>

      {/* Top HUD */}
      <ScoreHUD
        score={myPlayer.score || 0}
        streak={streak}
        currentRound={(room.currentPuzzleIndex || 0) + 1}
        timeLeft={timeLeft}
        maxTime={room.settings?.roundTimeSeconds ?? 60}
        difficulty={currentPuzzle.difficulty || 'medium'}
        year={currentPuzzle.year || 2024}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main 2x2 Board Area */}
        <div className="lg:col-span-3 space-y-4">
          {isCreatorOfMovie && !isRoundEnded && !isFinal && (
            <DirectorConsole
              puzzle={currentPuzzle}
              directorName={user.displayName || 'Director'}
              hintRequests={safeHintRequests}
              directorHints={safeDirectorHints}
              answers={sharedAnswers}
              onSendHint={handleSendDirectorHint}
            />
          )}

          <GameBoard
            puzzle={currentPuzzle}
            answers={sharedAnswers}
            onCellSolved={handleCellSolved}
            disabled={isRoundEnded || isRoundClear || room.status === 'finished'}
            revealAll={isRoundEnded || isRoundClear || room.status === 'finished'}
            isSpectator={isSpectator}
            onUnlockHint={handleUnlockHint}
            directorHints={safeDirectorHints}
            onRequestDirectorHint={handleAskDirector}
          />
        </div>

        {/* Live Scoreboard Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <LiveScoreboard
            players={room.players || {}}
            answers={room.answers || {}}
            currentUid={user.uid}
            isHost={isHost}
            onKickPlayer={handleKickPlayer}
          />

          {isRoundEnded && !isFinal && (
            <button
              onClick={() => setIsCreateNextModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-[#0c101a] hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>🎨 Create Next Movie Clue</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Result Modal */}
      {(isRoundEnded || room.status === 'finished') && (
        <GameResultModal
          isFinal={room.status === 'finished'}
          roundNumber={(room.currentPuzzleIndex || 0) + 1}
          puzzle={currentPuzzle}
          userAnswers={sharedAnswers}
          players={room.players || {}}
          currentUid={user.uid}
          isHost={isHost}
          nextRoundVotes={room.nextRoundVotes || {}}
          onNextRound={handleNextRound}
          onVoteNextRound={handleVoteNext}
          onStopGame={handleStopGame}
          onCreateCustomClue={() => setIsCreateNextModalOpen(true)}
          onExit={handleExitMatch}
        />
      )}

      {/* Create Next Custom Movie Modal */}
      <CreatePuzzleModal
        isOpen={isCreateNextModalOpen}
        onClose={() => setIsCreateNextModalOpen(false)}
        onSubmit={handleCustomNextRound}
        creatorName={user.displayName || 'Host'}
        creatorUid={user.uid}
      />

      {/* Confirm In-Game Leave Modal */}
      {isConfirmLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-[#0c101a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Leave Match?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to stop playing and exit to the Home page?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsConfirmLeaveOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#070a12] border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExitMatch}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg cursor-pointer"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Player Auto Exit Modal */}
      {autoExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0c101a] border-2 border-cyan-400/80 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white">{autoExitModal.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {autoExitModal.message}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onExitHome}
                className="w-full py-3.5 rounded-full bg-cyan-400 text-black font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home ({autoExitModal.countdown}s)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
