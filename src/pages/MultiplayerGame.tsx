import React, { useState, useEffect, useRef } from 'react';
import { ScoreHUD } from '../components/ScoreHUD';
import { GameBoard } from '../components/GameBoard';
import { LiveScoreboard } from '../components/LiveScoreboard';
import { GameResultModal } from '../components/GameResultModal';
import { CreatePuzzleModal } from '../components/CreatePuzzleModal';
import { DirectorConsole } from '../components/DirectorConsole';
import { CellCategory, Puzzle, CellAnswer, Room } from '../types/game';
import { subscribeToRoom, submitSharedCellAnswer, advanceRound, updateUserStats, setCustomPuzzleAndStart, awardCreatorHintBounty, requestDirectorHint, sendDirectorHint, kickPlayerFromRoom, leaveRoom, voteNextRound } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getAllPuzzles } from '../services/puzzleManager';
import { PlusCircle } from 'lucide-react';

interface MultiplayerGameProps {
  roomCode: string;
  onExitToLobby: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomCode,
  onExitToLobby
}) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRoundEnded, setIsRoundEnded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isCreateNextModalOpen, setIsCreateNextModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to live room updates
  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) {
        onExitToLobby();
        return;
      }

      // Check if current user was kicked/removed from room
      if (user && updatedRoom.players && !updatedRoom.players[user.uid]) {
        alert('You were removed from the room by the host.');
        onExitToLobby();
        return;
      }

      setRoom(updatedRoom);
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid, onExitToLobby]);

  // 2. Synchronized countdown timer based on room.roundStartTime (Skipped if roundTimeSeconds is 0)
  useEffect(() => {
    if (!room || room.status === 'finished') return;

    const roundDuration = room.settings?.roundTimeSeconds ?? 60;
    if (roundDuration === 0) return; // Untimed Chill Mode

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

  // 3. Reset round local state when puzzle index or custom puzzle changes
  useEffect(() => {
    setIsRoundEnded(false);
  }, [room?.currentPuzzleIndex, room?.customPuzzle?.id]);

  // 4. Watch for all 4 cells solved in shared answers
  const sharedAnswers = room?.sharedAnswers || {};
  const solvedCount = Object.values(sharedAnswers).filter(a => a && a.correct).length;
  const isRoundClear = solvedCount === 4;

  useEffect(() => {
    if (isRoundClear && !isRoundEnded) {
      setIsRoundEnded(true);
    }
  }, [isRoundClear, isRoundEnded]);

  // Conditional early return AFTER all hooks
  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-cinema-muted">Connecting to game arena...</p>
      </div>
    );
  }

  // Determine current puzzle: custom puzzle created in room OR sequential from dataset
  const allPuzzles = getAllPuzzles();
  const currentIdx = room.currentPuzzleIndex || 0;
  const currentPuzzleId = room.puzzleIds && room.puzzleIds.length > 0
    ? room.puzzleIds[currentIdx % room.puzzleIds.length]
    : (allPuzzles[0]?.id || 'leo-2023');
    
  const currentPuzzle: Puzzle = room.customPuzzle || allPuzzles.find(p => p.id === currentPuzzleId) || allPuzzles[0];
  
  const isHost = user.uid === room.hostUid;
  const isCreatorOfMovie = Boolean(
    currentPuzzle.creatorUid
      ? currentPuzzle.creatorUid === user.uid
      : (currentPuzzle.createdBy && currentPuzzle.createdBy === user.displayName)
  );

  const myPlayer = (room.players && room.players[user.uid]) || {
    uid: user.uid,
    name: user.displayName || 'Player',
    avatar: user.photoURL,
    score: 0,
    ready: true
  };
  
  const isFinal = room.status === 'finished';

  const handleCellSolved = async (category: CellCategory, answer: CellAnswer) => {
    // If user is creator, they cannot submit guesses
    if (isCreatorOfMovie) return;

    const points = Math.max(50, 250 - answer.hintsUsed * 50);
    await submitSharedCellAnswer(
      roomCode,
      category,
      answer,
      {
        uid: user.uid,
        name: user.displayName || 'Player',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
      },
      points,
      myPlayer.score || 0
    );

    setStreak(prev => prev + 1);
  };

  const handleUnlockHint = async (_newLevel: number) => {
    // Deduct 50 pts potential from contestant and award +50 pts to creator
    const creatorUid = currentPuzzle.creatorUid || room.currentCreatorUid;
    if (creatorUid && creatorUid !== user.uid) {
      await awardCreatorHintBounty(roomCode, creatorUid, 50);
    }
  };

  const handleAskDirector = async () => {
    await requestDirectorHint(roomCode, {
      uid: user.uid,
      name: user.displayName || 'Contestant'
    });
  };

  const handleSendDirectorHint = async (message: string) => {
    await sendDirectorHint(
      roomCode,
      user.displayName || 'Director',
      user.uid,
      message,
      50
    );
  };

  const handleNextRound = async () => {
    if (!isHost) return;
    const nextIdx = (room.currentPuzzleIndex || 0) + 1;
    await advanceRound(roomCode, nextIdx, false);
  };

  const handleStopGame = async () => {
    if (isHost) {
      const currentIdx = room.currentPuzzleIndex || 0;
      await advanceRound(roomCode, currentIdx, true);

      const playersList = Object.values(room.players || {});
      const sorted = playersList.sort((a, b) => (b.score || 0) - (a.score || 0));
      const isWinner = sorted[0]?.uid === user.uid;
      updateUserStats(user.uid, user.displayName, myPlayer.score || 0, isWinner, streak);
    } else {
      // Non-host player stopping game leaves automatically
      await leaveRoom(roomCode, user.uid);
      onExitToLobby();
    }
  };

  const handleExitMatch = async () => {
    await leaveRoom(roomCode, user.uid);
    onExitToLobby();
  };

  const handleKickPlayer = async (targetUid: string, targetName: string) => {
    if (!isHost || targetUid === user.uid) return;
    if (window.confirm(`Kick "${targetName}" from this match?`)) {
      await kickPlayerFromRoom(roomCode, targetUid);
    }
  };

  const handleVoteNext = async () => {
    if (user) {
      await voteNextRound(roomCode, user.uid);
    }
  };

  const handleCustomNextRound = async (puzzle: Puzzle) => {
    setIsCreateNextModalOpen(false);
    await setCustomPuzzleAndStart(roomCode, puzzle);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      {/* Top Notice: Live Shared Board / Custom Creator */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 text-brand-300">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <span>
            <strong>Live Shared Board:</strong> Any clue solved by ANY contestant immediately updates for everyone!
          </span>
        </div>
        {currentPuzzle.createdBy && (
          <span className="text-cinema-muted">
            Director / Creator: <strong className="text-amber-400">{currentPuzzle.createdBy}</strong>
          </span>
        )}
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
        {/* Main Board Area (3 Columns on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          {/* If current user is the Director, show Director Console */}
          {isCreatorOfMovie && !isRoundEnded && !isFinal && (
            <DirectorConsole
              puzzle={currentPuzzle}
              directorName={user.displayName || 'Director'}
              hintRequests={room.hintRequests || []}
              directorHints={room.directorHints || []}
              onSendHint={handleSendDirectorHint}
            />
          )}

          <GameBoard
            puzzle={currentPuzzle}
            answers={sharedAnswers}
            onCellSolved={handleCellSolved}
            disabled={isRoundEnded || isRoundClear || room.status === 'finished'}
            revealAll={isRoundEnded || isRoundClear || room.status === 'finished'}
            isSpectator={isCreatorOfMovie}
            onUnlockHint={handleUnlockHint}
            directorHints={room.directorHints || []}
            onRequestDirectorHint={handleAskDirector}
          />
        </div>

        {/* Live Scoreboard Sidebar (1 Column on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <LiveScoreboard
            players={room.players || {}}
            answers={room.answers || {}}
            currentUid={user.uid}
            isHost={isHost}
            onKickPlayer={handleKickPlayer}
          />

          {/* Host / Player Next Puzzle Creator Trigger */}
          {isRoundEnded && !isFinal && (
            <button
              onClick={() => setIsCreateNextModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 border border-cinema-border hover:border-brand-500/40 text-brand-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>🎨 Create Next Movie Clue</span>
            </button>
          )}
        </div>
      </div>

      {/* Round & Game Result Modal with Synchronized Next Voting */}
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
    </div>
  );
};

