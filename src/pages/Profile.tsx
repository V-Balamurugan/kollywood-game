import React, { useEffect, useState } from 'react';
import {
  Trophy, Flame, Play, Award, ArrowLeft, Film, Sparkles,
  Edit3, Check, Zap, Crown, LogOut, History, Users,
  Trash2, Calendar, CheckCircle2, ChevronRight, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, clearUserHistory } from '../services/firebase';
import { UserProfile, GameHistoryItem } from '../types/game';

interface ProfileProps {
  onBack: () => void;
  onStartSolo: () => void;
  onOpenAdmin?: () => void;
}

const AVATAR_SEEDS = [
  'Thalapathy', 'Superstar', 'Ulaganayagan', 'Chiyaan',
  'Thala', 'Dhanush', 'MakkalSelvan', 'SK', 'Anirudh', 'VijaySethupathi'
];

export const Profile: React.FC<ProfileProps> = ({ onBack, onStartSolo, onOpenAdmin }) => {
  const { user, openAuthModal, updateName, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'solo' | 'multiplayer'>('all');
  const [_loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setNameInput(user.displayName || 'Player');
      setSelectedAvatar(user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`);
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (nameInput.trim()) {
      await updateName(nameInput.trim());
      if (user) {
        user.photoURL = selectedAvatar;
        if (user.isGuest) {
          localStorage.setItem(
            'kollywood_current_guest',
            JSON.stringify({ ...user, displayName: nameInput.trim(), photoURL: selectedAvatar })
          );
        }
      }
      setIsEditingName(false);
      setIsAvatarPickerOpen(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setSelectedAvatar(url);
    if (user) {
      user.photoURL = url;
      if (user.isGuest) {
        localStorage.setItem('kollywood_current_guest', JSON.stringify({ ...user, photoURL: url }));
      }
    }
    setIsAvatarPickerOpen(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleClearHistory = async () => {
    if (!user) return;
    if (window.confirm('Are you sure you want to clear your game history? (Total score is retained)')) {
      await clearUserHistory(user.uid);
      await fetchProfile();
    }
  };

  const totalScore = profile?.totalScore || 0;
  const totalGames = profile?.totalGamesPlayed || 0;
  const wins = profile?.wins || 0;
  const bestStreak = profile?.bestStreak || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const gameHistory: GameHistoryItem[] = profile?.gameHistory || [];

  const filteredHistory = gameHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.mode === historyFilter;
  });

  // Calculate Cinema Tier
  let tierName = 'Cinema Rasigan';
  let tierBadge = '🥉 Bronze';
  let tierColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  let nextTierThreshold = 1000;

  if (totalScore >= 10000) {
    tierName = 'Kollywood Legend';
    tierBadge = '💎 Diamond';
    tierColor = 'text-cyan-300 border-cyan-400/50 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
    nextTierThreshold = 25000;
  } else if (totalScore >= 5000) {
    tierName = 'Superstar Tier';
    tierBadge = '👑 Gold';
    tierColor = 'text-yellow-300 border-yellow-400/40 bg-yellow-950/50';
    nextTierThreshold = 10000;
  } else if (totalScore >= 1000) {
    tierName = 'Silver Screen Buff';
    tierBadge = '🥈 Silver';
    tierColor = 'text-slate-200 border-slate-400/40 bg-slate-800/50';
    nextTierThreshold = 5000;
  }

  const progressPercent = Math.min(100, Math.round((totalScore / nextTierThreshold) * 100));

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Lobby</span>
        </button>

        {onOpenAdmin && user?.email === 'admin@gmail.com' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#0c101a] hover:bg-purple-950 border border-purple-500/40 text-purple-300 transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>
        )}
      </div>

      {savedNotice && (
        <div className="mb-5 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fade-in">
          ✓ Profile changes saved successfully!
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7 relative z-10">
          {/* Avatar with Edit Action */}
          <div className="relative group flex-shrink-0">
            <img
              src={selectedAvatar}
              alt={user?.displayName || 'Player'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#070a12] border-2 border-cyan-400/80 object-cover shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            />
            <button
              onClick={() => setIsAvatarPickerOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-cyan-400 text-black shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Change Avatar"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* User Info & Tier Progress */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                    className="bg-[#070a12] border border-cyan-400 rounded-xl px-3 py-1 text-base sm:text-lg font-black text-white focus:outline-none max-w-[180px]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="p-2 rounded-xl bg-cyan-400 text-black font-bold cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-white truncate">
                    {user?.displayName || 'Player'}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-cyan-300 p-1 cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className={`text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border ${tierColor}`}>
                {tierBadge} {tierName}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Status: <strong className="text-slate-200">{user?.isGuest ? 'Guest VIP Pass' : 'Permanent Cinephile Account'}</strong>
            </p>

            {/* Rank Progress Bar */}
            <div className="space-y-1.5 max-w-md mx-auto sm:mx-0">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Mastery Tier Progress</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {totalScore.toLocaleString()} / {nextTierThreshold.toLocaleString()} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#070a12] border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="rounded-2xl bg-[#0c101a]/90 border border-slate-800 p-4 text-center">
          <Trophy className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {totalScore.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Score</div>
        </div>

        <div className="rounded-2xl bg-[#0c101a]/90 border border-slate-800 p-4 text-center">
          <Play className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {totalGames}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Games Played</div>
        </div>

        <div className="rounded-2xl bg-[#0c101a]/90 border border-slate-800 p-4 text-center">
          <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {winRate}%
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Win Rate ({wins}W)</div>
        </div>

        <div className="rounded-2xl bg-[#0c101a]/90 border border-slate-800 p-4 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {bestStreak}x
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Best Streak</div>
        </div>
      </div>

      {/* Game History Section */}
      <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800 p-6 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Match History ({filteredHistory.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#070a12] p-1 rounded-xl border border-slate-800 text-xs font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'solo', label: 'Solo' },
                { id: 'multiplayer', label: 'Arena' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHistoryFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    historyFilter === tab.id
                      ? 'bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {gameHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Match History"
                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No matches played yet in this mode. Start a challenge to record your score!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#070a12] border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    item.isWinner
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {item.mode === 'multiplayer' ? <Users className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{item.mode === 'multiplayer' ? 'Live Arena Battle' : 'Solo Challenge'}</span>
                      {item.isWinner && <span className="text-[10px] text-emerald-300 font-black">WIN</span>}
                    </div>
                    <span className="text-[10px] text-slate-500">{formatDate(item.timestamp)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-cyan-300">+{item.score} pts</div>
                  {item.streak ? <div className="text-[10px] text-orange-400">🔥 {item.streak}x streak</div> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Play CTA */}
      <div className="flex justify-center">
        <button
          onClick={onStartSolo}
          className="w-full sm:max-w-md py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black text-black" />
          <span>START NEW CINEMA CHALLENGE</span>
        </button>
      </div>

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c101a] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
                Select Cinephile Avatar
              </h3>
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                const isCurrent = selectedAvatar === url;
                return (
                  <button
                    key={seed}
                    onClick={() => handleSelectAvatar(url)}
                    className={`p-1 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-2 border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'border-slate-800 bg-[#070a12] hover:border-slate-700'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full h-auto rounded-xl object-cover" />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#070a12] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
