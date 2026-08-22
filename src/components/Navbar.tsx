import React, { useState } from 'react';
import {
  Volume2, VolumeX, Sparkles, User as UserIcon, LogOut,
  HelpCircle, Film, BookOpen, Menu, X, Home, Shield, Clapperboard
} from 'lucide-react';
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
  const { user, signOut, openAuthModal } = useAuth();
  const [muted, setMuted] = useState(sound.getMuted());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSoundToggle = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  const handleLibraryClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateLibrary) onNavigateLibrary();
  };

  const handleHowToPlayClick = () => {
    setIsMobileMenuOpen(false);
    if (onOpenHowToPlay) onOpenHowToPlay();
  };

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateProfile) onNavigateProfile();
  };

  const handleAdminClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateAdmin) onNavigateAdmin();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cinema-border/70 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-2.5 sm:gap-3 group text-left transition-all active:scale-95 flex-shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border-2 border-brand-500/60 shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/45 group-hover:scale-105 transition-all flex-shrink-0 bg-black">
            <img
              src="/logo.png"
              alt="Kollywood Game Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
                KOLLYWOOD
              </span>
              <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30 tracking-wider">
                GAME
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-cinema-muted hidden md:flex items-center gap-1 -mt-0.5">
              <span>2x2 Tamil Cinema Trivia Arena</span>
            </p>
          </div>
        </button>

        {/* Desktop Controls (md and above) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Library Button */}
          {onNavigateLibrary && (
            <button
              onClick={onNavigateLibrary}
              title="Browse Movie Library & Clues"
              className="px-3 py-1.5 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>Library</span>
            </button>
          )}

          {/* How to play */}
          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              title="How to play"
              className="px-3 py-1.5 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 hover:border-brand-500/40 text-slate-300 hover:text-brand-300 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>Rules</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute cinema audio' : 'Mute cinema audio'}
            className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${!muted
                ? 'bg-cinema-card hover:bg-cinema-cardHover border-cinema-border/60 text-brand-400'
                : 'bg-cinema-card hover:bg-cinema-cardHover border-cinema-border/60 text-slate-500'
              }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-cinema-border/60">
              <button
                onClick={onNavigateProfile}
                title="View Cinephile Profile"
                className="flex items-center gap-2 bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/50 rounded-xl px-2.5 py-1.5 transition-all text-left group active:scale-95 shadow-sm"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-lg bg-cinema-dark border border-brand-500/40 object-cover flex-shrink-0 group-hover:border-brand-400"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200 max-w-[110px] truncate group-hover:text-white">
                    {user.displayName}
                  </span>
                  {user.isGuest && (
                    <span className="text-[9px] bg-brand-500/15 text-brand-400 px-1 py-0.2 rounded border border-brand-500/30 font-bold uppercase">
                      Guest
                    </span>
                  )}
                </div>
              </button>

              {user.isGuest && (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black shadow-md shadow-brand-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              )}

              <button
                onClick={signOut}
                title={user.isGuest ? "Exit to Login Page" : "Sign out"}
                className="p-2 rounded-xl bg-cinema-card hover:bg-red-500/20 border border-cinema-border/60 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-bold">{user.isGuest ? 'Exit' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('welcome')}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl btn-cinema-primary shadow-md active:scale-95 transition-all"
            >
              <UserIcon className="w-4 h-4 text-black" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Controls (Below md) */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
          </button>

          {/* Quick Profile Button */}
          {user ? (
            <button
              onClick={handleProfileClick}
              title="Profile"
              className="p-1 rounded-xl bg-cinema-card border border-cinema-border/60"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                alt={user.displayName}
                className="w-6 h-6 rounded-lg object-cover"
              />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('welcome')}
              className="p-1.5 rounded-xl bg-brand-500 text-black font-bold text-xs"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Hamburger Dropdown Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className={`p-2 rounded-xl border transition-all ${isMobileMenuOpen
                ? 'bg-brand-500 text-black border-brand-500 shadow-md shadow-brand-500/30'
                : 'bg-cinema-card hover:bg-cinema-cardHover border-cinema-border/60 text-slate-200'
              }`}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-cinema-border/60 animate-fade-in space-y-2.5">
          {/* User Status Bar in Menu */}
          {user ? (
            <div className="p-3 rounded-2xl bg-cinema-surface border border-cinema-border/80 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-9 h-9 rounded-xl bg-cinema-card border border-brand-500/40 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      {user.displayName}
                    </span>
                    {user.isGuest && (
                      <span className="text-[9px] bg-brand-500/15 text-brand-400 px-1.5 rounded border border-brand-500/30 font-bold">
                        Guest
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-cinema-muted">Kollywood Cinephile</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {user.isGuest && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="text-xs font-black px-2.5 py-1.5 rounded-xl bg-brand-500 text-black shadow"
                  >
                    Sign In
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="p-1.5 px-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{user.isGuest ? 'Exit' : 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full py-3 px-4 rounded-2xl btn-cinema-primary font-black text-xs flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-black" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleHomeClick}
              className="p-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
            >
              <Home className="w-4 h-4 text-brand-400" />
              <span>Arena Home</span>
            </button>

            {onNavigateLibrary && (
              <button
                onClick={handleLibraryClick}
                className="p-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Film Library</span>
              </button>
            )}

            {onOpenHowToPlay && (
              <button
                onClick={handleHowToPlayClick}
                className="p-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-brand-400" />
                <span>Game Rules</span>
              </button>
            )}

            {onNavigateProfile && (
              <button
                onClick={handleProfileClick}
                className="p-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>My Profile</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


