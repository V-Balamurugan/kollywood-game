import React, { useState, useEffect, useRef } from 'react';
import { ScoreHUD } from '../components/ScoreHUD';
import { GameBoard } from '../components/GameBoard';
import { GameResultModal } from '../components/GameResultModal';
import { CellCategory, Puzzle, CellAnswer, GameSettings } from '../types/game';
import { updateUserStats } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getSelectedPuzzles } from '../utils/puzzleSelector';
import { getAllPuzzles, syncGlobalCustomPuzzles } from '../services/puzzleManager';
import { ArrowLeft, Play, Clapperboard, Clock, Award } from 'lucide-react';

interface SoloGameProps {
  onExit: () => void;
  initialPuzzle?: Puzzle;
}

export const SoloGame: React.FC<SoloGameProps> = ({ onExit, initialPuzzle }) => {
  const { user } = useAuth();

  // Game Setup State
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    roundTimeSeconds: 30,
    difficulty: 'all',
    gameMode: 'individual-race',
    allowPlayerCustomPuzzles: false
  });

  // Active Session State
  const [roundPuzzles, setRoundPuzzles] = useState<Puzzle[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
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

    if (user && !user.isGuest) {
      const movieNames = roundPuzzles
        .slice(0, currentRoundIndex + 1)
        .map((p) => p?.movie?.name)
        .filter(Boolean) as string[];
      updateUserStats(user.uid, user.displayName || 'Player', roundPoints, true, streak + 1, {
        mode: 'solo',
        roundsPlayed: 1,
        movieNames
      });
    }
  };

  const handleRoundTimeout = () => {
    setIsRoundEnded(true);
    setStreak(0);

    if (user && !user.isGuest) {
      updateUserStats(user.uid, user.displayName || 'Player', 0, false, 0, {
        mode: 'solo',
        roundsPlayed: 1
      });
    }
  };

  const handleCellSolved = (category: CellCategory, answer: CellAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [category]: answer
    }));
  };

  const handleNextRound = () => {
    if (currentRoundIndex + 1 >= roundPuzzles.length) {
      const allAvailable = getAllPuzzles();
      const freshPuzzles = getSelectedPuzzles(20, settings.difficulty);
      setRoundPuzzles((prev) => [...prev, ...freshPuzzles]);
    }

    setCurrentRoundIndex((prev) => prev + 1);
    setAnswers({});
    setTimeLeft(settings.roundTimeSeconds);
    setIsRoundEnded(false);
  };

  const handleStopGame = () => {
    setIsGameFinished(true);
    if (user && !user.isGuest) {
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
    if (user && !user.isGuest && score > 0) {
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

  // If not in game, render Settings & Start Screen (Matches exact Neon Challenge Card design)
  if (!isPlaying || !currentPuzzle) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-6 py-8 max-w-4xl mx-auto overflow-hidden animate-fade-in font-sans">
        {/* Background Ambient Glows */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={onExit}
          className="self-start flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Lobby</span>
        </button>

        {/* Main Challenge Config Card */}
        <div className="relative rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.08)]">
          
          {/* Top Centered Glowing Clapperboard Badge */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-[#070a12] flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              <Clapperboard className="w-7 h-7 text-cyan-400 stroke-[2.2]" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]">
              Solo Cinema Challenge
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Configure your cinematic trial. Prepare to test your Kollywood knowledge under neon lights.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            
            {/* Round Timer Section */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Round Timer</span>
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5">
                {[
                  { sec: 0, label: 'Chill' },
                  { sec: 30, label: '30s' },
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '60s' },
                  { sec: 90, label: '90s' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, roundTimeSeconds: opt.sec }))}
                    className={`py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      settings.roundTimeSeconds === opt.sec
                        ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] font-black bg-cyan-950/20'
                        : 'bg-[#070a12] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-bold'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Pool Section */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>Difficulty Pool</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { id: 'all', label: 'All Era' },
                    { id: 'easy', label: 'Easy' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'hard', label: 'Hard' }
                  ] as const
                ).map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, difficulty: diff.id }))}
                    className={`py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                      settings.difficulty === diff.id
                        ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] font-black bg-cyan-950/20'
                        : 'bg-[#070a12] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-bold'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Neon Cyan Action Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={startGame}
                className="w-full sm:max-w-md py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:shadow-[0_0_45px_rgba(6,182,212,0.9)] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                <span>START CINEMA CHALLENGE</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 font-sans">
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
