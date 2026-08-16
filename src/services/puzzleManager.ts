import { Puzzle } from '../types/game';
import defaultPuzzles from '../data/puzzles.json';
import { fetchRemoteCustomPuzzles, saveCustomPuzzleToCloud } from './firebase';

const STORAGE_KEY = 'kollywood_custom_puzzles';

export function getAllPuzzles(): Puzzle[] {
  if (typeof window === 'undefined') return defaultPuzzles as Puzzle[];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultPuzzles as Puzzle[];
  try {
    const customList = JSON.parse(stored) as Puzzle[];
    return customList.length > 0 ? customList : (defaultPuzzles as Puzzle[]);
  } catch {
    return defaultPuzzles as Puzzle[];
  }
}

export function saveAllPuzzles(puzzles: Puzzle[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
}

/**
 * Adds a new puzzle to the database only if it doesn't already exist.
 * Matches by normalized movie title.
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
  
  // Also push to Firebase Realtime Database for all players
  saveCustomPuzzleToCloud(puzzle);

  return { added: true, list: updated };
}

export function addPuzzle(puzzle: Puzzle): Puzzle[] {
  return addPuzzleIfNotExists(puzzle).list;
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
  return updated;
}

export function resetPuzzlesToDefault(): Puzzle[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultPuzzles as Puzzle[];
}

/**
 * Synchronizes community-created custom movies from Firebase Cloud into the local database.
 * This makes every custom movie created in multiplayer instantly available for Single Player!
 */
export async function syncGlobalCustomPuzzles(): Promise<Puzzle[]> {
  try {
    const remotePuzzles = await fetchRemoteCustomPuzzles();
    if (remotePuzzles && remotePuzzles.length > 0) {
      let current = getAllPuzzles();
      let changed = false;

      for (const remote of remotePuzzles) {
        const normTitle = remote.movie?.name?.toLowerCase().trim();
        const exists = current.some(
          p => p.id === remote.id || (p.movie?.name && p.movie.name.toLowerCase().trim() === normTitle)
        );
        if (!exists) {
          current = [remote, ...current];
          changed = true;
        }
      }

      if (changed) {
        saveAllPuzzles(current);
      }
      return current;
    }
  } catch (e) {
    console.warn('Could not sync global custom puzzles:', e);
  }
  return getAllPuzzles();
}
