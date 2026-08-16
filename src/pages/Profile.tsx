import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Play, Award, ArrowLeft, Film, Shield, Sparkles, UserCheck, Edit3, Check, Zap, Target, Star, Crown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firebase';
import { UserProfile } from '../types/game';

interface ProfileProps {
  onBack: () => void;
  onStartSolo: () => void;
  onOpenAdmin?: () => void;
}

const AVATAR_SEEDS = [
  'Thalapathy', 'Superstar', 'Ulaganayagan', 'Chiyaan', 
  'Thala', 'Dhanush', 'MakkalSelvan', 'SK'
];

export const Profile: React.FC<ProfileProps> = ({ onBack, onStartSolo, onOpenAdmin }) => {
  const { user, openAuthModal, updateName, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setNameInput(user.displayName);
      setSelectedAvatar(user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`);
      getUserProfile(user.uid).then(p => {
        setProfile(p);
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (nameInput.trim()) {
      await updateName(nameInput.trim());
      if (user) {
        user.photoURL = selectedAvatar;
        if (user.isGuest) {
          localStorage.setItem('kollywood_current_guest', JSON.stringify({ ...user, displayName: nameInput.trim(), photoURL: selectedAvatar }));
        }
      }
      setIsEditingName(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const totalScore = profile?.totalScore || 0;
  const totalGames = profile?.totalGamesPlayed || 0;
  const wins = profile?.wins || 0;
  const bestStreak = profile?.bestStreak || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // Calculate Tier
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
            Admin Dashboard
          </button>
        )}
      </div>

      {savedNotice && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center animate-fade-in">
          ✓ Profile updated successfully!
        </div>
      )}

      {/* Main Profile Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar and Seed Picker */}
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src={selectedAvatar}
              alt={user?.displayName || 'Player'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-cinema-dark border-2 border-brand-500/70 object-cover shadow-xl shadow-brand-500/20 mb-2 sm:mb-3"
            />
            <div className="flex items-center gap-1 bg-cinema-dark/80 p-1 rounded-xl border border-cinema-border/50 max-w-[200px] overflow-x-auto">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                return (
                  <button
                    key={seed}
                    onClick={() => {
                      setSelectedAvatar(url);
                      if (user) {
                        user.photoURL = url;
                        if (user.isGuest) {
                          localStorage.setItem('kollywood_current_guest', JSON.stringify({ ...user, photoURL: url }));
                        }
                      }
                    }}
                    title={seed}
                    className={`w-6 h-6 rounded-lg overflow-hidden border transition-transform flex-shrink-0 ${
                      selectedAvatar === url ? 'border-brand-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Details & Rank */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                    className="bg-cinema-dark border border-brand-500 rounded-xl px-3 py-1 text-base sm:text-lg font-black text-white focus:outline-none max-w-[160px] sm:max-w-xs"
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white truncate max-w-[200px] sm:max-w-none">
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

              <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border ${tierColor}`}>
                {tierBadge} {tierName}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-cinema-muted mb-3 sm:mb-4">
              UID: <code className="text-slate-300 font-mono">{user?.uid ? user.uid.slice(0, 10) + '...' : 'guest'}</code> • {user?.isGuest ? 'Guest' : 'Cinephile'}
            </p>

            {/* Rank Progress Bar */}
            <div className="space-y-1.5 max-w-md mx-auto sm:mx-0">
              <div className="flex justify-between text-[11px] sm:text-xs font-semibold">
                <span className="text-cinema-muted">Tier Progress</span>
                <span className="text-brand-400 font-mono font-bold">
                  {totalScore.toLocaleString()} / {nextTierThreshold.toLocaleString()} pts
                </span>
              </div>
              <div className="w-full h-2 sm:h-2.5 rounded-full bg-cinema-dark border border-cinema-border/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-mono font-black text-white">
            {totalScore.toLocaleString()}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-cinema-muted">
            Total Points
          </span>
        </div>

        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-mono font-black text-white">
            {bestStreak}x
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-cinema-muted">
            Highest Streak
          </span>
        </div>

        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-mono font-black text-white">
            {wins}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-cinema-muted">
            Victories ({winRate}%)
          </span>
        </div>

        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-cinema-border/70 text-center">
          <Film className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-2xl font-mono font-black text-white">
            {totalGames}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-cinema-muted">
            Total Rounds
          </span>
        </div>
      </div>


      {/* Cinephile Achievements */}
      <div className="glass-panel rounded-3xl p-6 border border-cinema-border/70 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-display font-black text-white">
            Cinema Achievements
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            totalGames >= 1 ? 'bg-brand-500/10 border-brand-500/40 text-brand-300' : 'bg-cinema-dark/50 border-cinema-border/40 opacity-50'
          }`}>
            <div className="p-2 rounded-xl bg-cinema-card text-brand-400 border border-cinema-border">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">First Blockbuster</h4>
              <p className="text-[10px] text-cinema-muted">Played your first trivia round</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            bestStreak >= 3 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' : 'bg-cinema-dark/50 border-cinema-border/40 opacity-50'
          }`}>
            <div className="p-2 rounded-xl bg-cinema-card text-orange-400 border border-cinema-border">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Streak Master</h4>
              <p className="text-[10px] text-cinema-muted">Achieved a 3x answer streak</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            totalScore >= 5000 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' : 'bg-cinema-dark/50 border-cinema-border/40 opacity-50'
          }`}>
            <div className="p-2 rounded-xl bg-cinema-card text-yellow-400 border border-cinema-border">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Superstar Elite</h4>
              <p className="text-[10px] text-cinema-muted">Surpassed 5,000 cinema pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onStartSolo}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-sm shadow-xl shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-black" />
          Play Next Solo Round
        </button>

        {user?.isGuest ? (
          <>
            <button
              onClick={() => openAuthModal('signup')}
              className="py-3 px-6 rounded-2xl bg-cinema-cardHover hover:bg-cinema-border/60 border border-cinema-border text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              Upgrade to Registered Account
            </button>
            <button
              onClick={signOut}
              className="py-3 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Exit to Login Page
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
    </div>
  );
};
