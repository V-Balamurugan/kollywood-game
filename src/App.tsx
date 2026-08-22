import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HowToPlayModal } from './components/HowToPlayModal';
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
import { Room, Puzzle } from './types/game';

type AppView = 
  | 'home'
  | 'solo'
  | 'create-room'
  | 'join-room'
  | 'room-lobby'
  | 'multiplayer-game'
  | 'profile'
  | 'library'
  | 'admin';

import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const { hasEntered, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toLowerCase() || params.get('page')?.toLowerCase();

    if (path.includes('/admin') || hash.includes('admin') || viewParam === 'admin') {
      return 'admin';
    }
    if (path.includes('/library') || hash.includes('library') || viewParam === 'library') {
      return 'library';
    }
    return 'home';
  });

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [soloCustomPuzzle, setSoloCustomPuzzle] = useState<Puzzle | null>(null);

  // Check URL parameters and paths on mount and updates for deep-linked room codes or /admin /library routes
  useEffect(() => {
    const handleUrlRouting = () => {
      // Check stored SPA redirect if any from 404.html fallback
      const spaRedirect = sessionStorage.getItem('spa_redirect_path');
      if (spaRedirect) {
        sessionStorage.removeItem('spa_redirect_path');
      }

      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view')?.toLowerCase() || params.get('page')?.toLowerCase();

      // Check for Admin page via path, hash, query params or fallback redirect
      if (
        path.includes('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.includes('admin') ||
        viewParam === 'admin' ||
        (spaRedirect && spaRedirect.toLowerCase().includes('admin'))
      ) {
        setCurrentView('admin');
        return;
      }

      // Check for Library page via path, hash, query params or fallback redirect
      if (
        path.includes('/library') ||
        hash === '#library' ||
        hash === '#/library' ||
        hash.includes('library') ||
        viewParam === 'library' ||
        (spaRedirect && spaRedirect.toLowerCase().includes('library'))
      ) {
        setCurrentView('library');
        return;
      }

      const roomParam = params.get('room') || params.get('join');
      if (roomParam) {
        setActiveRoomCode(roomParam.toUpperCase());
        setCurrentView('room-lobby');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);

    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, []);

  const navigateTo = (view: AppView) => {
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'library') {
      window.history.pushState({}, '', '/library');
    } else {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };

  const handleStartSolo = (puzzle?: Puzzle) => {
    setSoloCustomPuzzle(puzzle || null);
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

  const handleGameStarted = (_room: Room) => {
    setCurrentView('multiplayer-game');
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode(null);
    setCurrentView('home');
    window.history.replaceState({}, document.title, '/');
  };

  // If the user has not entered or chosen to play yet, show the full-screen Welcome & Login Landing Page
  // (Admin Dashboard is accessed directly via URL e.g. /admin)
  if (!hasEntered && currentView !== 'admin') {
    return <WelcomeGate />;
  }

  return (
    <div className="min-h-screen bg-cinema-dark text-slate-100 flex flex-col justify-between">
      {/* Global Navbar */}
      <Navbar
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onNavigateHome={() => navigateTo('home')}
        onNavigateProfile={() => navigateTo('profile')}
        onNavigateAdmin={() => navigateTo('admin')}
        onNavigateLibrary={() => navigateTo('library')}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onStartSolo={() => handleStartSolo()}
            onCreateRoom={() => setCurrentView('create-room')}
            onJoinRoom={() => setCurrentView('join-room')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenProfile={() => setCurrentView('profile')}
            onOpenLibrary={() => navigateTo('library')}
          />
        )}

        {currentView === 'solo' && (
          <SoloGame
            initialPuzzle={soloCustomPuzzle || undefined}
            onExit={() => {
              setSoloCustomPuzzle(null);
              setCurrentView('home');
            }}
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
      />

      {/* Global Modals */}
      <AuthModal />
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
};


import { ErrorBoundary } from './components/ErrorBoundary';

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
