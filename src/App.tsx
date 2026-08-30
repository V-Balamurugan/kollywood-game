import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { WelcomeGate } from './pages/WelcomeGate';
import { Home } from './pages/Home';
import { SoloGame } from './pages/SoloGame';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { RoomLobby } from './pages/RoomLobby';
import { MultiplayerGame } from './pages/MultiplayerGame';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Library } from './pages/Library';
import { Contact } from './pages/Contact';
import { Room, Puzzle } from './types/game';
import { syncGlobalCustomPuzzles, subscribeGlobalCustomPuzzles } from './services/puzzleManager';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

type AppView = 
  | 'home'
  | 'solo'
  | 'create-room'
  | 'join-room'
  | 'room-lobby'
  | 'multiplayer-game'
  | 'profile'
  | 'library'
  | 'admin'
  | 'contact';

export const AppContent: React.FC = () => {
  const { hasEntered, loading, sessionExpiredNotice, dismissSessionExpiredNotice } = useAuth();
  
  // Helper to parse view and room from current location
  const parseCurrentLocation = (): { view: AppView; roomCode: string | null } => {
    if (typeof window === 'undefined') return { view: 'home', roomCode: null };
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const hashParams = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null;

    const roomParam = params.get('room') || hashParams?.get('room') || (hash.startsWith('#room=') ? hash.replace('#room=', '') : null);

    if (hash.includes('admin') || path.includes('/admin')) return { view: 'admin', roomCode: null };
    if (hash.includes('library') || path.includes('/library')) return { view: 'library', roomCode: null };
    if (hash.includes('contact') || path.includes('/contact')) return { view: 'contact', roomCode: null };
    if (hash.includes('profile') || path.includes('/profile')) return { view: 'profile', roomCode: null };
    if (hash.includes('solo') || path.includes('/solo')) return { view: 'solo', roomCode: null };
    if (hash.includes('create-room') || path.includes('/create-room')) return { view: 'create-room', roomCode: null };
    if (hash.includes('join-room') || path.includes('/join-room')) return { view: 'join-room', roomCode: null };
    if (hash.includes('lobby') || roomParam) return { view: 'room-lobby', roomCode: roomParam ? roomParam.toUpperCase() : null };
    if (hash.includes('game') && roomParam) return { view: 'multiplayer-game', roomCode: roomParam.toUpperCase() };

    return { view: 'home', roomCode: null };
  };

  const initialLoc = parseCurrentLocation();
  const [currentView, setCurrentView] = useState<AppView>(initialLoc.view);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(initialLoc.roomCode);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [soloCustomPuzzle, setSoloCustomPuzzle] = useState<Puzzle | null>(null);
  
  // Guard to avoid infinite routing loops when updating URL dynamically
  const isInternalNavigationRef = useRef(false);

  // Background real-time library sync from Cloud / Admin
  useEffect(() => {
    syncGlobalCustomPuzzles();
    const unsubscribe = subscribeGlobalCustomPuzzles();
    return () => {
      unsubscribe();
    };
  }, []);

  // Synchronize URL hash dynamically whenever currentView or activeRoomCode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let targetHash = '';
    switch (currentView) {
      case 'home':
        targetHash = '#/';
        break;
      case 'admin':
        targetHash = '#/admin';
        break;
      case 'library':
        targetHash = '#/library';
        break;
      case 'contact':
        targetHash = '#/contact';
        break;
      case 'profile':
        targetHash = '#/profile';
        break;
      case 'solo':
        targetHash = '#/solo';
        break;
      case 'create-room':
        targetHash = '#/create-room';
        break;
      case 'join-room':
        targetHash = '#/join-room';
        break;
      case 'room-lobby':
        targetHash = activeRoomCode ? `#/lobby?room=${activeRoomCode}` : '#/room-lobby';
        break;
      case 'multiplayer-game':
        targetHash = activeRoomCode ? `#/game?room=${activeRoomCode}` : '#/game';
        break;
      default:
        targetHash = '#/';
    }

    if (window.location.hash !== targetHash) {
      isInternalNavigationRef.current = true;
      window.history.pushState(null, '', targetHash);
      setTimeout(() => {
        isInternalNavigationRef.current = false;
      }, 50);
    }
  }, [currentView, activeRoomCode]);

  // Listen for browser Back/Forward navigation and external hash changes
  useEffect(() => {
    const handleUrlRouting = () => {
      if (isInternalNavigationRef.current) return;
      const { view, roomCode } = parseCurrentLocation();
      setCurrentView(view);
      if (roomCode) {
        setActiveRoomCode(roomCode);
      }
    };

    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);

    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view === 'home' || view === 'profile' || view === 'admin' || view === 'library' || view === 'contact') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartSolo = (customPuzzle?: Puzzle) => {
    setSoloCustomPuzzle(customPuzzle || null);
    setCurrentView('solo');
  };

  const handleRoomCreated = (code: string) => {
    setActiveRoomCode(code);
    setCurrentView('room-lobby');
  };

  const handleRoomJoined = (code: string) => {
    setActiveRoomCode(code);
    setCurrentView('room-lobby');
  };

  const handleGameStarted = () => {
    setCurrentView('multiplayer-game');
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode(null);
    setCurrentView('home');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 border-2 border-cyan-400 animate-spin flex items-center justify-center">
          <div className="w-4 h-4 bg-cyan-400 rounded-sm" />
        </div>
        <p className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
          INITIALIZING ARENA...
        </p>
      </div>
    );
  }

  // Welcome Gate
  if (!hasEntered) {
    return <WelcomeGate />;
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-cyan-400 selection:text-black font-sans">
      {/* Universal Cinema Header */}
      <Navbar
        onNavigateHome={() => navigateTo('home')}
        onNavigateProfile={() => navigateTo('profile')}
        onNavigateLibrary={() => navigateTo('library')}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <Home
            onStartSolo={() => handleStartSolo()}
            onCreateRoom={() => setCurrentView('create-room')}
            onJoinRoom={() => setCurrentView('join-room')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenProfile={() => navigateTo('profile')}
            onOpenLibrary={() => navigateTo('library')}
            onRoomJoinedDirect={handleRoomJoined}
          />
        )}

        {currentView === 'solo' && (
          <SoloGame
            onExit={() => setCurrentView('home')}
            initialPuzzle={soloCustomPuzzle || undefined}
          />
        )}

        {currentView === 'create-room' && (
          <CreateRoom
            onRoomCreated={handleRoomCreated}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'join-room' && (
          <JoinRoom
            onRoomJoined={handleRoomJoined}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'room-lobby' && activeRoomCode && (
          <RoomLobby
            roomCode={activeRoomCode}
            onGameStarted={handleGameStarted}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentView === 'multiplayer-game' && activeRoomCode && (
          <MultiplayerGame
            roomCode={activeRoomCode}
            onExitHome={handleLeaveRoom}
          />
        )}

        {currentView === 'profile' && (
          <Profile
            onBack={() => navigateTo('home')}
            onStartSolo={() => handleStartSolo()}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {currentView === 'library' && (
          <Library
            onBack={() => navigateTo('home')}
            onSelectMovieForMatch={(puzzle) => handleStartSolo(puzzle)}
          />
        )}

        {currentView === 'contact' && (
          <Contact onBack={() => navigateTo('home')} />
        )}

        {currentView === 'admin' && (
          <Admin onBack={() => navigateTo('home')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenProfile={() => navigateTo('profile')}
        onOpenLibrary={() => navigateTo('library')}
        onOpenAdmin={() => navigateTo('admin')}
        onOpenContact={() => navigateTo('contact')}
        onOpenCookieSettings={() => setIsCookieModalOpen(true)}
      />

      {/* Global Modals */}
      <AuthModal />
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
      <CookieSettingsModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />

      {/* 2-Hour Session Expired Alert Modal */}
      {sessionExpiredNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-md bg-[#0c101a] border border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">⏱️</span>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">
              Session Timed Out
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Your match session automatically expired after <strong>2 hours</strong> for security and memory optimization. Please re-enter the arena.
            </p>
            <button
              onClick={dismissSessionExpiredNotice}
              className="w-full py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              Enter Arena
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
