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
  const [loading, setLoading] = useState(true);

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
    if (window.confirm('Are you sure you want to clear your entire game history? (Total score will be retained)')) {
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

  // Filter history
  const filteredHistory = gameHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.mode === historyFilter;
  });

  // Calculate Cinema Tier
  let tierName = 'Cinema Rasigan';
  let tierBadge = '🥉 Bronze';
  let tierColor = 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  let nextTierThreshold = 1000;

  if (totalScore >= 10000) {
    tierName = 'Kollywood Legend';
    tierBadge = '💎 Diamond';
    tierColor = 'text-cyan-400 border-cyan-400/40 bg-cyan-400/15';
    nextTierThreshold = 25000;
  } else if (totalScore >= 5000) {
    tierName = 'Superstar Tier';
    tierBadge = '👑 Gold';
    tierColor = 'text-yellow-400 border-yellow-400/40 bg-yellow-400/15';
    nextTierThreshold = 10000;
  } else if (totalScore >= 1000) {
    tierName = 'Silver Screen Buff';
    tierBadge = '🥈 Silver';
    tierColor = 'text-slate-200 border-slate-300/30 bg-slate-400/10';
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
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Arena
        </button>

        {onOpenAdmin && user?.email === 'admin@gmail.com' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-cinema-cardHover hover:bg-brand-500/20 text-brand-400 border border-cinema-border/70 hover:border-brand-500/40 transition-colors"
          >
            <Film className="w-3.5 h-3.5" />
            Admin Console
          </button>
        )}
      </div>

      {savedNotice && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center animate-fade-in">
          ✓ Profile updated successfully!
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-cinema-border shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
          {/* Avatar with Quick Edit Button */}
          <div className="relative group flex-shrink-0">
            <img
              src={selectedAvatar}
              alt={user?.displayName || 'Player'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-cinema-dark border-2 border-brand-500/70 object-cover shadow-xl shadow-brand-500/20"
            />
            <button
              onClick={() => setIsAvatarPickerOpen(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black shadow-md transition-transform hover:scale-105"
              title="Change Avatar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Info & Tier Progress */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                    className="bg-cinema-dark border border-brand-500 rounded-xl px-3 py-1 text-base sm:text-lg font-black text-white focus:outline-none max-w-[170px] sm:max-w-xs"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="p-1.5 rounded-xl bg-brand-500 text-black font-bold hover:bg-brand-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white truncate max-w-[220px] sm:max-w-none">
                    {user?.displayName || 'Player'}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-cinema-muted hover:text-brand-400 p-1"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}

              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${tierColor}`}>
                {tierBadge} {tierName}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-cinema-muted mb-3 sm:mb-4">
              Player Status: <strong className="text-slate-200">{user?.isGuest ? 'Guest Rasigan' : 'Registered Cinephile'}</strong>
            </p>

            {/* Rank Progress Bar */}
            <div className="space-y-1.5 max-w-md mx-auto sm:mx-0">
              <div className="flex justify-between text-[11px] sm:text-xs font-semibold">
                <span className="text-cinema-muted">Tier Mastery Progress</span>
                <span className="text-brand-400 font-mono font-bold">
                  {totalScore.toLocaleString()} / {nextTierThreshold.toLocaleString()} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-cinema-dark border border-cinema-border/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean 4-Column Performance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {totalScore.toLocaleString()}
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-cinema-muted">
            Total Points
          </span>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {bestStreak}x
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-cinema-muted">
            Best Streak
          </span>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {wins}
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-cinema-muted">
            Victories ({winRate}%)
          </span>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Film className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {totalGames}
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-cinema-muted">
            Matches Played
          </span>
        </div>
      </div>

      {/* MATCH & GAME HISTORY SECTION */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-cinema-border/80 mb-6 sm:mb-8">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-cinema-border/50 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="text-sm sm:text-base font-display font-black text-white">
                Game History & Match Logs
              </h3>
              <p className="text-[10px] sm:text-xs text-cinema-muted">
                {gameHistory.length} total matches recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-cinema-dark p-1 rounded-xl border border-cinema-border/60 text-xs">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  historyFilter === 'all'
                    ? 'bg-brand-500 text-black'
                    : 'text-cinema-muted hover:text-white'
                }`}
              >
                All ({gameHistory.length})
              </button>
              <button
                onClick={() => setHistoryFilter('solo')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  historyFilter === 'solo'
                    ? 'bg-brand-500 text-black'
                    : 'text-cinema-muted hover:text-white'
                }`}
              >
                Solo ({gameHistory.filter(h => h.mode === 'solo').length})
              </button>
              <button
                onClick={() => setHistoryFilter('multiplayer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  historyFilter === 'multiplayer'
                    ? 'bg-brand-500 text-black'
                    : 'text-cinema-muted hover:text-white'
                }`}
              >
                Multiplayer ({gameHistory.filter(h => h.mode === 'multiplayer').length})
              </button>
            </div>

            {gameHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Match History"
                className="p-1.5 rounded-xl bg-cinema-cardHover hover:bg-red-500/20 text-cinema-muted hover:text-red-400 border border-cinema-border transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cinema-cardHover border border-cinema-border text-cinema-muted flex items-center justify-center mx-auto">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Match History Found</h4>
              <p className="text-xs text-cinema-muted max-w-sm mx-auto mt-1">
                {historyFilter === 'all'
                  ? 'Play a Solo Cinema Challenge or join a Live Multiplayer Room to build your match history!'
                  : `No ${historyFilter} matches recorded yet.`}
              </p>
            </div>
            <button
              onClick={onStartSolo}
              className="py-2.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play Solo Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredHistory.map((item) => {
              const isMulti = item.mode === 'multiplayer';
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-cinema-cardHover/70 hover:bg-cinema-cardHover border border-cinema-border/50 hover:border-cinema-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* Left: Mode Icon & Date & Movies */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 border ${
                      isMulti 
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                        : 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                    }`}>
                      {isMulti ? <Users className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white">
                          {isMulti ? '⚡ Live Multiplayer Match' : '🎮 Solo Challenge'}
                        </span>
                        {item.roomCode && (
                          <span className="text-[10px] font-mono font-bold bg-cinema-dark text-brand-400 px-1.5 py-0.5 rounded border border-cinema-border">
                            {item.roomCode}
                          </span>
                        )}
                        <span className="text-[10px] text-cinema-muted">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>

                      {/* Movies Played Badges */}
                      {item.movieNames && item.movieNames.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {item.movieNames.slice(0, 3).map((m, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-semibold text-slate-300 bg-cinema-dark/80 px-2 py-0.5 rounded-md border border-cinema-border/40"
                            >
                              🎬 {m}
                            </span>
                          ))}
                          {item.movieNames.length > 3 && (
                            <span className="text-[9px] text-cinema-muted">
                              +{item.movieNames.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Score, Streak, & Outcome */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-cinema-border/30">
                    <div className="flex items-center gap-2">
                      {item.streak > 1 && (
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {item.streak}x
                        </span>
                      )}

                      <span className="font-mono font-black text-xs sm:text-sm text-brand-400">
                        +{(item.score || 0).toLocaleString()} pts
                      </span>
                    </div>

                    {/* Outcome Badge */}
                    {isMulti ? (
                      item.rank === 1 ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Winner (#1)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-cinema-muted bg-cinema-dark px-2 py-0.5 rounded-full border border-cinema-border">
                          Rank #{item.rank || 2} of {item.totalPlayers || 2}
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onStartSolo}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-sm shadow-xl shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-black" />
          Play Solo Challenge
        </button>

        {user?.isGuest ? (
          <>
            <button
              onClick={() => openAuthModal('signup')}
              className="py-3 px-6 rounded-2xl bg-cinema-cardHover hover:bg-cinema-border/60 border border-cinema-border text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              Save Progress (Sign Up)
            </button>
            <button
              onClick={signOut}
              className="py-3 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Exit to Login
            </button>
          </>
        ) : (
          <button
            onClick={signOut}
            className="py-3 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-cinema-card border border-cinema-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cinema-border/50 pb-3">
              <h3 className="text-base font-bold text-white">Choose Your Avatar</h3>
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="text-cinema-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 py-2">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={seed}
                    onClick={() => handleSelectAvatar(url)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                      isSelected
                        ? 'border-brand-400 scale-105 shadow-md shadow-brand-500/30 bg-brand-500/20'
                        : 'border-cinema-border/60 hover:border-brand-500/50 bg-cinema-dark'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full h-full object-cover rounded-xl" />
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-cinema-muted text-center">
              Select your favorite avatar representation for solo and live matches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
