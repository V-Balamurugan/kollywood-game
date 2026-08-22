import { Puzzle } from '../types/game';
import defaultPuzzles from '../data/puzzles.json';
import { fetchRemoteCustomPuzzles, saveCustomPuzzleToCloud, deleteCustomPuzzleFromCloud } from './firebase';

const STORAGE_KEY = 'kollywood_custom_puzzles';

export function getAllPuzzles(): Puzzle[] {
  if (typeof window === 'undefined') return defaultPuzzles as Puzzle[];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultPuzzles as Puzzle[];
  try {
    const customList = JSON.parse(stored) as Puzzle[];
    if (customList.length === 0) return defaultPuzzles as Puzzle[];

    // Merge default puzzles with custom/edited puzzles so defaults are never lost
    const mergedMap = new Map<string, Puzzle>();
    for (const dp of defaultPuzzles as Puzzle[]) {
      mergedMap.set(dp.id, dp);
    }
    for (const cp of customList) {
      mergedMap.set(cp.id, cp);
    }
    return Array.from(mergedMap.values());
  } catch {
    return defaultPuzzles as Puzzle[];
  }
}

export function saveAllPuzzles(puzzles: Puzzle[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
}

/**
 * Adds or updates a movie puzzle in both local storage and cloud database.
 */
export function addOrUpdatePuzzle(puzzle: Puzzle): Puzzle[] {
  const current = getAllPuzzles();
  const index = current.findIndex(
    p => p.id === puzzle.id || p.movie.name.toLowerCase().trim() === puzzle.movie.name.toLowerCase().trim()
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
  }
  return defaultPuzzles as Puzzle[];
}

/**
 * Synchronizes community-created custom movies from Firebase Cloud into the local database.
 * This makes every custom movie created in multiplayer or admin instantly available!
 */
export async function syncGlobalCustomPuzzles(): Promise<Puzzle[]> {
  try {
    const remotePuzzles = await fetchRemoteCustomPuzzles();
    if (remotePuzzles && remotePuzzles.length > 0) {
      let current = getAllPuzzles();
      const currentMap = new Map<string, Puzzle>();
      for (const p of current) {
        currentMap.set(p.id, p);
      }

      let changed = false;
      for (const remote of remotePuzzles) {
        if (!currentMap.has(remote.id)) {
          currentMap.set(remote.id, remote);
          changed = true;
        }
      }

      if (changed) {
        const merged = Array.from(currentMap.values());
        saveAllPuzzles(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Could not sync global custom puzzles:', e);
  }
  return getAllPuzzles();
}
