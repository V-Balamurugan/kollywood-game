import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  signInAnonymously
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove,
  onValue, 
  off, 
  Database
} from 'firebase/database';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Firestore 
} from 'firebase/firestore';
import { Room, UserProfile, Player, CellAnswer, SharedCellAnswer, GameSettings, Puzzle, DirectorHint, HintRequest } from '../types/game';
import puzzlesData from '../data/puzzles.json';
import { getSelectedPuzzles } from '../utils/puzzleSelector';
import { addPuzzleIfNotExists } from './puzzleManager';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasValidFirebaseConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' && 
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id'
);

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: Database | undefined;
let firestore: Firestore | undefined;

if (hasValidFirebaseConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getDatabase(app);
    firestore = getFirestore(app);
    console.log('🔥 Firebase initialized successfully.');
  } catch (err) {
    console.warn('Firebase initialization warning, falling back to local mode:', err);
  }
} else {
  console.log('ℹ️ Operating in full Local/Broadcast multiplayer mode.');
}

export { auth, db, firestore, hasValidFirebaseConfig };

// ==========================================
// LOCAL / BROADCAST FALLBACK LAYER
// ==========================================
class LocalStorageFallback {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('kollywood_connect_sync');
      this.channel.onmessage = (event) => {
        const { key, data } = event.data;
        if (this.listeners.has(key)) {
          this.listeners.get(key)!.forEach(cb => cb(data));
        }
      };
    }
  }

  getRoom(code: string): Room | null {
    const raw = localStorage.getItem(`kollywood_room_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  }

  setRoom(code: string, room: Room): void {
    const key = code.toUpperCase();
    localStorage.setItem(`kollywood_room_${key}`, JSON.stringify(room));
    if (this.channel) {
      this.channel.postMessage({ key: `room_${key}`, data: room });
    }
    if (this.listeners.has(`room_${key}`)) {
      this.listeners.get(`room_${key}`)!.forEach(cb => cb(room));
    }
  }

  subscribeRoom(code: string, callback: (room: Room | null) => void): () => void {
    const key = `room_${code.toUpperCase()}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    
    // Initial emission
    callback(this.getRoom(code));

    return () => {
      if (this.listeners.has(key)) {
        this.listeners.get(key)!.delete(callback);
      }
    };
  }
}

const localFallback = new LocalStorageFallback();

// ==========================================
// ROOM MANAGEMENT SERVICE
// ==========================================

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createRoom(
  hostUser: { uid: string; displayName: string; photoURL?: string },
  settings: GameSettings
): Promise<string> {
  const code = generateRoomCode();
  
  // Pick initial pool of puzzles with mixed difficulty
  const poolCount = settings.totalRounds || 25;
  const selectedPuzzles = getSelectedPuzzles(poolCount, settings.difficulty);
  const puzzleIds = selectedPuzzles.map(p => p.id);

  const initialRoom: Room = {
    code,
    hostUid: hostUser.uid,
    status: 'lobby',
    players: {
      [hostUser.uid]: {
        uid: hostUser.uid,
        name: hostUser.displayName || 'Hero Player',
        avatar: hostUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostUser.uid}`,
        score: 0,
        ready: true,
        isHost: true,
        connected: true,
        lastActive: Date.now()
      }
    },
    currentPuzzleIndex: 0,
    puzzleIds,
    answers: {},
    createdAt: Date.now(),
    settings
  };

  // Always save locally so game works regardless of Firebase permissions
  localFallback.setRoom(code, initialRoom);

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${code}`);
      await set(roomRef, initialRoom);
    } catch (err: any) {
      console.warn('Firebase Realtime DB permission or connection notice. Using instant local sync fallback:', err?.message);
    }
  }

  return code;
}

export async function joinRoom(
  code: string,
  user: { uid: string; displayName: string; photoURL?: string }
): Promise<{ success: boolean; message?: string; room?: Room }> {
  const roomCode = code.toUpperCase().trim();

  let room: Room | null = null;

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        room = snapshot.val() as Room;
      }
    } catch (err: any) {
      console.warn('Firebase Realtime DB read notice, trying local fallback:', err?.message);
    }
  }

  if (!room) {
    room = localFallback.getRoom(roomCode);
  }

  if (!room) {
    return { success: false, message: `Room "${roomCode}" was not found.` };
  }

  if (room.status === 'finished') {
    return { success: false, message: 'This game has already ended.' };
  }

  const updatedPlayer: Player = {
    uid: user.uid,
    name: user.displayName || 'Cinema Fan',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    score: room.players?.[user.uid]?.score || 0,
    ready: false,
    isHost: room.hostUid === user.uid,
    connected: true,
    lastActive: Date.now()
  };

  room.players = { ...(room.players || {}), [user.uid]: updatedPlayer };
  localFallback.setRoom(roomCode, room);

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/players/${user.uid}`), updatedPlayer);
    } catch (err: any) {
      console.warn('Firebase update player notice:', err?.message);
    }
  }

  return { success: true, room };
}

export function subscribeToRoom(code: string, callback: (room: Room | null) => void): () => void {
  const roomCode = code.toUpperCase().trim();

  // Local fallback subscription (always active)
  const unsubscribeLocal = localFallback.subscribeRoom(roomCode, (localRoom) => {
    if (localRoom) callback(localRoom);
  });

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const unsubscribe = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const firebaseRoom = snapshot.val() as Room;
            localFallback.setRoom(roomCode, firebaseRoom);
            callback(firebaseRoom);
          }
        },
        (error) => {
          console.warn('Firebase onValue notice:', error?.message);
        }
      );

      return () => {
        unsubscribeLocal();
        off(roomRef, 'value', unsubscribe);
      };
    } catch (e) {
      console.warn('Firebase subscribe fallback:', e);
    }
  }

  return unsubscribeLocal;
}

export async function setPlayerReady(code: string, uid: string, ready: boolean): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  
  const room = localFallback.getRoom(roomCode);
  if (room && room.players[uid]) {
    room.players[uid].ready = ready;
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/players/${uid}`), { ready });
    } catch (err: any) {
      console.warn('Firebase setPlayerReady notice:', err?.message);
    }
  }
}

export async function kickPlayerFromRoom(code: string, targetUid: string): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  
  const room = localFallback.getRoom(roomCode);
  if (room && room.players) {
    delete room.players[targetUid];
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await remove(ref(db, `rooms/${roomCode}/players/${targetUid}`));
    } catch (err: any) {
      console.warn('Firebase kickPlayerFromRoom notice:', err?.message);
    }
  }
}

export async function leaveRoom(code: string, uid: string): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  
  const room = localFallback.getRoom(roomCode);
  if (room && room.players) {
    delete room.players[uid];
    if (Object.keys(room.players).length === 0 || room.hostUid === uid) {
      room.status = 'finished';
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await remove(ref(db, `rooms/${roomCode}/players/${uid}`));
      if (room && (Object.keys(room.players).length === 0 || room.hostUid === uid)) {
        await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
      }
    } catch (err: any) {
      console.warn('Firebase leaveRoom notice:', err?.message);
    }
  }
}

export async function startRoomGame(code: string): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const updates = {
    status: 'in-progress' as const,
    currentPuzzleIndex: 0,
    roundStartTime: Date.now(),
    answers: {}
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}`), updates);
    } catch (err: any) {
      console.warn('Firebase startRoomGame notice:', err?.message);
    }
  }
}

export async function startPuzzleCreation(code: string, creatorUid: string): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const updates = {
    status: 'creating-puzzle' as const,
    currentCreatorUid: creatorUid,
    sharedAnswers: {},
    answers: {}
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    room.sharedAnswers = {};
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}`), updates);
      await set(ref(db, `rooms/${roomCode}/sharedAnswers`), {});
    } catch (err: any) {
      console.warn('Firebase startPuzzleCreation notice:', err?.message);
    }
  }
}

export async function setCustomPuzzleAndStart(code: string, puzzle: Puzzle): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  
  // Persist to local & global database if not exists
  addPuzzleIfNotExists(puzzle);

  const updates = {
    customPuzzle: puzzle,
    status: 'in-progress' as const,
    roundStartTime: Date.now(),
    sharedAnswers: {},
    answers: {},
    nextRoundVotes: {}
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    room.customPuzzle = puzzle;
    room.sharedAnswers = {};
    room.nextRoundVotes = {};
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      // Store into shared /customPuzzles node so all players get it
      await set(ref(db, `customPuzzles/${puzzle.id}`), puzzle);
      await update(ref(db, `rooms/${roomCode}`), updates);
      await set(ref(db, `rooms/${roomCode}/sharedAnswers`), {});
      await set(ref(db, `rooms/${roomCode}/nextRoundVotes`), {});
    } catch (err: any) {
      console.warn('Firebase setCustomPuzzleAndStart notice:', err?.message);
    }
  }
}

export async function submitSharedCellAnswer(
  code: string,
  category: string,
  answer: CellAnswer,
  player: { uid: string; name: string; avatar?: string },
  points: number,
  currentScore: number
): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const newScore = currentScore + points;

  const sharedData: SharedCellAnswer = {
    ...answer,
    solvedByUid: player.uid,
    solvedByName: player.name,
    solvedByAvatar: player.avatar
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    if (!room.sharedAnswers) room.sharedAnswers = {};
    room.sharedAnswers[category] = sharedData;
    if (room.players[player.uid]) {
      room.players[player.uid].score = newScore;
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/sharedAnswers/${category}`), sharedData);
      await update(ref(db, `rooms/${roomCode}/players/${player.uid}`), { score: newScore });
    } catch (err: any) {
      console.warn('Firebase submitSharedCellAnswer notice:', err?.message);
    }
  }
}

export async function requestDirectorHint(
  code: string,
  player: { uid: string; name: string }
): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const reqData: HintRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromUid: player.uid,
    fromName: player.name,
    timestamp: Date.now()
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    if (!room.hintRequests) room.hintRequests = [];
    room.hintRequests.push(reqData);
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}/hintRequests`);
      await set(roomRef, (room?.hintRequests || [reqData]));
    } catch (err: any) {
      console.warn('Firebase requestDirectorHint notice:', err?.message);
    }
  }
}

export async function sendDirectorHint(
  code: string,
  directorName: string,
  directorUid: string,
  message: string,
  bountyPoints: number = 50
): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const hintData: DirectorHint = {
    id: `hint-${Date.now()}`,
    fromName: directorName,
    message,
    timestamp: Date.now()
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    if (!room.directorHints) room.directorHints = [];
    room.directorHints.push(hintData);
    room.hintRequests = []; // Clear pending requests
    if (room.players[directorUid]) {
      room.players[directorUid].score = (room.players[directorUid].score || 0) + bountyPoints;
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await set(ref(db, `rooms/${roomCode}/directorHints`), room?.directorHints || [hintData]);
      await set(ref(db, `rooms/${roomCode}/hintRequests`), []);
      if (room?.players[directorUid]) {
        await update(ref(db, `rooms/${roomCode}/players/${directorUid}`), {
          score: room.players[directorUid].score
        });
      }
    } catch (err: any) {
      console.warn('Firebase sendDirectorHint notice:', err?.message);
    }
  }
}

export async function awardCreatorHintBounty(
  code: string,
  creatorUid: string,
  bountyPoints: number = 50
): Promise<void> {
  const roomCode = code.toUpperCase().trim();

  const room = localFallback.getRoom(roomCode);
  if (room && room.players[creatorUid]) {
    room.players[creatorUid].score = (room.players[creatorUid].score || 0) + bountyPoints;
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      if (room && room.players[creatorUid]) {
        await update(ref(db, `rooms/${roomCode}/players/${creatorUid}`), {
          score: room.players[creatorUid].score
        });
      }
    } catch (err: any) {
      console.warn('Firebase awardCreatorHintBounty notice:', err?.message);
    }
  }
}

export async function submitCellAnswer(
  code: string,
  uid: string,
  category: string,
  answer: CellAnswer,
  newScore: number
): Promise<void> {
  const roomCode = code.toUpperCase().trim();

  const room = localFallback.getRoom(roomCode);
  if (room) {
    if (!room.answers) room.answers = {};
    if (!room.answers[uid]) room.answers[uid] = {};
    room.answers[uid][category] = answer;
    if (room.players[uid]) {
      room.players[uid].score = newScore;
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/answers/${uid}/${category}`), answer);
      await update(ref(db, `rooms/${roomCode}/players/${uid}`), { score: newScore });
    } catch (err: any) {
      console.warn('Firebase submitCellAnswer notice:', err?.message);
    }
  }
}

export async function voteNextRound(code: string, uid: string): Promise<boolean> {
  const roomCode = code.toUpperCase().trim();
  const room = localFallback.getRoom(roomCode);
  if (!room) return false;

  if (!room.nextRoundVotes) room.nextRoundVotes = {};
  room.nextRoundVotes[uid] = true;
  localFallback.setRoom(roomCode, room);

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/nextRoundVotes`), { [uid]: true });
    } catch (err: any) {
      console.warn('Firebase voteNextRound notice:', err?.message);
    }
  }

  // Check if ALL connected players in the room have voted Next
  const activePlayers = Object.keys(room.players || {});
  const votedCount = activePlayers.filter(k => room.nextRoundVotes?.[k]).length;

  if (votedCount >= activePlayers.length && activePlayers.length > 0) {
    const nextIdx = (room.currentPuzzleIndex || 0) + 1;
    await advanceRound(roomCode, nextIdx, false);
    return true;
  }

  return false;
}

export async function advanceRound(code: string, nextIndex: number, isFinished: boolean, nextCreatorUid?: string): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const updates: any = {
    currentPuzzleIndex: nextIndex,
    roundStartTime: Date.now(),
    status: isFinished ? ('finished' as const) : ('in-progress' as const),
    sharedAnswers: {},
    answers: {},
    nextRoundVotes: {}
  };

  if (nextCreatorUid) {
    updates.currentCreatorUid = nextCreatorUid;
  }

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    room.sharedAnswers = {};
    room.answers = {};
    room.nextRoundVotes = {};
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}`), updates);
      await set(ref(db, `rooms/${roomCode}/sharedAnswers`), {});
      await set(ref(db, `rooms/${roomCode}/answers`), {});
      await set(ref(db, `rooms/${roomCode}/nextRoundVotes`), {});
    } catch (err: any) {
      console.warn('Firebase advanceRound notice:', err?.message);
    }
  }
}

export async function fetchRemoteCustomPuzzles(): Promise<Puzzle[]> {
  if (hasValidFirebaseConfig && db) {
    try {
      const snapshot = await get(ref(db, 'customPuzzles'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data) as Puzzle[];
      }
    } catch (e) {
      console.warn('Could not fetch remote custom puzzles:', e);
    }
  }
  return [];
}

export async function saveCustomPuzzleToCloud(puzzle: Puzzle): Promise<void> {
  if (hasValidFirebaseConfig && db) {
    try {
      await set(ref(db, `customPuzzles/${puzzle.id}`), puzzle);
    } catch (e) {
      console.warn('Could not save custom puzzle to cloud:', e);
    }
  }
}

// ==========================================
// USER STATS & PROFILES (FIRESTORE / LOCAL)
// ==========================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (hasValidFirebaseConfig && firestore) {
    try {
      const docRef = doc(firestore, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching firestore profile:', e);
    }
  }

  const raw = localStorage.getItem(`kollywood_user_${uid}`);
  return raw ? JSON.parse(raw) : null;
}

export async function updateUserStats(
  uid: string,
  displayName: string,
  scoreEarned: number,
  isWin: boolean,
  streak: number
): Promise<void> {
  let existing = await getUserProfile(uid);
  if (!existing) {
    existing = {
      uid,
      displayName,
      totalGamesPlayed: 0,
      totalScore: 0,
      bestStreak: 0,
      soloHighScore: 0,
      wins: 0
    };
  }

  const updated: UserProfile = {
    ...existing,
    displayName: displayName || existing.displayName,
    totalGamesPlayed: existing.totalGamesPlayed + 1,
    totalScore: existing.totalScore + scoreEarned,
    bestStreak: Math.max(existing.bestStreak, streak),
    wins: isWin ? existing.wins + 1 : existing.wins
  };

  localStorage.setItem(`kollywood_user_${uid}`, JSON.stringify(updated));

  if (hasValidFirebaseConfig && firestore) {
    try {
      await setDoc(doc(firestore, 'users', uid), updated, { merge: true });
    } catch (e) {
      console.warn('Error updating firestore stats:', e);
    }
  }
}
