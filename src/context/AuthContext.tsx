import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  hasEntered: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  playAsGuest: (guestName?: string) => void;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    // Only registered users or users who entered in current browser tab stay entered
    return sessionStorage.getItem('kollywood_session_entered') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

  // Initialize or restore user
  useEffect(() => {
    const savedGuest = localStorage.getItem('kollywood_current_guest');
    const sessionEntered = sessionStorage.getItem('kollywood_session_entered') === 'true';

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

          // ONLY actual logged-in users (Google/Email) bypass the login page automatically!
          // Anonymous/Guests must see the login page unless already entered in this tab session
          if (!isAnon) {
            setHasEntered(true);
            sessionStorage.setItem('kollywood_session_entered', 'true');
          } else if (sessionEntered) {
            setHasEntered(true);
          } else {
            setHasEntered(false);
          }
        } else if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          setUser(parsed);
          setHasEntered(sessionEntered);
          try {
            await signInAnonymously(currentAuth);
          } catch (e) {
            // Ignore if anonymous auth is not enabled
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
        // If not guest (e.g. mock registered account), auto-enter
        if (!parsed.isGuest || sessionEntered) {
          setHasEntered(true);
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
      }
      setLoading(false);
    }
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'welcome') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    // If closing for the first time, mark as chosen so it doesn't loop
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
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        playAsGuest,
        signOut,
        updateName
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
