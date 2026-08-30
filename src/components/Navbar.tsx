import React, { useState } from 'react';
import {
  Volume2, VolumeX, Sparkles, User as UserIcon, LogOut,
  HelpCircle, BookOpen, Menu, X, Home, Trophy, Shield, Film
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
    <header className="sticky top-0 z-50 w-full bg-[#070a12]/95 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 py-3 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-3 group text-left transition-all cursor-pointer select-none"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex-shrink-0 bg-black">
            <img
              src="/logo.png"
              alt="Kollywood Game"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                KOLLYWOOD GAME
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5">
              2×2 Tamil Cinema Trivia Arena
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={handleHomeClick}
            className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            Home
          </button>
          {onNavigateLibrary && (
            <button
              onClick={handleLibraryClick}
              className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Film Library</span>
            </button>
          )}
          {onOpenHowToPlay && (
            <button
              onClick={handleHowToPlayClick}
              className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rules</span>
            </button>
          )}
          {onNavigateProfile && (
            <button
              onClick={handleProfileClick}
              className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Leaderboard</span>
            </button>
          )}
        </nav>

        {/* Desktop Controls (Sound & User Profile) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={muted ? 'Unmute cinema audio' : 'Mute cinema audio'}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User Profile Card */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={handleProfileClick}
                title="View Profile"
                className="flex items-center gap-2 bg-[#0c101a] hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl px-2.5 py-1.5 transition-all text-left group cursor-pointer shadow-sm"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-lg bg-black border border-cyan-500/40 object-cover flex-shrink-0"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200 max-w-[110px] truncate group-hover:text-white">
                    {user.displayName}
                  </span>
                  {user.isGuest && (
                    <span className="text-[9px] bg-cyan-950/80 text-cyan-400 px-1 py-0.2 rounded border border-cyan-500/30 font-bold uppercase">
                      VIP Pass
                    </span>
                  )}
                </div>
              </button>

              {user.isGuest && (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}

              <button
                onClick={signOut}
                title={user.isGuest ? 'Exit to Entry Gate' : 'Sign out'}
                className="p-2 rounded-xl bg-[#0c101a] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-black" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleSoundToggle}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          {user && (
            <div className="p-3 rounded-2xl bg-[#0c101a] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40"
                />
                <span className="text-xs font-bold text-white">{user.displayName}</span>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                className="text-xs text-rose-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <button
              onClick={handleHomeClick}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-left flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>Home</span>
            </button>
            {onNavigateLibrary && (
              <button
                onClick={handleLibraryClick}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-left flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Film Library</span>
              </button>
            )}
            {onOpenHowToPlay && (
              <button
                onClick={handleHowToPlayClick}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-left flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Game Rules</span>
              </button>
            )}
            {onNavigateProfile && (
              <button
                onClick={handleProfileClick}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-left flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-cyan-400" />
                <span>Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
