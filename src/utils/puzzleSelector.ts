import { Puzzle } from '../types/game';
import { getAllPuzzles } from '../services/puzzleManager';

/**
 * Selects a balanced randomized sequence of Kollywood movie puzzles.
 * When difficulty is 'all', it intelligently mixes Easy, Medium, and Hard films.
 */
export function getSelectedPuzzles(count: number, difficulty: 'all' | 'easy' | 'medium' | 'hard' = 'all'): Puzzle[] {
  const allPuzzles = getAllPuzzles();

  if (difficulty !== 'all') {
    const pool = allPuzzles.filter(p => p.difficulty === difficulty);
    const available = pool.length >= count ? pool : allPuzzles;
    return [...available].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Mixed mode: Randomly balance across Easy, Medium, and Hard
  const easyPool = allPuzzles.filter(p => p.difficulty === 'easy').sort(() => 0.5 - Math.random());
  const mediumPool = allPuzzles.filter(p => p.difficulty === 'medium').sort(() => 0.5 - Math.random());
  const hardPool = allPuzzles.filter(p => p.difficulty === 'hard').sort(() => 0.5 - Math.random());

  const selected: Puzzle[] = [];
  const usedIds = new Set<string>();

  const hardTarget = Math.max(1, Math.floor(count * 0.25));
  const mediumTarget = Math.max(1, Math.floor(count * 0.45));
  const easyTarget = Math.max(1, count - hardTarget - mediumTarget);

  const takeFromPool = (pool: Puzzle[], target: number) => {
    let taken = 0;
    for (const p of pool) {
      if (taken >= target) break;
      if (!usedIds.has(p.id)) {
        selected.push(p);
        usedIds.add(p.id);
        taken++;
      }
    }
  };

  takeFromPool(easyPool, easyTarget);
  takeFromPool(mediumPool, mediumTarget);
  takeFromPool(hardPool, hardTarget);

  if (selected.length < count) {
    const remaining = allPuzzles.filter(p => !usedIds.has(p.id)).sort(() => 0.5 - Math.random());
    for (const p of remaining) {
      if (selected.length >= count) break;
      selected.push(p);
      usedIds.add(p.id);
    }
  }

  return selected.sort(() => 0.5 - Math.random()).slice(0, count);
}
