import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Lightbulb, Play, Music, Film, User, Heart,
  AlertCircle, Lock, Clapperboard, HelpCircle, Eye,
  Crown, Megaphone, ArrowRight
} from 'lucide-react';
import { CellCategory, Puzzle, CellAnswer, SharedCellAnswer, DirectorHint } from '../types/game';
import { checkAnswer } from '../utils/fuzzyMatch';
import { sound } from '../services/sound';

interface GameBoardProps {
  puzzle: Puzzle;
  answers: Record<string, CellAnswer | SharedCellAnswer>;
  onCellSolved: (category: CellCategory, answer: CellAnswer) => void;
  disabled?: boolean;
  revealAll?: boolean;
  isSpectator?: boolean;
  onUnlockHint?: (newLevel: number) => void;
  directorHints?: DirectorHint[];
  onRequestDirectorHint?: () => void;
}

interface CellConfig {
  key: CellCategory;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  borderAccent: string;
  textAccent: string;
  bgAccent: string;
}

const CATEGORIES: CellConfig[] = [
  {
    key: 'hero',
    label: 'Hero',
    sublabel: 'Protagonist',
    icon: <User className="w-4 h-4 text-cyan-400" />,
    borderAccent: 'border-cyan-500/40 hover:border-cyan-400',
    textAccent: 'text-cyan-400',
    bgAccent: 'bg-cyan-950/60'
  },
  {
    key: 'heroine',
    label: 'Heroine',
    sublabel: 'Leading Lady',
    icon: <Heart className="w-4 h-4 text-pink-400" />,
    borderAccent: 'border-pink-500/40 hover:border-pink-400',
    textAccent: 'text-pink-400',
    bgAccent: 'bg-pink-950/60'
  },
  {
    key: 'movie',
    label: 'Movie',
    sublabel: 'Blockbuster Title',
    icon: <Film className="w-4 h-4 text-teal-400" />,
    borderAccent: 'border-teal-500/40 hover:border-teal-400',
    textAccent: 'text-teal-400',
    bgAccent: 'bg-teal-950/60'
  },
  {
    key: 'song',
    label: 'Song',
    sublabel: 'Chartbuster Hit',
    icon: <Music className="w-4 h-4 text-purple-400" />,
    borderAccent: 'border-purple-500/40 hover:border-purple-400',
    textAccent: 'text-purple-400',
    bgAccent: 'bg-purple-950/60'
  }
];

export const GameBoard: React.FC<GameBoardProps> = ({
  puzzle,
  answers = {},
  onCellSolved,
  disabled = false,
  revealAll = false,
  isSpectator = false,
  onUnlockHint,
  directorHints = [],
  onRequestDirectorHint
}) => {
  const [inputs, setInputs] = useState<Record<CellCategory, string>>({
    hero: '',
    heroine: '',
    movie: '',
    song: ''
  });

  const [clueLevel, setClueLevel] = useState<number>(0);
  const [hasRequestedDirector, setHasRequestedDirector] = useState(false);
  const [directorRevealedCards, setDirectorRevealedCards] = useState<Record<CellCategory, boolean>>({
    hero: false,
    heroine: false,
    movie: false,
    song: false
  });

  const [shakingCells, setShakingCells] = useState<Record<CellCategory, boolean>>({
    hero: false,
    heroine: false,
    movie: false,
    song: false
  });

  const [lastFeedback, setLastFeedback] = useState<Record<CellCategory, string | null>>({
    hero: null,
    heroine: null,
    movie: null,
    song: null
  });

  useEffect(() => {
    setInputs({ hero: '', heroine: '', movie: '', song: '' });
    setClueLevel(0);
    setHasRequestedDirector(false);
    setDirectorRevealedCards({ hero: false, heroine: false, movie: false, song: false });
    setShakingCells({ hero: false, heroine: false, movie: false, song: false });
    setLastFeedback({ hero: null, heroine: null, movie: null, song: null });
  }, [puzzle?.id, puzzle?.movie?.name]);

  const safeDirectorHints: DirectorHint[] = Array.isArray(directorHints)
    ? directorHints
    : (directorHints && typeof directorHints === 'object' ? Object.values(directorHints) : []);

  useEffect(() => {
    if (safeDirectorHints.length > 0) {
      sound.playHint();
      setHasRequestedDirector(false);
    }
  }, [safeDirectorHints.length]);

  const handleInputChange = (category: CellCategory, val: string) => {
    setInputs(prev => ({ ...prev, [category]: val }));
    if (lastFeedback[category]) {
      setLastFeedback(prev => ({ ...prev, [category]: null }));
    }
  };

  const handleUnlockNextCinemaClue = () => {
    if (clueLevel < 3 && !isSpectator) {
      sound.playHint();
      const nextLevel = clueLevel + 1;
      setClueLevel(nextLevel);
      if (onUnlockHint) {
        onUnlockHint(nextLevel);
      }
    }
  };

  const handleAskDirector = () => {
    if (onRequestDirectorHint && !hasRequestedDirector) {
      sound.playHint();
      setHasRequestedDirector(true);
      onRequestDirectorHint();
    }
  };

  const handleGuessSubmit = (category: CellCategory) => {
    if (disabled || revealAll || isSpectator || answers?.[category]?.correct) return;
    const guess = inputs[category]?.trim();
    if (!guess) return;

    const targetEntity = puzzle?.[category];
    if (!targetEntity) return;

    const isCorrect = checkAnswer(guess, targetEntity.name, targetEntity.aliases);

    if (isCorrect) {
      sound.playCorrect();
      const hintsUsed = clueLevel;
      const timeMs = Date.now();
      const answerData: CellAnswer = {
        guess,
        correct: true,
        timeMs,
        hintsUsed
      };
      onCellSolved(category, answerData);
      setInputs(prev => ({ ...prev, [category]: '' }));
    } else {
      sound.playWrong();
      setShakingCells(prev => ({ ...prev, [category]: true }));
      setLastFeedback(prev => ({ ...prev, [category]: 'Not quite right. Try another name!' }));
      setTimeout(() => {
        setShakingCells(prev => ({ ...prev, [category]: false }));
      }, 600);
    }
  };

  const isAllCardsSolved =
    answers?.hero?.correct &&
    answers?.heroine?.correct &&
    answers?.movie?.correct &&
    answers?.song?.correct;

  const isAnyDirectorCardRevealed = Object.values(directorRevealedCards).some(Boolean);

  const toggleAllDirectorCards = () => {
    const nextState = !isAnyDirectorCardRevealed;
    setDirectorRevealedCards({
      hero: nextState,
      heroine: nextState,
      movie: nextState,
      song: nextState
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 font-sans">
      {/* 👑 MOVIE CREATOR / SPECTATOR BANNER */}
      {isSpectator && (
        <div className="p-4 rounded-3xl bg-[#0c101a]/95 border-2 border-cyan-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-400 text-black shadow-md flex-shrink-0">
              <Crown className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="text-xs font-display font-black text-cyan-300 block">
                Director's Chair (Spectator Mode)
              </span>
              <p className="text-[11px] text-slate-400">
                {isAllCardsSolved
                  ? '🎉 All 4 clues have been solved by contestants!'
                  : 'You can reveal answers for any category below.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAllCardsSolved ? (
              <button
                type="button"
                onClick={toggleAllDirectorCards}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnyDirectorCardRevealed
                    ? 'bg-cyan-400 text-black border-cyan-300 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-cyan-950/60 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAnyDirectorCardRevealed ? 'Hide Answers' : 'Preview All Answers'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Solved (4/4)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎬 DIRECTOR'S BROADCAST CLUES */}
      {safeDirectorHints.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#0c101a]/95 border border-cyan-500/60 shadow-xl space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-2 text-xs font-display font-black text-cyan-300">
              <Megaphone className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>DIRECTOR'S LIVE BROADCAST</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              From {safeDirectorHints[safeDirectorHints.length - 1]?.fromName || 'Director'}
            </span>
          </div>

          <div className="space-y-1.5">
            {safeDirectorHints.map((dh) => (
              <div
                key={dh.id || `hint-${dh.timestamp}`}
                className="p-3 rounded-2xl bg-[#070a12] border border-cyan-500/30 text-xs text-white font-semibold flex items-start gap-2 shadow-sm"
              >
                <span className="text-cyan-400 font-bold">🎬</span>
                <span>"{dh.message}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎬 CINEMA CLUES STATION */}
      <div className="rounded-3xl bg-[#0c101a]/90 p-4 sm:p-5 border border-slate-800/90 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
              <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Cinema Clues Station</span>
                {clueLevel > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                    {clueLevel}/3 Unlocked
                  </span>
                )}
              </h4>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">
                {clueLevel === 0 && '🔒 Clues locked • Guess with first letter or reveal clues'}
                {clueLevel === 1 && 'Release Year & Genre revealed (-50 pts)'}
                {clueLevel === 2 && 'Director & Music Maestro revealed (-50 pts)'}
                {clueLevel >= 3 && 'Full Plot & Story Clue revealed! (-50 pts)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRequestDirectorHint && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleAskDirector}
                disabled={hasRequestedDirector}
                className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  hasRequestedDirector
                    ? 'bg-[#070a12] text-emerald-400 border-emerald-500/40 cursor-default'
                    : 'bg-pink-950/60 hover:bg-pink-900 border-pink-500/40 text-pink-300'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{hasRequestedDirector ? '✓ Hint Requested (-25 pts)' : '🙋 Ask Director (-25 pts)'}</span>
              </button>
            )}

            {clueLevel < 3 && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleUnlockNextCinemaClue}
                className="py-1.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {clueLevel === 0 && 'Unlock Year & Genre (-50 pts)'}
                  {clueLevel === 1 && 'Unlock Dir & Music (-50 pts)'}
                  {clueLevel === 2 && 'Unlock Plot Clue (-50 pts)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Revealed / Locked Clue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
          {/* Clue 1: Year & Genre */}
          <div className={`p-3 rounded-2xl border transition-all ${
            clueLevel >= 1 || revealAll
              ? 'bg-[#070a12] border-slate-800'
              : 'bg-[#070a12]/50 border-slate-900 opacity-60'
          }`}>
            <span className="text-[10px] uppercase font-black text-cyan-400 block mb-0.5 tracking-wider">
              📅 Year & Genre
            </span>
            {clueLevel >= 1 || revealAll ? (
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="font-mono">{puzzle?.year || 2024}</span>
                <span className="text-slate-500">•</span>
                <span className="truncate">{puzzle?.genre || 'Commercial Blockbuster'}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>

          {/* Clue 2: Director & Music */}
          <div className={`p-3 rounded-2xl border transition-all ${
            clueLevel >= 2 || revealAll
              ? 'bg-[#070a12] border-slate-800'
              : 'bg-[#070a12]/50 border-slate-900 opacity-60'
          }`}>
            <span className="text-[10px] uppercase font-black text-teal-400 block mb-0.5 tracking-wider">
              🎬 Director & Music
            </span>
            {clueLevel >= 2 || revealAll ? (
              <div className="text-xs font-bold text-slate-200 truncate">
                Dir: <strong className="text-white">{puzzle?.director || 'Tamil Director'}</strong>
                {puzzle?.musicDirector && <span className="text-slate-400"> • 🎵 {puzzle.musicDirector}</span>}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>

          {/* Clue 3: Plot / Trivia Clue */}
          <div className={`p-3 rounded-2xl border transition-all ${
            clueLevel >= 3 || revealAll
              ? 'bg-[#070a12] border-slate-800'
              : 'bg-[#070a12]/50 border-slate-900 opacity-60'
          }`}>
            <span className="text-[10px] uppercase font-black text-purple-400 block mb-0.5 tracking-wider">
              💡 Plot / Story Hook
            </span>
            {clueLevel >= 3 || revealAll ? (
              <div className="text-xs font-medium text-slate-200 line-clamp-2 italic">
                "{puzzle?.trivia || 'Blockbuster Tamil Cinema Masterpiece.'}"
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2x2 CINEMA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {CATEGORIES.map(category => {
          const key = category.key;
          const entity = (puzzle && puzzle[key]) || {
            name: 'Mystery',
            firstLetter: '?',
            imageUrl: '',
            aliases: []
          };
          const rawAnswer = answers ? answers[key] : undefined;
          const isSolved = rawAnswer?.correct || false;
          const sharedAnswer = rawAnswer && 'solvedByName' in rawAnswer ? (rawAnswer as SharedCellAnswer) : null;
          const isDirectorRevealed = isSpectator && !!directorRevealedCards[key];
          const isLocked = isSolved || revealAll || disabled || isSpectator;
          const shouldReveal = isSolved || revealAll || isDirectorRevealed;
          const isShaking = shakingCells[key] || false;

          let imageUrl = entity.imageUrl;
          if (key === 'song' && entity.youtubeId) {
            imageUrl = `https://img.youtube.com/vi/${entity.youtubeId}/hqdefault.jpg`;
          }
          if (!imageUrl) {
            imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${entity.name}`;
          }

          return (
            <div
              key={key}
              className={`relative rounded-3xl transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Card Container */}
              <div
                className={`relative min-h-[290px] sm:min-h-[330px] rounded-3xl p-5 border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  isSolved
                    ? 'bg-[#0c101a]/95 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : isDirectorRevealed
                    ? 'bg-[#0c101a]/95 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                    : shouldReveal
                    ? 'bg-[#0c101a]/95 border-slate-700 shadow-xl'
                    : 'bg-[#0c101a]/90 border-slate-800/90 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Top Category Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${category.bgAccent} border border-slate-800 flex-shrink-0 shadow-sm`}>
                      {category.icon}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                        {category.label}
                      </span>
                      <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">
                        {category.sublabel}
                      </p>
                    </div>
                  </div>

                  {isSolved ? (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border bg-emerald-950/80 text-emerald-300 border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sharedAnswer ? sharedAnswer.solvedByName : 'Solved'}</span>
                    </div>
                  ) : isSpectator ? (
                    <button
                      type="button"
                      onClick={() => setDirectorRevealedCards(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border transition-all cursor-pointer ${
                        isDirectorRevealed
                          ? 'bg-cyan-400 text-black border-cyan-300 font-black shadow-sm'
                          : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isDirectorRevealed ? 'Hide' : 'Show'}</span>
                    </button>
                  ) : shouldReveal ? (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border bg-slate-900 text-slate-400 border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Locked</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-[#070a12] px-2.5 py-1 rounded-lg border border-slate-800">
                      Starts: <span className={category.textAccent}>{entity.firstLetter || entity.name.charAt(0) || '?'}</span>
                    </span>
                  )}
                </div>

                {/* Middle Content: Solved Image OR Giant First Letter Badge */}
                <div className="my-auto py-2 z-10 flex flex-col items-center justify-center text-center">
                  {shouldReveal ? (
                    <div className="space-y-2.5 w-full flex flex-col items-center animate-fade-in">
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={entity.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${entity.name}`;
                          }}
                        />
                        {key === 'song' && entity.youtubeId && (
                          <a
                            href={`https://www.youtube.com/watch?v=${entity.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/40 hover:scale-110 transition-transform"
                            title="Play Song on YouTube"
                          >
                            <Play className="w-3 h-3 fill-black text-black" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-0.5 max-w-full px-2">
                        <h4 className="font-display font-black text-sm sm:text-base text-white truncate max-w-xs">
                          {entity.name}
                        </h4>
                        {entity.aliases && entity.aliases.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            aka {entity.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#070a12] border-2 ${category.borderAccent} flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.15)] mb-2 transition-transform group-hover:scale-105`}>
                        <span className={`font-display font-black text-4xl sm:text-5xl ${category.textAccent}`}>
                          {entity.firstLetter || entity.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                        Starts with "{entity.firstLetter || entity.name.charAt(0)}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Input Area or Solved State */}
                <div className="z-10 mt-1 sm:mt-2">
                  {isSolved ? (
                    <div className="text-center py-1 flex items-center justify-center gap-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        {sharedAnswer?.solvedByAvatar && (
                          <img
                            src={sharedAnswer.solvedByAvatar}
                            alt={sharedAnswer.solvedByName}
                            className="w-5 h-5 rounded-full border border-emerald-400 object-cover"
                          />
                        )}
                        <span className="text-emerald-400 font-bold text-xs">
                          {sharedAnswer ? `⚡ Solved by ${sharedAnswer.solvedByName}` : '✨ Solved!'}
                        </span>
                      </div>
                    </div>
                  ) : isSpectator ? (
                    <button
                      type="button"
                      onClick={() => setDirectorRevealedCards(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDirectorRevealed
                          ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                          : 'bg-cyan-400 text-black hover:bg-cyan-300 border-cyan-300 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isDirectorRevealed ? `Hide ${category.label} Answer` : `Show ${category.label} Answer`}</span>
                    </button>
                  ) : !shouldReveal ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGuessSubmit(key);
                      }}
                      className="space-y-1.5"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={isLocked}
                          value={inputs[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder={`Guess the ${category.label.toLowerCase()}...`}
                          className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={isLocked || !inputs[key]?.trim()}
                          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(6,182,212,0.5)] disabled:opacity-40 disabled:pointer-events-none flex-shrink-0 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Guess</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {lastFeedback[key] && (
                        <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 pl-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{lastFeedback[key]}</span>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="text-center py-1 flex items-center justify-center gap-2 text-xs font-semibold">
                      <span className="text-slate-400 text-xs font-semibold">
                        🔒 Round Finished • Solution Revealed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
