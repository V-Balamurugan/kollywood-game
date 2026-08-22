import React, { useState, useEffect, useRef } from 'react';
import { ScoreHUD } from '../components/ScoreHUD';
import { GameBoard } from '../components/GameBoard';
import { GameResultModal } from '../components/GameResultModal';
import { CellCategory, Puzzle, CellAnswer, GameSettings } from '../types/game';
import { updateUserStats } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getSelectedPuzzles } from '../utils/puzzleSelector';
import { getAllPuzzles, syncGlobalCustomPuzzles } from '../services/puzzleManager';
import { ArrowLeft, Play, Sparkles, Sliders } from 'lucide-react';

interface SoloGameProps {
  onExit: () => void;
  initialPuzzle?: Puzzle;
}

export const SoloGame: React.FC<SoloGameProps> = ({ onExit, initialPuzzle }) => {
  const { user } = useAuth();

  // Game Setup State
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    roundTimeSeconds: 60,
    difficulty: 'all',
    gameMode: 'individual-race',
    allowPlayerCustomPuzzles: false
  });

  // Active Session State
  const [roundPuzzles, setRoundPuzzles] = useState<Puzzle[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState<Record<string, CellAnswer>>({});
  const [isRoundEnded, setIsRoundEnded] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync latest community-created movies so they appear in Solo Game
  useEffect(() => {
    syncGlobalCustomPuzzles();
  }, []);

  // If an initial custom puzzle is passed (e.g. from Custom Match creator), auto-launch Solo Game!
  useEffect(() => {
    if (initialPuzzle) {
      startWithCustomPuzzle(initialPuzzle);
    }
  }, [initialPuzzle]);

  const startWithCustomPuzzle = (customPuz: Puzzle) => {
    const allAvailable = getAllPuzzles();
    const shuffledRemaining = getSelectedPuzzles(Math.max(20, allAvailable.length), settings.difficulty)
      .filter((p) => p.id !== customPuz.id);

    setRoundPuzzles([customPuz, ...shuffledRemaining]);
    setCurrentRoundIndex(0);
    setScore(0);
    setStreak(0);
    setAnswers({});
    setTimeLeft(settings.roundTimeSeconds);
    setIsRoundEnded(false);
    setIsGameFinished(false);
    setIsPlaying(true);
  };

  // Initialize Game Session with infinite/continuous stream of movies
  const startGame = () => {
    const allAvailable = getAllPuzzles();
    const shuffled = getSelectedPuzzles(Math.max(20, allAvailable.length), settings.difficulty);

    setRoundPuzzles(shuffled);
    setCurrentRoundIndex(0);
    setScore(0);
    setStreak(0);
    setAnswers({});
    setTimeLeft(settings.roundTimeSeconds);
    setIsRoundEnded(false);
    setIsGameFinished(false);
    setIsPlaying(true);
  };

  // Timer Countdown (Skipped if roundTimeSeconds === 0)
  useEffect(() => {
    if (!isPlaying || isRoundEnded || isGameFinished || settings.roundTimeSeconds === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isRoundEnded, isGameFinished, currentRoundIndex, settings.roundTimeSeconds]);

  // Check if all 4 cells solved
  useEffect(() => {
    if (!isPlaying || isRoundEnded || isGameFinished) return;
    const solvedCount = Object.values(answers).filter((a) => a.correct).length;
    if (solvedCount === 4) {
      handleAllSolved();
    }
  }, [answers, isPlaying, isRoundEnded, isGameFinished]);

  const handleAllSolved = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const speedBonus = settings.roundTimeSeconds > 0 ? Math.floor((timeLeft / settings.roundTimeSeconds) * 150) : 0;
    const streakBonus = streak * 50;
    const roundPoints = 1000 + speedBonus + streakBonus;

    setScore((prev) => prev + roundPoints);
    setStreak((prev) => prev + 1);
    setIsRoundEnded(true);
  };

  const handleRoundTimeout = () => {
    const solvedCount = Object.values(answers).filter((a) => a.correct).length;
    if (solvedCount < 4) {
      setStreak(0); // Reset streak on timeout
    }
    setIsRoundEnded(true);
  };

  const handleCellSolved = (category: CellCategory, answer: CellAnswer) => {
    setAnswers((prev) => ({ ...prev, [category]: answer }));
    const points = Math.max(50, 250 - answer.hintsUsed * 50);
    setScore((prev) => prev + points);
  };

  const handleNextRound = () => {
    const nextIdx = currentRoundIndex + 1;
    if (nextIdx >= roundPuzzles.length) {
      // Refresh with more shuffled movies
      const allAvailable = getAllPuzzles();
      const more = getSelectedPuzzles(Math.max(20, allAvailable.length), settings.difficulty);
      setRoundPuzzles((prev) => [...prev, ...more]);
    }
    setCurrentRoundIndex(nextIdx);
    setAnswers({});
    setTimeLeft(settings.roundTimeSeconds);
    setIsRoundEnded(false);
  };

  const handleStopGame = () => {
    setIsGameFinished(true);
    if (user && score > 0) {
      const movieNames = roundPuzzles
        .slice(0, currentRoundIndex + 1)
        .map((p) => p?.movie?.name)
        .filter(Boolean) as string[];
      updateUserStats(user.uid, user.displayName || 'Player', score, true, streak, {
        mode: 'solo',
        roundsPlayed: currentRoundIndex + 1,
        movieNames
      });
    }
  };

  const handleExitGame = () => {
    if (isPlaying && user && score > 0 && !isGameFinished) {
      const movieNames = roundPuzzles
        .slice(0, currentRoundIndex + 1)
        .map((p) => p?.movie?.name)
        .filter(Boolean) as string[];
      updateUserStats(user.uid, user.displayName || 'Player', score, true, streak, {
        mode: 'solo',
        roundsPlayed: currentRoundIndex + 1,
        movieNames
      });
    }
    onExit();
  };

  const currentPuzzle = roundPuzzles[currentRoundIndex] || roundPuzzles[0];

  // If not in game, render Settings & Start Screen
  if (!isPlaying || !currentPuzzle) {
    return (
      <div className="max-w-xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-white mb-4 sm:mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Arena</span>
        </button>

        <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cinema-border/60">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/10">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-display font-black text-white">Solo Cinema Challenge</h2>
              <p className="text-[11px] sm:text-xs text-cinema-muted">Play an endless stream of Tamil blockbusters</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Time per Round */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
                ⏱️ Round Timer
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { sec: 0, label: '♾️ Chill' },
                  { sec: 30, label: '30s' },
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '60s' },
                  { sec: 90, label: '90s' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, roundTimeSeconds: opt.sec }))}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${
                      settings.roundTimeSeconds === opt.sec
                        ? 'btn-cinema-primary text-black border-amber-400'
                        : 'bg-cinema-surface text-slate-300 border-cinema-border/70 hover:text-white hover:border-brand-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
                🎬 Difficulty Pool
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'all', label: '🎲 All Era' },
                    { id: 'easy', label: '⚡ Easy' },
                    { id: 'medium', label: '🔥 Medium' },
                    { id: 'hard', label: '💀 Hard' }
                  ] as const
                ).map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, difficulty: diff.id }))}
                    className={`py-2.5 rounded-xl text-xs font-black border tracking-wider transition-all active:scale-95 ${
                      settings.difficulty === diff.id
                        ? 'btn-cinema-primary text-black border-amber-400'
                        : 'bg-cinema-surface text-slate-300 border-cinema-border/70 hover:text-white hover:border-brand-500/40'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl btn-cinema-primary text-black font-black text-sm shadow-xl flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all tracking-wider"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>START CINEMA CHALLENGE 🎬</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      {/* Top HUD */}
      <ScoreHUD
        score={score}
        streak={streak}
        currentRound={currentRoundIndex + 1}
        timeLeft={timeLeft}
        maxTime={settings.roundTimeSeconds}
        difficulty={currentPuzzle.difficulty}
        year={currentPuzzle.year}
      />

      {/* 2x2 Board */}
      <GameBoard
        puzzle={currentPuzzle}
        answers={answers}
        onCellSolved={handleCellSolved}
        disabled={isRoundEnded || isGameFinished}
        revealAll={isRoundEnded}
      />

      {/* Round / Game Over Modal with Stop or Continue */}
      {(isRoundEnded || isGameFinished) && (
        <GameResultModal
          isFinal={isGameFinished}
          roundNumber={currentRoundIndex + 1}
          puzzle={currentPuzzle}
          userAnswers={answers}
          onNextRound={handleNextRound}
          onStopGame={handleStopGame}
          onPlayAgain={startGame}
          onExit={handleExitGame}
        />
      )}
    </div>
  );
};
