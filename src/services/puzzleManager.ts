import { Puzzle } from '../types/game';
import defaultPuzzles from '../data/puzzles.json';
import {
  fetchRemoteCustomPuzzles,
  saveCustomPuzzleToCloud,
  deleteCustomPuzzleFromCloud,
  subscribeToRemoteCustomPuzzles
} from './firebase';

const STORAGE_KEY = 'kollywood_custom_puzzles';

export function getAllPuzzles(): Puzzle[] {
  if (typeof window === 'undefined') return defaultPuzzles as Puzzle[];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultPuzzles as Puzzle[];
  try {
    const customList = JSON.parse(stored) as Puzzle[];
    if (!Array.isArray(customList) || customList.length === 0) return defaultPuzzles as Puzzle[];

    // Merge default puzzles with custom/edited puzzles so defaults are never lost
    const mergedMap = new Map<string, Puzzle>();
    for (const dp of defaultPuzzles as Puzzle[]) {
      mergedMap.set(dp.id, dp);
    }
    for (const cp of customList) {
      if (cp && cp.id) {
        mergedMap.set(cp.id, cp);
      }
    }
    return Array.from(mergedMap.values());
  } catch {
    return defaultPuzzles as Puzzle[];
  }
}

export function saveAllPuzzles(puzzles: Puzzle[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kollywood_library_updated', { detail: puzzles }));
  }
}

/**
 * Adds or updates a movie puzzle in both local storage and cloud database.
 * Syncs with Firebase so the entire player community sees the updated puzzle.
 */
export function addOrUpdatePuzzle(puzzle: Puzzle): Puzzle[] {
  const current = getAllPuzzles();
  const normalizedTitle = puzzle.movie.name.toLowerCase().trim();
  const index = current.findIndex(
    p => p.id === puzzle.id || p.movie.name.toLowerCase().trim() === normalizedTitle
  );

  let updated: Puzzle[];
  if (index >= 0) {
    updated = current.map((p, i) => i === index ? { ...p, ...puzzle } : p);
  } else {
    updated = [puzzle, ...current];
  }

  saveAllPuzzles(updated);
  saveCustomPuzzleToCloud(puzzle);
  return updated;
}

/**
 * Adds a new puzzle to the database only if it doesn't already exist.
 */
export function addPuzzleIfNotExists(puzzle: Puzzle): { added: boolean; list: Puzzle[] } {
  const current = getAllPuzzles();
  const normalizedTitle = puzzle.movie.name.toLowerCase().trim();
  
  const alreadyExists = current.some(
    p => p.id === puzzle.id || p.movie.name.toLowerCase().trim() === normalizedTitle
  );

  if (alreadyExists) {
    return { added: false, list: current };
  }

  const updated = [puzzle, ...current];
  saveAllPuzzles(updated);
  saveCustomPuzzleToCloud(puzzle);

  return { added: true, list: updated };
}

export function addPuzzle(puzzle: Puzzle): Puzzle[] {
  return addOrUpdatePuzzle(puzzle);
}

export function updatePuzzle(id: string, updatedData: Partial<Puzzle>): Puzzle[] {
  const current = getAllPuzzles();
  const updated = current.map(p => p.id === id ? { ...p, ...updatedData } : p);
  saveAllPuzzles(updated);
  const modified = updated.find(p => p.id === id);
  if (modified) {
    saveCustomPuzzleToCloud(modified);
  }
  return updated;
}

export function deletePuzzle(id: string): Puzzle[] {
  const current = getAllPuzzles();
  const updated = current.filter(p => p.id !== id);
  saveAllPuzzles(updated);
  deleteCustomPuzzleFromCloud(id);
  return updated;
}

export function resetPuzzlesToDefault(): Puzzle[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kollywood_library_updated', { detail: defaultPuzzles }));
  }
  return defaultPuzzles as Puzzle[];
}

/**
 * Merges remote cloud puzzles into the local database.
 * Cloud updates take precedence over local entries for matching IDs,
 * ensuring all admin edits and additions reflect across all users' devices.
 */
export function mergeRemotePuzzles(remotePuzzles: Puzzle[]): Puzzle[] {
  const mergedMap = new Map<string, Puzzle>();

  // 1. Seed with default base catalogue
  for (const dp of defaultPuzzles as Puzzle[]) {
    mergedMap.set(dp.id, dp);
  }

  // 2. Overwrite / insert with cloud remote puzzles (authoritative from Admin)
  if (Array.isArray(remotePuzzles)) {
    for (const rp of remotePuzzles) {
      if (rp && rp.id && rp.movie && rp.movie.name) {
        mergedMap.set(rp.id, rp);
      }
    }
  }

  const merged = Array.from(mergedMap.values());
  saveAllPuzzles(merged);
  return merged;
}

/**
 * Synchronizes community/admin curated custom movies from Firebase Cloud into the local database.
 * This makes every movie created or updated in admin instantly available to all users.
 */
export async function syncGlobalCustomPuzzles(): Promise<Puzzle[]> {
  try {
    const remotePuzzles = await fetchRemoteCustomPuzzles();
    if (remotePuzzles && remotePuzzles.length > 0) {
      return mergeRemotePuzzles(remotePuzzles);
    }
  } catch (e) {
    console.warn('Could not sync global custom puzzles:', e);
  }
  return getAllPuzzles();
}

/**
 * Subscribes to real-time cloud updates for the movie library.
 * Whenever an admin adds, edits, or deletes a movie in the master database,
 * this listener automatically updates all users' libraries in real-time.
 */
export function subscribeGlobalCustomPuzzles(callback?: (puzzles: Puzzle[]) => void): () => void {
  return subscribeToRemoteCustomPuzzles((remotePuzzles) => {
    const updatedList = mergeRemotePuzzles(remotePuzzles);
    if (callback) {
      callback(updatedList);
    }
  });
}

