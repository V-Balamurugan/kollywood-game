export type CellCategory = 'hero' | 'heroine' | 'movie' | 'song';

export interface PuzzleEntity {
  name: string;
  imageUrl?: string;
  youtubeId?: string;
  firstLetter: string;
  aliases?: string[];
}

export interface Puzzle {
  id: string;
  movie: PuzzleEntity;
  hero: PuzzleEntity;
  heroine: PuzzleEntity;
  song: PuzzleEntity;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number;
  director?: string;
  musicDirector?: string;
  genre?: string;
  trivia?: string;
  createdBy?: string;
  creatorUid?: string;
}

export interface CellAnswer {
  guess: string;
  correct: boolean;
  timeMs: number;
  hintsUsed: number;
  revealedAt?: number;
}

export interface SharedCellAnswer extends CellAnswer {
  solvedByUid: string;
  solvedByName: string;
  solvedByAvatar?: string;
}

export interface Player {
  uid: string;
  name: string;
  avatar?: string;
  score: number;
  ready: boolean;
  isHost?: boolean;
  connected?: boolean;
  lastActive?: number;
}

export interface GameSettings {
  roundTimeSeconds: number;
  totalRounds?: number;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  gameMode: 'shared-first-solve' | 'individual-race';
  allowPlayerCustomPuzzles: boolean;
}

export interface DirectorHint {
  id: string;
  fromName: string;
  message: string;
  timestamp: number;
}

export interface HintRequest {
  id: string;
  fromUid: string;
  fromName: string;
  timestamp: number;
}

export interface Room {
  code: string;
  hostUid: string;
  status: 'lobby' | 'creating-puzzle' | 'in-progress' | 'round-summary' | 'finished';
  players: Record<string, Player>;
  currentPuzzleIndex: number;
  puzzleIds: string[];
  currentCreatorUid?: string;
  customPuzzle?: Puzzle;
  // Shared real-time answers (category -> SharedCellAnswer)
  sharedAnswers?: Record<string, SharedCellAnswer>;
  // Individual answers for race mode
  answers: Record<string, Record<string, CellAnswer>>;
  // Director Live Hints & Contestant Requests
  directorHints?: DirectorHint[];
  hintRequests?: HintRequest[];
  // Synchronized round transition votes (uid -> boolean)
  nextRoundVotes?: Record<string, boolean>;
  lastLeftPlayer?: { uid: string; name: string; timestamp: number };
  closedReason?: 'player-left' | 'host-left' | 'finished';
  createdAt: number;
  roundStartTime?: number;
  settings: GameSettings;
}

export interface GameHistoryItem {
  id: string;
  timestamp: number;
  mode: 'solo' | 'multiplayer';
  score: number;
  streak: number;
  roundsPlayed: number;
  movieNames?: string[];
  isWinner?: boolean;
  rank?: number;
  totalPlayers?: number;
  roomCode?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  totalGamesPlayed: number;
  totalScore: number;
  bestStreak: number;
  soloHighScore: number;
  wins: number;
  isGuest?: boolean;
  gameHistory?: GameHistoryItem[];
}

export interface RoundResult {
  puzzle: Puzzle;
  playerAnswers: Record<string, Record<string, CellAnswer>>;
  playerScores: Record<string, number>;
  timeTakenSeconds: number;
}
