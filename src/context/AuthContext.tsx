import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  auth, 
  hasValidFirebaseConfig 
} from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  User 
} from 'firebase/auth';

export type AuthModalMode = 'welcome' | 'signin' | 'signup' | 'guest';

export interface AuthUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  isGuest?: boolean;
}

// 2 Hours = 2 * 60 * 60 * 1000 ms
export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  hasEntered: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  sessionExpiredNotice: boolean;
  dismissSessionExpiredNotice: () => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  playAsGuest: (guestName?: string) => void;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  touchSessionActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<boolean>(false);

  // Check 2-hour session validity on mount
  const checkInitialSession = (): boolean => {
    if (typeof window === 'undefined') return false;
    const sessionEntered = sessionStorage.getItem('kollywood_session_entered') === 'true';
    const lastActiveStr = sessionStorage.getItem('kollywood_session_last_active');
    
    if (sessionEntered && lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        // Expired after 2 hours
        sessionStorage.removeItem('kollywood_session_entered');
        sessionStorage.removeItem('kollywood_session_last_active');
        sessionStorage.removeItem('kollywood_admin_auth_active');
        return false;
      }
    }
    return sessionEntered;
  };

  const [hasEntered, setHasEntered] = useState<boolean>(checkInitialSession);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  const lastTouchTimeRef = useRef<number>(Date.now());

  const touchSessionActivity = () => {
    const now = Date.now();
    lastTouchTimeRef.current = now;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kollywood_session_last_active', String(now));
    }
  };

  // 2-Hour Inactivity Heartbeat Monitor
  useEffect(() => {
    if (!hasEntered) return;

    touchSessionActivity();

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle writes to once every 10 seconds
      if (now - lastTouchTimeRef.current > 10000) {
        touchSessionActivity();
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown'];
    events.forEach(ev => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const heartbeat = setInterval(() => {
      const lastActiveStr = sessionStorage.getItem('kollywood_session_last_active');
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (Date.now() - lastActive >= SESSION_TIMEOUT_MS) {
          // Trigger 2-hour timeout
          sessionStorage.removeItem('kollywood_session_entered');
          sessionStorage.removeItem('kollywood_session_last_active');
          sessionStorage.removeItem('kollywood_admin_auth_active');
          setHasEntered(false);
          setSessionExpiredNotice(true);
          window.location.hash = '#/';
        }
      }
    }, 15000);

    return () => {
      clearInterval(heartbeat);
      events.forEach(ev => window.removeEventListener(ev, handleUserActivity));
    };
  }, [hasEntered]);

  // Initialize or restore user
  useEffect(() => {
    const savedGuest = localStorage.getItem('kollywood_current_guest');
    const sessionEntered = checkInitialSession();

    if (hasValidFirebaseConfig && auth) {
      const currentAuth = auth;
      const unsubscribe = onAuthStateChanged(currentAuth, async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const isAnon = firebaseUser.isAnonymous;
          const guestObj = savedGuest ? JSON.parse(savedGuest) : null;
          const authedUser: AuthUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || guestObj?.displayName || `Player_${firebaseUser.uid.slice(-4)}`,
            email: firebaseUser.email || undefined,
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
            isGuest: isAnon
          };
          setUser(authedUser);

          if (!isAnon) {
            if (sessionEntered) {
              setHasEntered(true);
              touchSessionActivity();
            } else {
              setHasEntered(true);
              sessionStorage.setItem('kollywood_session_entered', 'true');
              touchSessionActivity();
            }
          } else if (sessionEntered) {
            setHasEntered(true);
            touchSessionActivity();
          } else {
            setHasEntered(false);
          }
        } else if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          setUser(parsed);
          setHasEntered(sessionEntered);
          if (sessionEntered) touchSessionActivity();
          try {
            await signInAnonymously(currentAuth);
          } catch (e) {
            // Ignore
          }
        } else {
          const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
          const defaultGuest: AuthUser = {
            uid: guestId,
            displayName: `Player_${guestId.slice(-4)}`,
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
            isGuest: true
          };
          localStorage.setItem('kollywood_current_guest', JSON.stringify(defaultGuest));
          setUser(defaultGuest);
          setHasEntered(sessionEntered);
          if (sessionEntered) touchSessionActivity();

          try {
            await signInAnonymously(currentAuth);
          } catch (e) {
            // Ignore
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      if (savedGuest) {
        const parsed = JSON.parse(savedGuest);
        setUser(parsed);
        if (!parsed.isGuest || sessionEntered) {
          setHasEntered(true);
          touchSessionActivity();
        } else {
          setHasEntered(false);
        }
      } else {
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        const defaultGuest: AuthUser = {
          uid: guestId,
          displayName: `Player_${guestId.slice(-4)}`,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
          isGuest: true
        };
        localStorage.setItem('kollywood_current_guest', JSON.stringify(defaultGuest));
        setUser(defaultGuest);
        setHasEntered(sessionEntered);
        if (sessionEntered) touchSessionActivity();
      }
      setLoading(false);
    }
  }, []);

  const dismissSessionExpiredNotice = () => {
    setSessionExpiredNotice(false);
  };

  const openAuthModal = (mode: AuthModalMode = 'welcome') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    localStorage.setItem('kollywood_auth_chosen', 'true');
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    if (hasValidFirebaseConfig && auth) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        localStorage.removeItem('kollywood_current_guest');
      }
    } else {
      const mockId = 'google_' + Math.random().toString(36).substring(2, 9);
      const mockUser: AuthUser = {
        uid: mockId,
        displayName: 'Google Fan',
        email: 'fan@example.com',
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${mockId}`,
        isGuest: false
      };
      localStorage.setItem('kollywood_current_guest', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    localStorage.setItem('kollywood_auth_chosen', 'true');
    sessionStorage.setItem('kollywood_session_entered', 'true');
    touchSessionActivity();
    setHasEntered(true);
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (hasValidFirebaseConfig && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('kollywood_current_guest');
    } else {
      const name = email.split('@')[0];
      const mockUser: AuthUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        isGuest: false
      };
      localStorage.setItem('kollywood_current_guest', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    localStorage.setItem('kollywood_auth_chosen', 'true');
    sessionStorage.setItem('kollywood_session_entered', 'true');
    touchSessionActivity();
    setHasEntered(true);
    setIsAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (hasValidFirebaseConfig && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        localStorage.removeItem('kollywood_current_guest');
      }
    } else {
      const mockUser: AuthUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        displayName: name || email.split('@')[0],
        email,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        isGuest: false
      };
      localStorage.setItem('kollywood_current_guest', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    localStorage.setItem('kollywood_auth_chosen', 'true');
    sessionStorage.setItem('kollywood_session_entered', 'true');
    touchSessionActivity();
    setHasEntered(true);
    setIsAuthModalOpen(false);
  };

  const playAsGuest = async (guestName?: string) => {
    const guestId = user?.uid?.startsWith('guest_') ? user.uid : 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser: AuthUser = {
      uid: guestId,
      displayName: guestName?.trim() || user?.displayName || `Player_${guestId.slice(-4)}`,
      photoURL: user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
      isGuest: true
    };
    localStorage.setItem('kollywood_current_guest', JSON.stringify(guestUser));
    localStorage.setItem('kollywood_auth_chosen', 'true');
    sessionStorage.setItem('kollywood_session_entered', 'true');
    touchSessionActivity();
    setUser(guestUser);
    setHasEntered(true);

    if (hasValidFirebaseConfig && auth) {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        // Ignore
      }
    }

    setIsAuthModalOpen(false);
  };

  const updateName = async (name: string) => {
    if (!name.trim()) return;
    if (user) {
      const updated = { ...user, displayName: name.trim() };
      setUser(updated);
      touchSessionActivity();
      if (user.isGuest) {
        localStorage.setItem('kollywood_current_guest', JSON.stringify(updated));
      } else if (hasValidFirebaseConfig && auth && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
    }
  };

  const signOut = async () => {
    if (hasValidFirebaseConfig && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('kollywood_current_guest');
    localStorage.removeItem('kollywood_auth_chosen');
    sessionStorage.removeItem('kollywood_session_entered');
    sessionStorage.removeItem('kollywood_session_last_active');
    sessionStorage.removeItem('kollywood_admin_auth_active');
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const defaultGuest: AuthUser = {
      uid: guestId,
      displayName: `Player_${guestId.slice(-4)}`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
      isGuest: true
    };
    localStorage.setItem('kollywood_current_guest', JSON.stringify(defaultGuest));
    setUser(defaultGuest);
    setHasEntered(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasEntered,
        isAuthModalOpen,
        authModalMode,
        sessionExpiredNotice,
        dismissSessionExpiredNotice,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        playAsGuest,
        signOut,
        updateName,
        touchSessionActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
