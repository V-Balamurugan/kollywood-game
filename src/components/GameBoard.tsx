import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Lightbulb, Play, Music, Film, User, Heart,
  AlertCircle, Lock, Clapperboard, Sparkles, HelpCircle, Eye,
  Crown, MessageSquare, Megaphone, Send, ArrowRight, Star
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
    icon: <User className="w-4 h-4 text-amber-400" />,
    borderAccent: 'border-amber-500/40 hover:border-amber-400',
    textAccent: 'text-amber-400',
    bgAccent: 'bg-amber-500/10'
  },
  {
    key: 'heroine',
    label: 'Heroine',
    sublabel: 'Leading Lady',
    icon: <Heart className="w-4 h-4 text-rose-400" />,
    borderAccent: 'border-rose-500/40 hover:border-rose-400',
    textAccent: 'text-rose-400',
    bgAccent: 'bg-rose-500/10'
  },
  {
    key: 'movie',
    label: 'Movie',
    sublabel: 'Blockbuster Title',
    icon: <Film className="w-4 h-4 text-blue-400" />,
    borderAccent: 'border-blue-500/40 hover:border-blue-400',
    textAccent: 'text-blue-400',
    bgAccent: 'bg-blue-500/10'
  },
  {
    key: 'song',
    label: 'Song',
    sublabel: 'Hit Chartbuster',
    icon: <Music className="w-4 h-4 text-purple-400" />,
    borderAccent: 'border-purple-500/40 hover:border-purple-400',
    textAccent: 'text-purple-400',
    bgAccent: 'bg-purple-500/10'
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

  // Cinema Clue Level: 0 = All Locked, 1 = Year/Genre, 2 = Director/Music, 3 = Plot Clue / Trivia
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

  // Reset state when movie puzzle changes (new round)
  useEffect(() => {
    setInputs({ hero: '', heroine: '', movie: '', song: '' });
    setClueLevel(0);
    setHasRequestedDirector(false);
    setDirectorRevealedCards({ hero: false, heroine: false, movie: false, song: false });
    setShakingCells({ hero: false, heroine: false, movie: false, song: false });
    setLastFeedback({ hero: null, heroine: null, movie: null, song: null });
  }, [puzzle?.id, puzzle?.movie?.name]);

  // Audio cue when new hint arrives and reset request state so player can request again if needed
  useEffect(() => {
    if (directorHints.length > 0) {
      sound.playHint();
      setHasRequestedDirector(false);
    }
  }, [directorHints.length]);

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
        hintsUsed,
        revealedAt: Date.now()
      };
      onCellSolved(category, answerData);
      setLastFeedback(prev => ({ ...prev, [category]: 'Correct! 🔥' }));
    } else {
      sound.playWrong();
      setShakingCells(prev => ({ ...prev, [category]: true }));
      setLastFeedback(prev => ({ ...prev, [category]: 'Try again!' }));
      setTimeout(() => {
        setShakingCells(prev => ({ ...prev, [category]: false }));
      }, 500);
    }
  };

  const solvedCount = ['hero', 'heroine', 'movie', 'song'].filter(cat => answers?.[cat as CellCategory]?.correct).length;
  const isAllCardsSolved = solvedCount === 4;

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
    <div className="w-full max-w-4xl mx-auto space-y-3.5 sm:space-y-5">
      {/* 👑 MOVIE CREATOR / SPECTATOR BANNER */}
      {isSpectator && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-cinema-surface border-2 border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-black shadow-md flex-shrink-0">
              <Crown className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="text-xs font-display font-black text-amber-300 block">
                Director's Chair (Spectator Mode)
              </span>
              <p className="text-[11px] text-cinema-muted">
                {isAllCardsSolved
                  ? '🎉 All 4 answers have been discovered by contestants!'
                  : 'You can click "Show Answer" on any unsolved section below to preview answers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle All Answers in 2x2 Grid Button (Removed when all 4 are solved) */}
            {!isAllCardsSolved ? (
              <button
                type="button"
                onClick={toggleAllDirectorCards}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${isAnyDirectorCardRevealed
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-amber-500/25'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                  }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAnyDirectorCardRevealed ? '🙈 Hide Unsolved Answers' : '👁️ Show Unsolved Answers'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Solved (4/4)</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cinema-dark border border-cinema-border text-amber-400 text-xs font-bold flex-shrink-0">
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Director View</span>
            </div>
          </div>
        </div>
      )}

      {/* 🎬 DIRECTOR'S BROADCAST CLUES */}
      {directorHints.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-cinema-surface border border-brand-500/60 shadow-xl shadow-brand-500/15 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-2 text-xs font-display font-black text-amber-300">
              <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>DIRECTOR'S LIVE BROADCAST</span>
            </div>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
              From {directorHints[directorHints.length - 1]?.fromName || 'Director'}
            </span>
          </div>

          <div className="space-y-1.5">
            {directorHints.map((dh) => (
              <div
                key={dh.id}
                className="p-2.5 rounded-xl bg-cinema-dark/90 border border-brand-500/40 text-xs text-white font-semibold flex items-start gap-2 shadow-sm"
              >
                <span className="text-amber-400 font-bold">🎬</span>
                <span>"{dh.message}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎬 CINEMA CLUES STATION */}
      <div className="glass-card rounded-3xl p-3.5 sm:p-5 border border-cinema-border/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-cinema-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex-shrink-0">
              <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Cinema Clues Station</span>
                {clueLevel > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {clueLevel}/3 Unlocked
                  </span>
                )}
              </h4>
              <span className="text-[10px] sm:text-[11px] text-cinema-muted block">
                {clueLevel === 0 && '🔒 Clues locked • Guess with 1st letters or reveal clues'}
                {clueLevel === 1 && 'Release Year & Genre revealed (-50 pts)'}
                {clueLevel === 2 && 'Director & Music Maestro revealed (-50 pts)'}
                {clueLevel >= 3 && 'Full Plot & Story Clue revealed! (-50 pts)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Contestant: Ask Director for Hint */}
            {onRequestDirectorHint && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleAskDirector}
                disabled={hasRequestedDirector}
                className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${hasRequestedDirector
                  ? 'bg-cinema-surface text-emerald-400 border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border-pink-500/40 text-pink-300'
                  }`}
                title="Ask the movie creator / director to provide 1 hint (-25 pts penalty, minimum 0)"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{hasRequestedDirector ? '✓ Hint Requested (-25 pts)' : '🙋‍♂️ Ask Director (-25 pts)'}</span>
              </button>
            )}

            {/* Unlock Next Cinema Clue */}
            {clueLevel < 3 && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleUnlockNextCinemaClue}
                className="py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                title="Unlock next cinema clue (-50 pts penalty, minimum 0)"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
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
          <div className={`p-3 rounded-2xl border transition-all ${clueLevel >= 1 || revealAll
            ? 'bg-cinema-surface border-cinema-border/70 shadow-sm'
            : 'bg-cinema-dark/50 border-cinema-border/40 opacity-70'
            }`}>
            <span className="text-[10px] uppercase font-black text-amber-400 block mb-0.5 tracking-wider">
              📅 Year & Genre
            </span>
            {clueLevel >= 1 || revealAll ? (
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="font-mono">{puzzle?.year || 2024}</span>
                <span className="text-cinema-muted">•</span>
                <span className="text-slate-300 truncate">{puzzle?.genre || 'Kollywood Cinema'}</span>
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/60" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>

          {/* Clue 2: Director & Music */}
          <div className={`p-3 rounded-2xl border transition-all ${clueLevel >= 2 || revealAll
            ? 'bg-cinema-surface border-cinema-border/70 shadow-sm'
            : 'bg-cinema-dark/50 border-cinema-border/40 opacity-70'
            }`}>
            <span className="text-[10px] uppercase font-black text-pink-400 block mb-0.5 tracking-wider">
              🎬 Director & Music
            </span>
            {clueLevel >= 2 || revealAll ? (
              <div className="text-xs font-bold text-slate-200 truncate">
                Dir: <strong className="text-white">{puzzle?.director || 'Tamil Director'}</strong>
                {puzzle?.musicDirector && <span className="text-slate-300"> • 🎵 {puzzle.musicDirector}</span>}
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/60" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>

          {/* Clue 3: Plot / Trivia Clue */}
          <div className={`p-3 rounded-2xl border transition-all ${clueLevel >= 3 || revealAll
            ? 'bg-cinema-surface border-cinema-border/70 shadow-sm'
            : 'bg-cinema-dark/50 border-cinema-border/40 opacity-70'
            }`}>
            <span className="text-[10px] uppercase font-black text-purple-400 block mb-0.5 tracking-wider">
              💡 Plot / Story Hook
            </span>
            {clueLevel >= 3 || revealAll ? (
              <div className="text-xs font-medium text-slate-200 line-clamp-2 italic">
                "{puzzle?.trivia || 'Blockbuster Tamil Cinema Masterpiece.'}"
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/60" />
                <span>Locked Clue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2x2 CINEMA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
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

          // Determine Image URL
          let imageUrl = entity.imageUrl;
          if (key === 'song' && entity.youtubeId) {
            imageUrl = `https://img.youtube.com/vi/${entity.youtubeId}/hqdefault.jpg`;
          }
          if (!imageUrl) {
            imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${entity.name}`;
          }

          // Pick category class
          const categoryClass =
            key === 'hero' ? 'card-category-hero' :
              key === 'heroine' ? 'card-category-heroine' :
                key === 'movie' ? 'card-category-movie' : 'card-category-song';

          return (
            <div
              key={key}
              className={`relative rounded-3xl transition-all duration-300 ${isShaking ? 'animate-shake' : ''
                }`}
            >
              {/* Card Container */}
              <div
                className={`relative min-h-[285px] sm:min-h-[325px] rounded-3xl p-4 sm:p-5 border flex flex-col justify-between overflow-hidden transition-all duration-300 ${shouldReveal
                  ? isSolved
                    ? 'glass-card correct-border-glow bg-emerald-950/20'
                    : isDirectorRevealed
                      ? 'glass-card border-2 border-amber-500/70 bg-amber-950/25 shadow-xl shadow-amber-500/10'
                      : 'glass-card border-amber-500/50 bg-amber-950/20'
                  : `glass-card ${categoryClass}`
                  }`}
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Category Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${category.bgAccent} border border-cinema-border/60 flex-shrink-0 shadow-sm`}>
                      {category.icon}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                        {category.label}
                      </span>
                      <p className="text-[10px] text-cinema-muted -mt-0.5 font-medium">
                        {category.sublabel}
                      </p>
                    </div>
                  </div>

                  {isSolved ? (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sharedAnswer ? sharedAnswer.solvedByName : 'Solved'}</span>
                    </div>
                  ) : isSpectator ? (
                    <button
                      type="button"
                      onClick={() => setDirectorRevealedCards(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border transition-all active:scale-95 ${isDirectorRevealed
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/40'
                        }`}
                      title={`Show or hide ${category.label} answer`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isDirectorRevealed ? '🙈 Hide' : '👁️ Show'}</span>
                    </button>
                  ) : shouldReveal ? (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full animate-fade-in border bg-amber-500/20 text-amber-300 border-amber-500/40">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Locked</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-cinema-muted bg-cinema-dark px-2.5 py-1 rounded-lg border border-cinema-border/60">
                      Starts: <span className={category.textAccent}>{entity.firstLetter || entity.name.charAt(0) || '?'}</span>
                    </span>
                  )}
                </div>

                {/* Middle Content: Solved Image OR Giant First Letter Badge */}
                <div className="my-auto py-2 z-10 flex flex-col items-center justify-center text-center">
                  {shouldReveal ? (
                    <div className="space-y-2.5 w-full flex flex-col items-center animate-fade-in">
                      {/* Image Thumbnail with Category Glow */}
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={entity.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-500/60 shadow-xl shadow-brand-500/20 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${entity.name}`;
                          }}
                        />
                        {key === 'song' && entity.youtubeId && (
                          <a
                            href={`https://www.youtube.com/watch?v=${entity.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 hover:scale-110 transition-transform"
                            title="Play Song on YouTube"
                          >
                            <Play className="w-3 h-3 fill-white" />
                          </a>
                        )}
                      </div>

                      {/* Revealed Entity Name */}
                      <div className="space-y-0.5 max-w-full px-2">
                        <h4 className="font-display font-black text-sm sm:text-base text-white truncate max-w-xs">
                          {entity.name}
                        </h4>
                        {entity.aliases && entity.aliases.length > 0 && (
                          <p className="text-[10px] text-cinema-muted truncate max-w-xs">
                            aka {entity.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Giant First Letter Badge with tactile depth */}
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-cinema-surface to-cinema-dark border-2 ${category.borderAccent} flex items-center justify-center shadow-2xl mb-2 transition-transform group-hover:scale-105`}>
                        <span className={`font-display font-black text-4xl sm:text-5xl ${category.textAccent}`}>
                          {entity.firstLetter || entity.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-cinema-muted uppercase font-bold tracking-wider">
                        Starts with "{entity.firstLetter || entity.name.charAt(0)}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Input Area or Director / Solver State */}
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
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${isDirectorRevealed
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                        : 'bg-amber-500 text-black hover:bg-amber-400 border-amber-400 font-black shadow-amber-500/20'
                        }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isDirectorRevealed ? `🙈 Hide ${category.label} Answer` : `👁️ Show ${category.label} Answer`}</span>
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
                          className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={isLocked || !inputs[key]?.trim()}
                          className="px-4 py-2.5 rounded-xl btn-cinema-primary text-black font-black text-xs shadow-md disabled:opacity-40 disabled:pointer-events-none flex-shrink-0 flex items-center gap-1"
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
                      <span className="text-amber-400/90 text-xs font-bold">
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
