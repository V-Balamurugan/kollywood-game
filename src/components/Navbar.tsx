import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, User as UserIcon, LogOut, HelpCircle, Film, ShieldCheck, Edit2, Check, BookOpen } from 'lucide-react';
import { sound } from '../services/sound';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenHowToPlay?: () => void;
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateLibrary?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHowToPlay,
  onNavigateHome,
  onNavigateProfile,
  onNavigateAdmin,
  onNavigateLibrary
}) => {
  const { user, signOut, openAuthModal, updateName } = useAuth();
  const [muted, setMuted] = useState(sound.getMuted());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.displayName || '');

  const handleSoundToggle = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cinema-border/50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <Film className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
                KOLLYWOOD
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                CONNECT
              </span>
            </div>
            <p className="text-[11px] text-cinema-muted hidden sm:block">
              2x2 Cinema Trivia Arena
            </p>
          </div>
        </button>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Library Button */}
          {onNavigateLibrary && (
            <button
              onClick={onNavigateLibrary}
              title="Browse Movie Library & Clues"
              className="p-2 rounded-xl bg-cinema-card hover:bg-brand-500/20 border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">Library</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute sound' : 'Mute sound'}
            className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* How to play */}
          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              title="How to play"
              className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-cinema-border/50">
              <button
                onClick={onNavigateProfile}
                title="View Cinephile Profile"
                className="flex items-center gap-2 bg-cinema-card/80 hover:bg-cinema-cardHover border border-cinema-border/60 hover:border-brand-500/40 rounded-xl px-2.5 py-1.5 transition-colors text-left"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-lg bg-cinema-cardHover border border-brand-500/30 object-cover"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                    {user.displayName}
                  </span>
                  {user.isGuest && (
                    <span className="text-[9px] bg-brand-500/10 text-brand-400 px-1 rounded border border-brand-500/20 font-medium">
                      Guest
                    </span>
                  )}
                </div>
              </button>

              {user.isGuest ? (
                <button
                  onClick={openAuthModal}
                  className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black shadow-md shadow-brand-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="p-2 rounded-xl bg-cinema-card hover:bg-red-500/20 border border-cinema-border/60 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black shadow-lg shadow-brand-500/25 hover:brightness-110 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
