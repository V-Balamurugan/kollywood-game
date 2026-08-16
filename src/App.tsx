import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { Home } from './pages/Home';
import { SoloGame } from './pages/SoloGame';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { RoomLobby } from './pages/RoomLobby';
import { MultiplayerGame } from './pages/MultiplayerGame';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Library } from './pages/Library';
import { Room } from './types/game';

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

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  // Check URL parameters on mount for deep-linked room codes or /admin /library routes
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('/admin') || hash === '#admin') {
        setCurrentView('admin');
        return;
      }

      if (path.includes('/library') || hash === '#library') {
        setCurrentView('library');
        return;
      }

      const params = new URLSearchParams(window.location.search);
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
            onStartSolo={() => setCurrentView('solo')}
            onCreateRoom={() => setCurrentView('create-room')}
            onJoinRoom={() => setCurrentView('join-room')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenProfile={() => setCurrentView('profile')}
          />
        )}

        {currentView === 'solo' && (
          <SoloGame onExit={() => setCurrentView('home')} />
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
            onExitToLobby={() => setCurrentView('room-lobby')}
          />
        )}

        {currentView === 'profile' && (
          <Profile
            onBack={() => navigateTo('home')}
            onStartSolo={() => navigateTo('solo')}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {currentView === 'library' && (
          <Library onBack={() => navigateTo('home')} />
        )}

        {currentView === 'admin' && (
          <Admin onBack={() => navigateTo('home')} />
        )}
      </main>

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
