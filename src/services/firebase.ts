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
import { Room, UserProfile, Player, CellAnswer, SharedCellAnswer, GameSettings, Puzzle, DirectorHint, HintRequest, GameHistoryItem, RoomMessage } from '../types/game';
import puzzlesData from '../data/puzzles.json';
import { getSelectedPuzzles } from '../utils/puzzleSelector';
import { addPuzzleIfNotExists } from './puzzleManager';

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
  } catch { }
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch { }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
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
  private memoryStore: Map<string, string> = new Map();

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

  private getItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return this.memoryStore.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    this.memoryStore.set(key, value);
  }

  getRoom(code: string): Room | null {
    const raw = this.getItem(`kollywood_room_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  }

  setRoom(code: string, room: Room): void {
    const key = code.toUpperCase();
    this.setItem(`kollywood_room_${key}`, JSON.stringify(room));
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

  emitKey(key: string, data: any): void {
    if (this.channel) {
      this.channel.postMessage({ key, data });
    }
    if (this.listeners.has(key)) {
      this.listeners.get(key)!.forEach(cb => cb(data));
    }
  }

  subscribeKey(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
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

function cleanForFirebase<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  return JSON.parse(JSON.stringify(data, (_, value) => {
    return value === undefined ? null : value;
  }));
}

export function subscribeToRoom(code: string, callback: (room: Room | null) => void): () => void {
  const roomCode = code.toUpperCase().trim();

  // Helper to normalize room arrays and objects
  const normalizeRoom = (r: Room | null): Room | null => {
    if (!r) return null;
    return {
      ...r,
      customPuzzle: r.customPuzzle ? {
        ...r.customPuzzle,
        movie: {
          name: r.customPuzzle.movie?.name || 'Unknown Movie',
          displayName: r.customPuzzle.movie?.displayName || r.customPuzzle.movie?.name || 'Unknown Movie',
          firstLetter: r.customPuzzle.movie?.firstLetter || (r.customPuzzle.movie?.name ? r.customPuzzle.movie.name.charAt(0).toUpperCase() : '?'),
          imageUrl: r.customPuzzle.movie?.imageUrl || '',
          aliases: Array.isArray(r.customPuzzle.movie?.aliases) ? r.customPuzzle.movie.aliases : [r.customPuzzle.movie?.name || ''].filter(Boolean)
        },
        hero: {
          name: r.customPuzzle.hero?.name || 'Hero',
          displayName: r.customPuzzle.hero?.displayName || r.customPuzzle.hero?.name || 'Hero',
          firstLetter: r.customPuzzle.hero?.firstLetter || (r.customPuzzle.hero?.name ? r.customPuzzle.hero.name.charAt(0).toUpperCase() : '?'),
          imageUrl: r.customPuzzle.hero?.imageUrl || '',
          aliases: Array.isArray(r.customPuzzle.hero?.aliases) ? r.customPuzzle.hero.aliases : [r.customPuzzle.hero?.name || ''].filter(Boolean)
        },
        heroine: {
          name: r.customPuzzle.heroine?.name || 'Heroine',
          displayName: r.customPuzzle.heroine?.displayName || r.customPuzzle.heroine?.name || 'Heroine',
          firstLetter: r.customPuzzle.heroine?.firstLetter || (r.customPuzzle.heroine?.name ? r.customPuzzle.heroine.name.charAt(0).toUpperCase() : '?'),
          imageUrl: r.customPuzzle.heroine?.imageUrl || '',
          aliases: Array.isArray(r.customPuzzle.heroine?.aliases) ? r.customPuzzle.heroine.aliases : [r.customPuzzle.heroine?.name || ''].filter(Boolean)
        },
        song: {
          name: r.customPuzzle.song?.name || 'Song',
          displayName: r.customPuzzle.song?.displayName || r.customPuzzle.song?.name || 'Song',
          firstLetter: r.customPuzzle.song?.firstLetter || (r.customPuzzle.song?.name ? r.customPuzzle.song.name.charAt(0).toUpperCase() : '?'),
          youtubeId: r.customPuzzle.song?.youtubeId || '',
          aliases: Array.isArray(r.customPuzzle.song?.aliases) ? r.customPuzzle.song.aliases : [r.customPuzzle.song?.name || ''].filter(Boolean)
        }
      } : undefined,
      directorHints: Array.isArray(r.directorHints)
        ? r.directorHints
        : (r.directorHints && typeof r.directorHints === 'object' ? (Object.values(r.directorHints) as DirectorHint[]) : []),
      hintRequests: Array.isArray(r.hintRequests)
        ? r.hintRequests
        : (r.hintRequests && typeof r.hintRequests === 'object' ? (Object.values(r.hintRequests) as HintRequest[]) : []),
      messages: Array.isArray(r.messages)
        ? r.messages
        : (r.messages && typeof r.messages === 'object' ? (Object.values(r.messages) as RoomMessage[]) : []),
      players: r.players || {},
      sharedAnswers: r.sharedAnswers || {},
      answers: r.answers || {},
      nextRoundVotes: r.nextRoundVotes || {}
    };
  };

  // Local fallback subscription (always active)
  const unsubscribeLocal = localFallback.subscribeRoom(roomCode, (localRoom) => {
    if (localRoom) callback(normalizeRoom(localRoom));
  });

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const unsubscribe = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const firebaseRoom = normalizeRoom(snapshot.val() as Room);
            if (firebaseRoom) {
              localFallback.setRoom(roomCode, firebaseRoom);
              callback(firebaseRoom);
            }
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

export async function updateRoomSettings(code: string, newSettings: Partial<GameSettings>): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const room = localFallback.getRoom(roomCode);
  if (room) {
    room.settings = { ...room.settings, ...newSettings };
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}/settings`), newSettings);
    } catch (err: any) {
      console.warn('Firebase updateRoomSettings notice:', err?.message);
    }
  }
}

export async function sendRoomMessage(
  code: string,
  message: {
    senderUid: string;
    senderName: string;
    senderAvatar?: string;
    text: string;
    isQuickReaction?: boolean;
  }
): Promise<void> {
  const roomCode = code.toUpperCase().trim();
  const msgObj: RoomMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    ...message,
    timestamp: Date.now()
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    if (!room.messages) room.messages = [];
    room.messages = [...room.messages.slice(-49), msgObj];
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val() as Room;
        const currentMsgs = Array.isArray(currentData.messages)
          ? currentData.messages
          : (currentData.messages && typeof currentData.messages === 'object' ? Object.values(currentData.messages) : []);
        const updatedMsgs = [...currentMsgs.slice(-49), msgObj];
        await update(roomRef, { messages: updatedMsgs });
      }
    } catch (err: any) {
      console.warn('Firebase sendRoomMessage notice:', err?.message);
    }
  }
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
  
  let leavingPlayerName = 'A contestant';
  let previousCount = 0;
  let remainingCount = 0;
  let isHostLeaving = false;

  const room = localFallback.getRoom(roomCode);
  if (room && room.players) {
    leavingPlayerName = room.players[uid]?.name || 'A contestant';
    previousCount = Object.keys(room.players).length;
    isHostLeaving = room.hostUid === uid;

    delete room.players[uid];
    if (room.nextRoundVotes && room.nextRoundVotes[uid]) {
      delete room.nextRoundVotes[uid];
    }
    remainingCount = Object.keys(room.players).length;

    room.lastLeftPlayer = {
      uid,
      name: leavingPlayerName,
      timestamp: Date.now()
    };

    // If 2-player game and 1 exits, or if host leaves, or no players left -> finish room
    if (previousCount <= 2 || remainingCount <= 1 || isHostLeaving) {
      room.status = 'finished';
      room.closedReason = isHostLeaving ? 'host-left' : 'player-left';
    }

    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await remove(ref(db, `rooms/${roomCode}/players/${uid}`));
      await remove(ref(db, `rooms/${roomCode}/nextRoundVotes/${uid}`));

      const updates: any = {
        lastLeftPlayer: {
          uid,
          name: leavingPlayerName,
          timestamp: Date.now()
        }
      };

      if (previousCount <= 2 || remainingCount <= 1 || isHostLeaving) {
        updates.status = 'finished';
        updates.closedReason = isHostLeaving ? 'host-left' : 'player-left';
      }

      await update(ref(db, `rooms/${roomCode}`), updates);
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
  const cleanPuzzle = cleanForFirebase(puzzle);
  
  // Persist to local & global database if not exists
  addPuzzleIfNotExists(cleanPuzzle);

  const updates: any = {
    customPuzzle: cleanPuzzle,
    currentCreatorUid: puzzle.creatorUid || null,
    status: 'in-progress' as const,
    roundStartTime: Date.now(),
    sharedAnswers: {},
    answers: {},
    nextRoundVotes: {},
    directorHints: [],
    hintRequests: []
  };

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    room.customPuzzle = cleanPuzzle;
    room.currentCreatorUid = puzzle.creatorUid || undefined;
    room.sharedAnswers = {};
    room.answers = {};
    room.nextRoundVotes = {};
    room.directorHints = [];
    room.hintRequests = [];
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      // Store into shared /customPuzzles node so all players get it
      await set(ref(db, `customPuzzles/${cleanPuzzle.id}`), cleanPuzzle);
      await update(ref(db, `rooms/${roomCode}`), cleanForFirebase(updates));
      await set(ref(db, `rooms/${roomCode}/sharedAnswers`), {});
      await set(ref(db, `rooms/${roomCode}/answers`), {});
      await set(ref(db, `rooms/${roomCode}/nextRoundVotes`), {});
      await set(ref(db, `rooms/${roomCode}/directorHints`), []);
      await set(ref(db, `rooms/${roomCode}/hintRequests`), []);
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

  let updatedScore = 0;
  let allRequests: HintRequest[] = [reqData];

  const room = localFallback.getRoom(roomCode);
  if (room) {
    const existing: HintRequest[] = Array.isArray(room.hintRequests)
      ? room.hintRequests
      : (room.hintRequests && typeof room.hintRequests === 'object' ? (Object.values(room.hintRequests) as HintRequest[]) : []);
    allRequests = [...existing, reqData];
    room.hintRequests = allRequests;

    if (room.players && room.players[player.uid]) {
      const currentScore = room.players[player.uid].score || 0;
      // Deduct 25 points, never going below zero
      updatedScore = Math.max(0, currentScore - 25);
      room.players[player.uid].score = updatedScore;
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      const roomRef = ref(db, `rooms/${roomCode}/hintRequests`);
      await set(roomRef, allRequests);
      if (room?.players && room.players[player.uid]) {
        await update(ref(db, `rooms/${roomCode}/players/${player.uid}`), {
          score: updatedScore
        });
      }
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

  let allHints: DirectorHint[] = [hintData];
  let directorNewScore = bountyPoints;

  const room = localFallback.getRoom(roomCode);
  if (room) {
    const existing: DirectorHint[] = Array.isArray(room.directorHints)
      ? room.directorHints
      : (room.directorHints && typeof room.directorHints === 'object' ? (Object.values(room.directorHints) as DirectorHint[]) : []);
    allHints = [...existing, hintData];
    room.directorHints = allHints;
    room.hintRequests = []; // Clear pending requests
    if (room.players[directorUid]) {
      directorNewScore = (room.players[directorUid].score || 0) + bountyPoints;
      room.players[directorUid].score = directorNewScore;
    }
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await set(ref(db, `rooms/${roomCode}/directorHints`), allHints);
      await set(ref(db, `rooms/${roomCode}/hintRequests`), []);
      if (room?.players[directorUid]) {
        await update(ref(db, `rooms/${roomCode}/players/${directorUid}`), {
          score: directorNewScore
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
    nextRoundVotes: {},
    directorHints: [],
    hintRequests: [],
    customPuzzle: null
  };

  if (nextCreatorUid) {
    updates.currentCreatorUid = nextCreatorUid;
  } else {
    updates.currentCreatorUid = null;
  }

  const room = localFallback.getRoom(roomCode);
  if (room) {
    Object.assign(room, updates);
    delete (room as any).customPuzzle;
    delete (room as any).currentCreatorUid;
    room.sharedAnswers = {};
    room.answers = {};
    room.nextRoundVotes = {};
    room.directorHints = [];
    room.hintRequests = [];
    localFallback.setRoom(roomCode, room);
  }

  if (hasValidFirebaseConfig && db) {
    try {
      await update(ref(db, `rooms/${roomCode}`), updates);
      await set(ref(db, `rooms/${roomCode}/sharedAnswers`), {});
      await set(ref(db, `rooms/${roomCode}/answers`), {});
      await set(ref(db, `rooms/${roomCode}/nextRoundVotes`), {});
      await set(ref(db, `rooms/${roomCode}/directorHints`), []);
      await set(ref(db, `rooms/${roomCode}/hintRequests`), []);
      await remove(ref(db, `rooms/${roomCode}/customPuzzle`));
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

export async function deleteCustomPuzzleFromCloud(id: string): Promise<void> {
  if (hasValidFirebaseConfig && db) {
    try {
      await remove(ref(db, `customPuzzles/${id}`));
    } catch (e) {
      console.warn('Could not delete custom puzzle from cloud:', e);
    }
  }
}

/**
 * Subscribes to real-time custom puzzles updates from Firebase Realtime Database.
 * When the admin adds, edits, or deletes any movie, this fires immediately for all users.
 */
export function subscribeToRemoteCustomPuzzles(callback: (puzzles: Puzzle[]) => void): () => void {
  if (hasValidFirebaseConfig && db) {
    const customRef = ref(db, 'customPuzzles');
    const callbackWrapper = (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data) as Puzzle[];
        callback(list);
      } else {
        callback([]);
      }
    };
    onValue(customRef, callbackWrapper);

    return () => {
      off(customRef, 'value', callbackWrapper);
    };
  }

  // Multi-tab local fallback
  return localFallback.subscribeKey('custom_puzzles_sync', (data) => {
    if (Array.isArray(data)) {
      callback(data);
    }
  });
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
  streak: number,
  historyData?: {
    mode: 'solo' | 'multiplayer';
    roundsPlayed: number;
    movieNames?: string[];
    rank?: number;
    totalPlayers?: number;
    roomCode?: string;
  }
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
      wins: 0,
      gameHistory: []
    };
  }

  const existingHistory = Array.isArray(existing.gameHistory) ? existing.gameHistory : [];
  
  let newHistory = existingHistory;
  if (historyData) {
    const historyItem: GameHistoryItem = {
      id: `gh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      mode: historyData.mode,
      score: scoreEarned,
      streak: streak,
      roundsPlayed: historyData.roundsPlayed || 1,
      movieNames: historyData.movieNames || [],
      isWinner: isWin,
      rank: historyData.rank,
      totalPlayers: historyData.totalPlayers,
      roomCode: historyData.roomCode
    };
    // Keep latest 50 match history entries
    newHistory = [historyItem, ...existingHistory].slice(0, 50);
  }

  const updated: UserProfile = {
    ...existing,
    displayName: displayName || existing.displayName,
    totalGamesPlayed: existing.totalGamesPlayed + 1,
    totalScore: existing.totalScore + scoreEarned,
    bestStreak: Math.max(existing.bestStreak, streak),
    wins: isWin ? existing.wins + 1 : existing.wins,
    gameHistory: newHistory
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

export async function clearUserHistory(uid: string): Promise<void> {
  let existing = await getUserProfile(uid);
  if (!existing) return;

  const updated: UserProfile = {
    ...existing,
    gameHistory: []
  };

  localStorage.setItem(`kollywood_user_${uid}`, JSON.stringify(updated));

  if (hasValidFirebaseConfig && firestore) {
    try {
      await setDoc(doc(firestore, 'users', uid), updated, { merge: true });
    } catch (e) {
      console.warn('Error clearing history in firestore:', e);
    }
  }
}
