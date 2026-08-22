import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Users, Play, Crown, ArrowLeft, Share2, Sparkles, PlusCircle, Film, UserX, UserMinus, LogOut, Home } from 'lucide-react';
import { Room, Puzzle, Player } from '../types/game';
import { subscribeToRoom, setPlayerReady, setCustomPuzzleAndStart, kickPlayerFromRoom, leaveRoom } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CreatePuzzleModal } from '../components/CreatePuzzleModal';

interface RoomLobbyProps {
  roomCode: string;
  onGameStarted: (room?: any) => void;
  onLeaveRoom: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  roomCode,
  onGameStarted,
  onLeaveRoom
}) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [playerLeftToast, setPlayerLeftToast] = useState<string | null>(null);
  const [autoExitModal, setAutoExitModal] = useState<{
    title: string;
    message: string;
    countdown: number;
  } | null>(null);

  const lastNotifiedLeftTimestamp = useRef<number>(0);
  const hasHandledExit = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) {
        onLeaveRoom();
        return;
      }

      // Check if current user was kicked/removed from room
      if (user && updatedRoom.players && !updatedRoom.players[user.uid]) {
        if (!hasHandledExit.current) {
          hasHandledExit.current = true;
          setAutoExitModal({
            title: 'Removed from Room',
            message: 'You were removed from the room by the host.',
            countdown: 3
          });
        }
        return;
      }

      // Check if room was closed because host left or other player in 2-player match left
      if (updatedRoom.status === 'finished') {
        if (!hasHandledExit.current) {
          hasHandledExit.current = true;
          if (updatedRoom.closedReason === 'player-left') {
            const leftName = updatedRoom.lastLeftPlayer?.name || 'The other contestant';
            setAutoExitModal({
              title: '🎮 Lobby Closed',
              message: `${leftName} left the room. Since there were only 2 players, the match lobby has ended.`,
              countdown: 3
            });
          } else if (updatedRoom.closedReason === 'host-left') {
            setAutoExitModal({
              title: '👑 Host Left',
              message: 'The room host has left. Returning to Home...',
              countdown: 3
            });
          } else {
            onLeaveRoom();
          }
        }
        return;
      }

      // Notification for 3+ players: show toast to Host / other players
      if (updatedRoom.lastLeftPlayer && user && updatedRoom.lastLeftPlayer.uid !== user.uid) {
        if (updatedRoom.lastLeftPlayer.timestamp !== lastNotifiedLeftTimestamp.current) {
          lastNotifiedLeftTimestamp.current = updatedRoom.lastLeftPlayer.timestamp;
          setPlayerLeftToast(`👋 ${updatedRoom.lastLeftPlayer.name} has left the lobby.`);
          const t = setTimeout(() => setPlayerLeftToast(null), 4000);
        }
      }

      setRoom(updatedRoom);

      // If game has started, navigate to MultiplayerGame
      if (updatedRoom.status === 'in-progress') {
        onGameStarted(updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid, onGameStarted, onLeaveRoom]);

  // Auto exit countdown ticker
  useEffect(() => {
    if (!autoExitModal) return;
    if (autoExitModal.countdown <= 0) {
      onLeaveRoom();
      return;
    }
    const timer = setTimeout(() => {
      setAutoExitModal(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoExitModal, onLeaveRoom]);

  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-cinema-muted">Loading custom match lobby...</p>
      </div>
    );
  }

  const isHost = user.uid === room.hostUid;
  const playersList = Object.values(room.players || {});
  const isReady = room.players[user.uid]?.ready || false;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/?join=${roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my Kollywood Custom Cinema Match!',
        text: `Join room code ${roomCode} for a Kollywood movie guessing challenge!`,
        url: shareUrl
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    if (!user) return;
    await setPlayerReady(roomCode, user.uid, !isReady);
  };

  const handleKickPlayer = async (targetUid: string, targetName: string) => {
    if (!isHost || targetUid === user.uid) return;
    if (window.confirm(`Are you sure you want to kick "${targetName}" from this room?`)) {
      await kickPlayerFromRoom(roomCode, targetUid);
    }
  };

  const handleCustomPuzzleCreated = async (puzzle: Puzzle) => {
    setIsCreateModalOpen(false);
    setLoadingStart(true);
    try {
      await setCustomPuzzleAndStart(roomCode, puzzle);
    } finally {
      setLoadingStart(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (user) {
      await leaveRoom(roomCode, user.uid);
    }
    onLeaveRoom();
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8 relative">
      {/* Toast Alert for 3+ players when someone leaves lobby */}
      {playerLeftToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-cinema-card border-2 border-amber-500/60 shadow-2xl shadow-amber-500/20 text-white text-xs sm:text-sm font-bold">
          <UserMinus className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span>{playerLeftToast}</span>
        </div>
      )}
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <button
          onClick={handleLeaveLobby}
          className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Leave Lobby</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-black">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span>LIVE ARENA LOBBY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Room Code & Settings */}
        <div className="md:col-span-1 space-y-3 sm:space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-cinema-border shadow-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-cinema-muted block mb-2">
              🎟️ ARENA ROOM CODE
            </span>

            {/* Big Monospace Code */}
            <div className="py-3 px-4 rounded-2xl bg-cinema-dark border-2 border-brand-500/50 shadow-inner mb-3">
              <span className="font-mono font-black text-3xl sm:text-4xl tracking-widest text-amber-300 select-all">
                {roomCode}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 py-2.5 px-3 rounded-xl btn-cinema-primary text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
              </button>

              <button
                onClick={handleShareLink}
                title="Share room link"
                className="p-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/70 text-slate-200 text-xs font-bold flex items-center justify-center active:scale-95 transition-colors"
              >
                <Share2 className="w-4 h-4 text-brand-400" />
              </button>
            </div>
          </div>

          {/* Match Settings Summary */}
          <div className="glass-panel rounded-2xl p-4 border border-cinema-border/70 text-xs space-y-2">
            <span className="font-black text-slate-200 block mb-1 uppercase tracking-wider text-[11px]">Arena Settings</span>
            <div className="flex justify-between text-cinema-muted">
              <span>Game Mode:</span>
              <strong className="text-emerald-400">⚡ Shared Board</strong>
            </div>
            <div className="flex justify-between text-cinema-muted">
              <span>Clues:</span>
              <strong className="text-amber-400">🎨 Custom Movies</strong>
            </div>
            <div className="flex justify-between text-cinema-muted">
              <span>Timer / Round:</span>
              <strong className="text-white">
                {room.settings.roundTimeSeconds ? `${room.settings.roundTimeSeconds}s` : '♾️ Chill'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Player Roster & Launch */}
        <div className="md:col-span-2 space-y-3 sm:space-y-4">
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-cinema-border shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-black text-base sm:text-lg text-white">
                  Contestants ({playersList.length})
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-cinema-muted">
                {playersList.filter(p => p.ready).length} / {playersList.length} ready
              </span>
            </div>

            {/* Custom Movie Highlight Banner */}
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex-shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Custom Match Arena</span>
                <p className="text-cinema-muted text-[11px]">
                  Custom matches are played with player-crafted movies! Anyone in the room can create a movie clue to start.
                </p>
              </div>
            </div>

            {/* Players Grid with Kick Buttons for Host */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {playersList.map((player) => {
                const isCurrent = player.uid === user.uid;
                const isRoomHost = player.uid === room.hostUid;

                return (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isCurrent
                        ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                        : 'bg-cinema-surface border-cinema-border/70'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.uid}`}
                        alt={player.name}
                        className="w-9 h-9 rounded-xl bg-cinema-dark border border-cinema-border object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">
                            {player.name}
                          </span>
                          {isRoomHost && (
                            <span title="Host">
                              <Crown className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-cinema-muted block">
                          {isCurrent ? '(You)' : isRoomHost ? 'Host' : 'Challenger'}
                        </span>
                      </div>
                    </div>

                    {/* Status & Kick Action */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {player.ready ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cinema-muted bg-cinema-dark/80 px-2 py-0.5 rounded-full border border-cinema-border/50">
                          Waiting
                        </span>
                      )}

                      {/* Host Kick Authority */}
                      {isHost && !isCurrent && (
                        <button
                          onClick={() => handleKickPlayer(player.uid, player.name)}
                          title={`Kick ${player.name} from room`}
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

            {/* Ready & Launch Custom Movie Actions */}
            <div className="space-y-3 pt-2">
              {!isHost && (
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 ${isReady
                      ? 'bg-emerald-500 text-black shadow-emerald-500/25 hover:bg-emerald-400'
                      : 'bg-cinema-surface border border-cinema-border text-white hover:border-brand-500/50'
                    }`}
                >
                  {isReady ? '✓ You are Ready! (Click to cancel)' : 'Click to Ready Up'}
                </button>
              )}

              {/* Primary Action: Create Custom Movie to Launch Match */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={loadingStart}
                className="w-full py-4 rounded-2xl btn-cinema-primary text-black font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4 fill-black text-brand-400" />
                <span>🎨 CREATE MOVIE CLUE & LAUNCH MATCH</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-Room Custom Puzzle Creator Modal */}
      <CreatePuzzleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCustomPuzzleCreated}
        creatorName={user?.displayName || 'Host'}
        creatorUid={user?.uid}
      />

      {/* Single Clean Auto-Exit Modal */}
      {autoExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-cinema-card border-2 border-brand-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto animate-pulse">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white">{autoExitModal.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {autoExitModal.message}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onLeaveRoom}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-sm shadow-lg shadow-brand-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
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

