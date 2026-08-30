import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, Users, Play, Crown, ArrowLeft, Share2, Sparkles, PlusCircle,
  Film, UserMinus, LogOut, Clock, AlertCircle, Settings,
  MessageSquare, Send, Zap, Shield, RefreshCw
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
import { copyTextToClipboard } from '../utils/clipboard';

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

  useEffect(() => {
    const cleanCode = roomCode.toUpperCase().trim();

    const unsubscribe = subscribeToRoom(cleanCode, (updatedRoom) => {
      if (!updatedRoom) {
        setNotFoundOrExpired(true);
        return;
      }

      setNotFoundOrExpired(false);

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

      if (user && updatedRoom.players && updatedRoom.players[user.uid]) {
        wasInRoomRef.current = true;
      }

      if (updatedRoom.status === 'finished') {
        if (!hasHandledExit.current) {
          hasHandledExit.current = true;
          if (updatedRoom.closedReason === 'player-left') {
            const leftName = updatedRoom.lastLeftPlayer?.name || 'The other contestant';
            setAutoExitModal({
              title: '🎮 Lobby Closed',
              message: `${leftName} left the room. Match lobby has ended.`,
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

      if (updatedRoom.lastLeftPlayer && user && updatedRoom.lastLeftPlayer.uid !== user.uid) {
        if (updatedRoom.lastLeftPlayer.timestamp !== lastNotifiedLeftTimestamp.current) {
          lastNotifiedLeftTimestamp.current = updatedRoom.lastLeftPlayer.timestamp;
          setPlayerLeftToast(`👋 ${updatedRoom.lastLeftPlayer.name} has left the lobby.`);
          sound.playWrong();
          setTimeout(() => setPlayerLeftToast(null), 4000);
        }
      }

      setRoom(updatedRoom);

      if (updatedRoom.status === 'in-progress') {
        sound.playVictory();
        onGameStarted(updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [roomCode, user?.uid, onGameStarted, onLeaveRoom]);

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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  if (notFoundOrExpired) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center font-sans">
        <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800 p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-display font-black text-white">Room Not Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Room <strong className="text-cyan-300 font-mono">{roomCode}</strong> could not be found or has ended.
          </p>
          <button
            onClick={onLeaveRoom}
            className="w-full py-3 rounded-full bg-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#0c101a] border border-cyan-500/40 text-cyan-400 flex items-center justify-center animate-spin mb-4 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white uppercase tracking-wider">Syncing Arena Lobby...</p>
        <span className="text-xs text-slate-500 font-mono mt-1">Pass Code: {roomCode}</span>
      </div>
    );
  }

  const playersList: Player[] = Object.values(room.players || {});
  const isHost = room.hostUid === user?.uid;
  const myPlayerObj = user ? room.players?.[user.uid] : null;
  const isReady = myPlayerObj?.ready || false;
  const allReady = playersList.length > 0 && playersList.every(p => p.ready || p.uid === room.hostUid);

  const handleCopyCode = async () => {
    const success = await copyTextToClipboard(roomCode);
    if (success) {
      setCopied(true);
      sound.playCorrect();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleReady = async () => {
    if (!user) return;
    const nextState = !isReady;
    if (nextState) sound.playCorrect();
    await setPlayerReady(roomCode, user.uid, nextState);
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans animate-fade-in relative">
      {/* Toast Alert */}
      {playerLeftToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0c101a] border-2 border-cyan-500/60 shadow-2xl text-white text-xs sm:text-sm font-bold">
          <UserMinus className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{playerLeftToast}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <button
          onClick={handleLeaveLobby}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Leave Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSettingsOpen
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0c101a] hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSettingsOpen ? 'Close Settings' : 'Match Settings'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>CUSTOM MATCH LOBBY</span>
          </div>
        </div>
      </div>

      {/* Host Settings Drawer */}
      {isHost && isSettingsOpen && (
        <div className="mb-6 p-6 rounded-3xl bg-[#0c101a]/95 border border-cyan-500/40 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Host Arena Settings</h4>
            </div>
            <span className="text-[11px] text-slate-400">Synced to all contestants</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timer per Round */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                ⏱️ Round Timer
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { sec: 0, label: 'Chill' },
                  { sec: 30, label: '30s' },
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '60s' },
                  { sec: 90, label: '90s' }
                ].map(opt => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => handleUpdateSetting('roundTimeSeconds', opt.sec)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      (room.settings?.roundTimeSeconds ?? 60) === opt.sec
                        ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/30 font-black'
                        : 'bg-[#070a12] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                🎬 Difficulty Deck
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'easy', label: 'Easy' },
                  { id: 'medium', label: 'Med' },
                  { id: 'hard', label: 'Hard' }
                ].map(diff => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => handleUpdateSetting('difficulty', diff.id)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      (room.settings?.difficulty ?? 'all') === diff.id
                        ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/30 font-black'
                        : 'bg-[#070a12] text-slate-300 border-slate-800 hover:border-slate-700'
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

      {/* Main Room Pass Card */}
      <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-6 sm:p-8 shadow-2xl mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-2">
          Room Access Pass Code
        </span>

        {/* 6-digit Code Display */}
        <div className="inline-flex flex-col items-center gap-2 mb-3">
          <button
            type="button"
            onClick={handleCopyCode}
            title="Click to copy pass code"
            className="group relative inline-flex items-center gap-3 bg-[#070a12] hover:bg-[#0c1220] border-2 border-cyan-400/80 hover:border-cyan-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] transition-all cursor-pointer select-none active:scale-95"
          >
            <span className="font-mono font-black text-3xl sm:text-4xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              {roomCode}
            </span>
            <div className="p-2 rounded-xl bg-cyan-400 group-hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex-shrink-0">
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            </div>
          </button>
          
          {copied && (
            <span className="text-[11px] font-black tracking-wider text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-3 py-0.5 rounded-full animate-bounce">
              ✓ COPIED TO CLIPBOARD!
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Share this code with friends to join your synchronized live buzzer lobby.
        </p>
      </div>

      {/* Contestants Grid */}
      <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Contestants ({playersList.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {playersList.filter(p => p.ready || p.uid === room.hostUid).length} / {playersList.length} Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {playersList.map((p) => {
            const isPlayerHost = p.uid === room.hostUid;
            const isMe = p.uid === user?.uid;
            return (
              <div
                key={p.uid}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                  isMe
                    ? 'bg-[#070a12] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'bg-[#070a12] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.uid}`}
                    alt={p.name}
                    className="w-9 h-9 rounded-xl bg-black border border-slate-800 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate max-w-[100px]">
                        {p.name}
                      </span>
                      {isPlayerHost && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {isMe ? '(You)' : isPlayerHost ? 'Host' : 'Challenger'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isPlayerHost ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg font-bold">
                      Host
                    </span>
                  ) : p.ready ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-lg font-semibold">
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        {!isHost && (
          <button
            onClick={handleToggleReady}
            className={`w-full sm:max-w-xs py-4 rounded-full font-black text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              isReady
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_25px_rgba(6,182,212,0.6)]'
            }`}
          >
            {isReady ? '✓ READY FOR BATTLE' : 'MARK AS READY'}
          </button>
        )}

        {isHost && (
          <button
            onClick={handleLaunchStandardMatch}
            disabled={!allReady || loadingStart}
            className="w-full sm:max-w-xs py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:shadow-[0_0_45px_rgba(6,182,212,0.9)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-black text-black" />
            <span>START LIVE MATCH</span>
          </button>
        )}

        {/* Enabled for EVERYONE in the room (Host & Joined Contestants) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:max-w-xs py-4 rounded-full bg-[#0c101a] hover:bg-purple-950/40 border-2 border-purple-500 text-purple-300 hover:text-white font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Film className="w-4 h-4 text-purple-400" />
          <span>CRAFT CUSTOM MOVIE</span>
        </button>
      </div>

      {/* Quick Chat Taunts & Messages */}
      <div className="mt-8 rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Lobby Chat & Taunts</h4>
        </div>

        {/* Quick Taunt Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_TAUNTS.map((taunt) => (
            <button
              key={taunt}
              onClick={() => handleSendQuickTaunt(taunt)}
              className="px-3 py-1.5 rounded-xl bg-[#070a12] hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {taunt}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="h-28 overflow-y-auto bg-[#070a12] rounded-2xl p-3 border border-slate-800/80 space-y-2 mb-3 text-xs">
          {roomMessages.length === 0 ? (
            <span className="text-slate-600 italic">No messages yet. Send a quick cinema taunt!</span>
          ) : (
            roomMessages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-bold text-cyan-400">{msg.senderName}:</span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message to the lobby..."
            className="flex-1 bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Create Custom Puzzle Modal */}
      {isCreateModalOpen && (
        <CreatePuzzleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCustomPuzzleCreated}
          creatorName={user?.displayName || 'Director'}
          creatorUid={user?.uid}
        />
      )}
    </div>
  );
};
