import React, { useState } from 'react';
import { 
  Volume2, VolumeX, Sparkles, User as UserIcon, LogOut, 
  HelpCircle, Film, BookOpen, Menu, X, Home, ChevronRight 
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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cinema-border/60 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-2 sm:gap-3 group text-left transition-transform active:scale-95 flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow flex-shrink-0">
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-display font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-amber-200 via-brand-400 to-amber-500 bg-clip-text text-transparent">
                KOLLYWOOD
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                CONNECT
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-cinema-muted hidden md:block">
              2x2 Cinema Trivia Arena
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
              className="p-2 rounded-xl bg-cinema-card hover:bg-brand-500/20 border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Library</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute sound' : 'Mute sound'}
            className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* How to play */}
          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              title="How to play"
              className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  className="w-7 h-7 rounded-lg bg-cinema-cardHover border border-brand-500/30 object-cover flex-shrink-0"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                  {user.isGuest && (
                    <span className="text-[9px] bg-brand-500/10 text-brand-400 px-1 rounded border border-brand-500/20 font-medium">
                      Guest
                    </span>
                  )}
                </div>
              </button>

              {user.isGuest && (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black shadow-md shadow-brand-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              <button
                onClick={signOut}
                title={user.isGuest ? "Exit to Login Page" : "Sign out"}
                className="p-2 rounded-xl bg-cinema-card hover:bg-red-500/20 border border-cinema-border/60 text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-semibold">{user.isGuest ? 'Exit' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('welcome')}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black shadow-lg shadow-brand-500/25 hover:brightness-110 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Controls (Below md) - Sound Toggle + Hamburger Dropdown Button */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-cardHover border border-cinema-border/60 text-slate-300 hover:text-brand-400 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Profile/Sign In Button */}
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
            className={`p-2 rounded-xl border transition-all ${
              isMobileMenuOpen
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
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-cinema-border/50 animate-fade-in space-y-2">
          {/* User Status Bar in Menu */}
          {user ? (
            <div className="p-3 rounded-2xl bg-cinema-dark/90 border border-cinema-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-xl bg-cinema-card border border-brand-500/30 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {user.displayName}
                    </span>
                    {user.isGuest && (
                      <span className="text-[9px] bg-brand-500/10 text-brand-400 px-1 rounded border border-brand-500/20 font-semibold">
                        Guest
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-cinema-muted">Cinephile Member</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {user.isGuest && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-xl bg-brand-500 text-black shadow"
                  >
                    Sign In
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="p-1.5 px-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1 font-semibold"
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
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-black text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleHomeClick}
              className="p-2.5 rounded-xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
            >
              <Home className="w-4 h-4 text-brand-400" />
              <span>Arena Home</span>
            </button>

            {onNavigateLibrary && (
              <button
                onClick={handleLibraryClick}
                className="p-2.5 rounded-xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Film Library</span>
              </button>
            )}

            {onOpenHowToPlay && (
              <button
                onClick={handleHowToPlayClick}
                className="p-2.5 rounded-xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-brand-400" />
                <span>How to Play</span>
              </button>
            )}

            {onNavigateProfile && (
              <button
                onClick={handleProfileClick}
                className="p-2.5 rounded-xl bg-cinema-dark/80 hover:bg-cinema-cardHover border border-cinema-border/50 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>My Profile</span>
              </button>
            )}
          </div>

          {/* Sound Effect Quick Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-dark/60 border border-cinema-border/40 text-xs text-cinema-muted">
            <div className="flex items-center gap-2">
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
              <span className="text-slate-300 font-semibold">Cinema Sound FX</span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                !muted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-cinema-cardHover text-slate-400 border-cinema-border'
              }`}
            >
              {muted ? 'Muted (OFF)' : 'Enabled (ON)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


