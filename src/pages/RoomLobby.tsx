import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, Users, Play, Crown, ArrowLeft, Share2, Sparkles, PlusCircle,
  Film, UserX, UserMinus, LogOut, Home, Clock, AlertCircle, Settings,
  MessageSquare, Send, Zap, Flame, Shield, HelpCircle, RefreshCw
} from 'lucide-react';
import { Room, Puzzle, Player, GameSettings } from '../types/game';
import {
  subscribeToRoom,
  setPlayerReady,
  setCustomPuzzleAndStart,
  startRoomGame,
  kickPlayerFromRoom,
  leaveRoom,
  joinRoom,
  updateRoomSettings,
  sendRoomMessage
} from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CreatePuzzleModal } from '../components/CreatePuzzleModal';
import { sound } from '../services/sound';

interface RoomLobbyProps {
  roomCode: string;
  onGameStarted: (room?: any) => void;
  onLeaveRoom: () => void;
}

const QUICK_TAUNTS = [
  '🔥 Mass entry ready!',
  '⚡ Thalaiva, start pannunga!',
  '🍿 Guess in 10s challenge!',
  '👑 King of Kollywood here!',
  '💥 Ready for the clash!'
];

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [notFoundOrExpired, setNotFoundOrExpired] = useState(false);

  const [playerLeftToast, setPlayerLeftToast] = useState<string | null>(null);
  const [autoExitModal, setAutoExitModal] = useState<{
    title: string;
    message: string;
    countdown: number;
  } | null>(null);

  const lastNotifiedLeftTimestamp = useRef<number>(0);
  const hasHandledExit = useRef(false);
  const wasInRoomRef = useRef(false);
  const hasAttemptedJoin = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // 1. Subscribe to Room updates & Handle Auto-Join for Direct Links
  useEffect(() => {
    const cleanCode = roomCode.toUpperCase().trim();

    const unsubscribe = subscribeToRoom(cleanCode, (updatedRoom) => {
      if (!updatedRoom) {
        // Room was deleted or never existed
        setNotFoundOrExpired(true);
        return;
      }

      setNotFoundOrExpired(false);

      // Handle Direct-Link: If current user is authenticated but not in room.players yet, auto-join
      if (user && updatedRoom.players && !updatedRoom.players[user.uid]) {
        if (!wasInRoomRef.current && !hasAttemptedJoin.current) {
          hasAttemptedJoin.current = true;
          joinRoom(cleanCode, {
            uid: user.uid,
            displayName: user.displayName || 'Contestant',
            photoURL: user.photoURL
          }).catch(console.error);
          return;
        }

        // If the user WAS previously confirmed in the room, but is now removed -> Host kicked them
        if (wasInRoomRef.current && !hasHandledExit.current) {
          hasHandledExit.current = true;
          setAutoExitModal({
            title: 'Removed from Room',
            message: 'You were removed from the room by the host.',
            countdown: 3
          });
          return;
        }
      }

      // Mark that this user is confirmed present in the room
      if (user && updatedRoom.players && updatedRoom.players[user.uid]) {
        wasInRoomRef.current = true;
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
          sound.playWrong();
          const t = setTimeout(() => setPlayerLeftToast(null), 4000);
        }
      }

      setRoom(updatedRoom);

      // If game has started, navigate to MultiplayerGame
      if (updatedRoom.status === 'in-progress') {
        sound.playVictory();
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

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  if (notFoundOrExpired) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="glass-card rounded-3xl p-8 border border-cinema-border shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-display font-black text-white">Room Not Found</h3>
          <p className="text-xs text-cinema-muted leading-relaxed">
            Room <strong className="text-amber-300 font-mono">{roomCode}</strong> could not be found or has ended.
          </p>
          <button
            onClick={onLeaveRoom}
            className="w-full py-3.5 rounded-2xl btn-cinema-primary text-black font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Arena</span>
          </button>
        </div>
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-cinema-muted">Connecting to Custom Match Arena...</p>
      </div>
    );
  }

  const isHost = user.uid === room.hostUid;
  const playersList = Object.values(room.players || {});
  const isReady = Boolean(user && room.players?.[user.uid]?.ready);
  const readyCount = playersList.filter(p => p.ready).length;
  const allReady = playersList.length > 0 && playersList.every(p => p.ready);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sound.playHint();
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
      sound.playHint();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    if (!user) return;
    const nextReady = !isReady;
    if (nextReady) {
      sound.playCorrect();
    } else {
      sound.playTick();
    }
    await setPlayerReady(roomCode, user.uid, nextReady);
  };

  const handleKickPlayer = async (targetUid: string, targetName: string) => {
    if (!isHost || targetUid === user.uid) return;
    if (window.confirm(`Are you sure you want to kick "${targetName}" from this room?`)) {
      await kickPlayerFromRoom(roomCode, targetUid);
      sound.playWrong();
    }
  };

  // Launch with Standard Deck from selected pool
  const handleLaunchStandardMatch = async () => {
    if (!isHost || !allReady || loadingStart) return;
    setLoadingStart(true);
    sound.playVictory();
    try {
      await startRoomGame(roomCode);
    } finally {
      setLoadingStart(false);
    }
  };

  // Launch with Custom Created or Library Movie Clue
  const handleCustomPuzzleCreated = async (puzzle: Puzzle) => {
    setIsCreateModalOpen(false);
    setLoadingStart(true);
    sound.playVictory();
    try {
      const directorPuzzle: Puzzle = {
        ...puzzle,
        createdBy: user?.displayName || 'Director',
        creatorUid: user?.uid
      };
      await setCustomPuzzleAndStart(roomCode, directorPuzzle);
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

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !user) return;
    const text = chatInput.trim();
    setChatInput('');
    sound.playHint();
    await sendRoomMessage(roomCode, {
      senderUid: user.uid,
      senderName: user.displayName || 'Player',
      senderAvatar: user.photoURL,
      text
    });
  };

  const handleSendQuickTaunt = async (taunt: string) => {
    if (!user) return;
    sound.playHint();
    await sendRoomMessage(roomCode, {
      senderUid: user.uid,
      senderName: user.displayName || 'Player',
      senderAvatar: user.photoURL,
      text: taunt,
      isQuickReaction: true
    });
  };

  const handleUpdateSetting = async (key: keyof GameSettings, value: any) => {
    if (!isHost) return;
    await updateRoomSettings(roomCode, { [key]: value });
  };

  const roomMessages = room.messages || [];

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8 relative">
      {/* Toast Alert for 3+ players when someone leaves lobby */}
      {playerLeftToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-cinema-card border-2 border-amber-500/60 shadow-2xl shadow-amber-500/20 text-white text-xs sm:text-sm font-bold">
          <UserMinus className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span>{playerLeftToast}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <button
          onClick={handleLeaveLobby}
          className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Leave Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isSettingsOpen
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-cinema-surface hover:bg-cinema-cardHover border-cinema-border/70 text-slate-300'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSettingsOpen ? 'Close Settings' : 'Arena Settings'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/30 px-3 py-1.5 rounded-full text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>CUSTOM MATCH LOBBY</span>
          </div>
        </div>
      </div>

      {/* Host Settings Drawer (Expandable) */}
      {isHost && isSettingsOpen && (
        <div className="mb-6 p-5 glass-card rounded-3xl border border-amber-500/40 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Host Arena Controls</h4>
            </div>
            <span className="text-[11px] text-cinema-muted">Real-time synced to all players</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timer per Round */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2">
                ⏱️ Round Timer
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { sec: 0, label: '♾️ Chill' },
                  { sec: 30, label: '30s' },
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '60s' },
                  { sec: 90, label: '90s' }
                ].map(opt => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => handleUpdateSetting('roundTimeSeconds', opt.sec)}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all ${
                      (room.settings?.roundTimeSeconds ?? 60) === opt.sec
                        ? 'btn-cinema-primary text-black border-amber-400'
                        : 'bg-cinema-dark text-slate-300 border-cinema-border hover:border-brand-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2">
                🎬 Difficulty Deck
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: '🎲 All' },
                  { id: 'easy', label: '⚡ Easy' },
                  { id: 'medium', label: '🔥 Med' },
                  { id: 'hard', label: '💀 Hard' }
                ].map(diff => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => handleUpdateSetting('difficulty', diff.id)}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all ${
                      (room.settings?.difficulty ?? 'all') === diff.id
                        ? 'btn-cinema-primary text-black border-amber-400'
                        : 'bg-cinema-dark text-slate-300 border-cinema-border hover:border-brand-500/40'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Room Code, Live Settings & Quick Cinema Chat */}
        <div className="md:col-span-1 space-y-4">
          {/* Room Code Card */}
          <div className="glass-card rounded-3xl p-5 border border-cinema-border shadow-2xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-cinema-muted block mb-2">
              🎟️ ARENA ROOM CODE
            </span>

            {/* Monospace Code */}
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
            <div className="flex items-center justify-between border-b border-cinema-border/50 pb-2">
              <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Arena Rules</span>
              {isHost && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="flex justify-between text-cinema-muted">
              <span>Game Mode:</span>
              <strong className="text-emerald-400">⚡ Live Shared Board</strong>
            </div>
            <div className="flex justify-between text-cinema-muted">
              <span>Difficulty:</span>
              <strong className="text-amber-400 capitalize">
                {room.settings?.difficulty === 'all' ? '🎲 All Era' : `${room.settings?.difficulty || 'Medium'}`}
              </strong>
            </div>
            <div className="flex justify-between text-cinema-muted">
              <span>Timer / Round:</span>
              <strong className="text-white">
                {room.settings?.roundTimeSeconds ? `${room.settings.roundTimeSeconds}s` : '♾️ Chill Mode'}
              </strong>
            </div>
          </div>

          {/* Kollywood Live Chat & Taunts */}
          <div className="glass-card rounded-2xl p-4 border border-cinema-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                <span>Lobby Chat & Reactions</span>
              </div>
              <span className="text-[10px] text-cinema-muted font-mono">{roomMessages.length} msgs</span>
            </div>

            {/* Quick Taunt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAUNTS.map((taunt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuickTaunt(taunt)}
                  className="px-2 py-1 rounded-lg bg-cinema-dark hover:bg-brand-500/20 border border-cinema-border text-[10px] font-bold text-slate-300 hover:text-brand-300 active:scale-95 transition-all"
                >
                  {taunt}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="h-28 overflow-y-auto space-y-2 pr-1 text-xs bg-cinema-dark/60 p-2 rounded-xl border border-cinema-border/50">
              {roomMessages.length === 0 ? (
                <p className="text-[11px] text-cinema-muted italic text-center py-6">
                  Send a quick Kollywood taunt above! 🎬
                </p>
              ) : (
                roomMessages.map((msg) => {
                  const isMe = msg.senderUid === user.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`px-2.5 py-1.5 rounded-xl max-w-[90%] text-[11px] leading-snug ${
                          msg.isQuickReaction
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold'
                            : isMe
                            ? 'bg-brand-500/20 border border-brand-500/30 text-white'
                            : 'bg-cinema-surface border border-cinema-border text-slate-200'
                        }`}
                      >
                        <span className="text-[9px] font-bold opacity-60 block mb-0.5">
                          {isMe ? 'You' : msg.senderName}
                        </span>
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={80}
                className="flex-1 bg-cinema-dark border border-cinema-border rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-brand-500 text-black font-bold disabled:opacity-40 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Player Roster, Ready Status & Launch Actions */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-cinema-border shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-black text-base sm:text-lg text-white">
                  Contestants ({playersList.length})
                </h3>
              </div>
              <span
                className={`text-xs font-mono font-black px-2.5 py-1 rounded-full border ${
                  allReady
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cinema-dark text-amber-300 border-cinema-border/70'
                }`}
              >
                {readyCount} / {playersList.length} Ready
              </span>
            </div>

            {/* Custom Movie Match Info Banner */}
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex-shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">🎬 Director Movie Quest Arena</span>
                <p className="text-cinema-muted text-[11px]">
                  All contestants ready up! Once everyone is ready, <strong>any contestant</strong> can create or pick a movie clue to become the Director and launch the quest!
                </p>
              </div>
            </div>

            {/* Players Grid with Ready Status & Host Kick Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
              {playersList.map((player) => {
                const isCurrent = player.uid === user.uid;
                const isRoomHost = player.uid === room.hostUid;

                return (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCurrent
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-fade-in">
                          <Check className="w-3 h-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cinema-muted bg-cinema-dark/80 px-2.5 py-0.5 rounded-full border border-cinema-border/50">
                          <Clock className="w-3 h-3 text-amber-400/80" />
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

            {/* Ready Toggle & Launch Section */}
            <div className="space-y-3 pt-2">
              {/* Ready / Cancel Ready Button for Current Player */}
              <button
                type="button"
                onClick={handleToggleReady}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  isReady
                    ? 'bg-emerald-500 text-black shadow-emerald-500/25 hover:bg-emerald-400 border border-emerald-400'
                    : 'bg-cinema-surface hover:bg-cinema-cardHover border-2 border-brand-500/50 text-brand-300 hover:text-white'
                }`}
              >
                {isReady ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>✓ YOU ARE READY! (Click to cancel ready)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-brand-400 text-brand-400" />
                    <span>▶️ CLICK TO READY UP FOR MOVIE QUEST</span>
                  </>
                )}
              </button>

              {/* Status Notice Banner */}
              {!allReady ? (
                <div className="p-3 rounded-xl bg-cinema-dark/80 border border-cinema-border/70 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    Waiting for all contestants to ready up ({readyCount}/{playersList.length} ready) before launching Movie Quest.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    🎉 All contestants are Ready! Click below to create a movie clue and launch the Director Movie Quest!
                  </span>
                </div>
              )}

              {/* Match Launch Action: Accessible to ANY ready player */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={!allReady || loadingStart}
                  className={`w-full py-4 px-5 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
                    allReady
                      ? 'btn-cinema-primary text-black cursor-pointer shadow-brand-500/30 hover:brightness-110'
                      : 'bg-cinema-surface/60 border border-cinema-border/60 text-cinema-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  <PlusCircle className="w-5 h-5 fill-black text-brand-400" />
                  <span>🎬 CREATE MOVIE CLUE & LAUNCH MOVIE QUEST</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Room Custom Puzzle Creator Modal */}
      <CreatePuzzleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCustomPuzzleCreated}
        creatorName={user?.displayName || 'Director'}
        creatorUid={user?.uid}
        modalTitle="🎬 Direct & Launch Movie Quest"
        modalSubtitle="Create or select a Kollywood movie to challenge other contestants!"
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
