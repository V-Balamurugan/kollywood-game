import React, { useState, useEffect } from 'react';
import { CheckCircle2, Lightbulb, Play, Music, Film, User, Heart, AlertCircle, Lock, Clapperboard, Sparkles, HelpCircle, Eye, Crown, MessageSquare, Megaphone } from 'lucide-react';
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
  accentColor: string;
}

const CATEGORIES: CellConfig[] = [
  {
    key: 'hero',
    label: 'Hero',
    sublabel: 'Lead Actor',
    icon: <User className="w-4 h-4" />,
    accentColor: 'from-amber-500 to-yellow-600'
  },
  {
    key: 'heroine',
    label: 'Heroine',
    sublabel: 'Lead Actress',
    icon: <Heart className="w-4 h-4 text-pink-400" />,
    accentColor: 'from-pink-500 to-rose-600'
  },
  {
    key: 'movie',
    label: 'Movie',
    sublabel: 'Film Title',
    icon: <Film className="w-4 h-4 text-blue-400" />,
    accentColor: 'from-blue-500 to-indigo-600'
  },
  {
    key: 'song',
    label: 'Song',
    sublabel: 'Chartbuster Track',
    icon: <Music className="w-4 h-4 text-purple-400" />,
    accentColor: 'from-purple-500 to-violet-600'
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

  // Cinema Clue Level: 0 = All Locked at starting phase, 1 = Year/Genre, 2 = Director/Music, 3 = Plot Clue / Trivia
  const [clueLevel, setClueLevel] = useState<number>(0);
  const [hasRequestedDirector, setHasRequestedDirector] = useState(false);

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

  // Reset inputs and clue level (to 0 = All Locked) when puzzle changes for a fresh round
  useEffect(() => {
    setInputs({ hero: '', heroine: '', movie: '', song: '' });
    setClueLevel(0);
    setHasRequestedDirector(false);
    setShakingCells({ hero: false, heroine: false, movie: false, song: false });
    setLastFeedback({ hero: null, heroine: null, movie: null, song: null });
  }, [puzzle?.id]);

  // Play audio chime when a new director hint arrives
  useEffect(() => {
    if (directorHints.length > 0) {
      sound.playHint();
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
      setLastFeedback(prev => ({ ...prev, [category]: 'Correct!' }));
    } else {
      sound.playWrong();
      setShakingCells(prev => ({ ...prev, [category]: true }));
      setLastFeedback(prev => ({ ...prev, [category]: 'Try again!' }));
      setTimeout(() => {
        setShakingCells(prev => ({ ...prev, [category]: false }));
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* 👑 MOVIE CREATOR / SPECTATOR BANNER */}
      {isSpectator && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-cinema-card border border-amber-500/50 flex items-center justify-between gap-3 shadow-lg animate-pop">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-black shadow-md">
              <Crown className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="text-xs font-display font-black text-amber-300 block">
                Director's Chair (Spectating)
              </span>
              <p className="text-[11px] text-cinema-muted">
                You created this movie! All clues start locked for contestants. Send hints to help them and earn +50 pts bounty!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cinema-dark/80 border border-cinema-border text-amber-400 text-xs font-bold">
            <Eye className="w-3.5 h-3.5" />
            <span>Director Mode</span>
          </div>
        </div>
      )}

      {/* 🎬 DIRECTOR'S BROADCAST CLUES (If Director has sent any hint!) */}
      {directorHints.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-cinema-dark border-2 border-brand-500 shadow-xl shadow-brand-500/15 space-y-2 animate-pop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-display font-black text-amber-300">
              <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>DIRECTOR'S LIVE CLUE BROADCAST</span>
            </div>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
              From Director {directorHints[directorHints.length - 1]?.fromName || ''}
            </span>
          </div>

          <div className="space-y-1.5">
            {directorHints.map((dh) => (
              <div
                key={dh.id}
                className="p-2.5 rounded-xl bg-cinema-dark/80 border border-brand-500/40 text-xs text-white font-semibold flex items-start gap-2 shadow-sm"
              >
                <span className="text-amber-400 font-bold">🎬</span>
                <span>"{dh.message}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎬 CINEMA CLUES STATION */}
      <div className="glass-card rounded-2xl p-4 border border-cinema-border/80 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cinema-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                Cinema Clues Station
              </h4>
              <span className="text-[10px] text-cinema-muted">
                {clueLevel === 0 && '🔒 All cinema clues locked • Guess with 1st letters or unlock clues'}
                {clueLevel === 1 && 'Release Year & Genre clue unlocked (+50 pts to creator)'}
                {clueLevel === 2 && 'Director & Music Director clues unlocked (+50 pts to creator)'}
                {clueLevel >= 3 && 'Full Plot & Trivia clue unlocked! (+50 pts to creator)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Contestant: Ask Director for Hint */}
            {onRequestDirectorHint && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleAskDirector}
                disabled={hasRequestedDirector}
                className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  hasRequestedDirector
                    ? 'bg-cinema-cardHover text-emerald-400 border-emerald-500/40'
                    : 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border-pink-500/40 text-pink-300'
                }`}
                title="Ask the movie creator / director to provide a hint"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{hasRequestedDirector ? '✓ Hint Requested from Director' : '🙋‍♂️ Ask Director for Hint'}</span>
              </button>
            )}

            {/* Unlock Next Cinema Clue */}
            {clueLevel < 3 && !disabled && !revealAll && !isSpectator && (
              <button
                onClick={handleUnlockNextCinemaClue}
                className="py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                title="Unlock next cinema clue (-50 pts deducted, given to movie creator)"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>
                  {clueLevel === 0 && 'Unlock Clue 1: Year & Genre (-50 pts)'}
                  {clueLevel === 1 && 'Unlock Clue 2: Director & Music (-50 pts)'}
                  {clueLevel === 2 && 'Unlock Clue 3: Plot Clue (-50 pts)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Revealed / Locked Clue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
          {/* Clue 1: Year & Genre */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            clueLevel >= 1 || revealAll
              ? 'bg-cinema-dark/70 border-cinema-border/60'
              : 'bg-cinema-dark/30 border-cinema-border/30 opacity-70'
          }`}>
            <span className="text-[9px] uppercase font-bold text-brand-400 block mb-0.5">
              📅 Release Year & Genre
            </span>
            {clueLevel >= 1 || revealAll ? (
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{puzzle?.year || 2024}</span>
                <span className="text-cinema-muted">•</span>
                <span className="text-slate-300 truncate">{puzzle?.genre || 'Kollywood Film'}</span>
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/70" />
                <span>Locked Clue (Click unlock above)</span>
              </div>
            )}
          </div>

          {/* Clue 2: Director & Music */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            clueLevel >= 2 || revealAll
              ? 'bg-cinema-dark/70 border-cinema-border/60' 
              : 'bg-cinema-dark/30 border-cinema-border/30 opacity-70'
          }`}>
            <span className="text-[9px] uppercase font-bold text-pink-400 block mb-0.5">
              🎬 Director & Music
            </span>
            {clueLevel >= 2 || revealAll ? (
              <div className="text-xs font-semibold text-slate-200 truncate">
                Dir: <strong>{puzzle?.director || 'Tamil Director'}</strong>
                {puzzle?.musicDirector && ` | 🎵 ${puzzle.musicDirector}`}
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/70" />
                <span>Locked Clue (Click unlock above)</span>
              </div>
            )}
          </div>

          {/* Clue 3: Plot / Trivia Clue */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            clueLevel >= 3 || revealAll
              ? 'bg-cinema-dark/70 border-cinema-border/60' 
              : 'bg-cinema-dark/30 border-cinema-border/30 opacity-70'
          }`}>
            <span className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">
              💡 Plot / Trivia Clue
            </span>
            {clueLevel >= 3 || revealAll ? (
              <div className="text-xs font-semibold text-slate-200 line-clamp-2 italic">
                "{puzzle?.trivia || 'Blockbuster Tamil Cinema Masterpiece.'}"
              </div>
            ) : (
              <div className="text-xs text-cinema-muted italic flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400/70" />
                <span>Locked Clue (Click unlock above)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2x2 CINEMA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
          const isLocked = isSolved || revealAll || disabled || isSpectator;
          const shouldReveal = isSolved || revealAll;
          const isShaking = shakingCells[key] || false;

          // Determine Image URL
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
              className={`relative rounded-3xl transition-all duration-300 ${
                isShaking ? 'animate-shake' : ''
              }`}
            >
              {/* Card Container */}
              <div
                className={`relative min-h-[300px] sm:min-h-[320px] rounded-3xl p-5 border flex flex-col justify-between overflow-hidden transition-all duration-500 ${
                  shouldReveal
                    ? isSolved
                      ? 'glass-card correct-border-glow bg-emerald-950/20'
                      : 'glass-card border-amber-500/50 bg-amber-950/20'
                    : 'glass-card border-cinema-border/70 hover:border-brand-500/50'
                }`}
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Category Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-cinema-cardHover border border-cinema-border/50 text-slate-300">
                      {category.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        {category.label}
                      </span>
                      <p className="text-[10px] text-cinema-muted -mt-0.5">
                        {category.sublabel}
                      </p>
                    </div>
                  </div>

                  {shouldReveal ? (
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pop border ${
                      isSolved 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {isSolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{sharedAnswer ? `Solved by ${sharedAnswer.solvedByName}` : 'Solved'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cinema-muted bg-cinema-dark/80 px-2 py-0.5 rounded-md border border-cinema-border/40">
                      1st Letter: {entity.firstLetter || entity.name.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                {/* Middle Content: Solved Image OR Giant First Letter Badge */}
                <div className="my-auto py-3 text-center z-10">
                  {shouldReveal ? (
                    <div className="flex flex-col items-center animate-pop">
                      {/* Revealed Photo */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-brand-500/60 shadow-lg shadow-brand-500/20 mb-3 group">
                        <img
                          src={imageUrl}
                          alt={entity.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${entity.name}`;
                          }}
                        />
                        {key === 'song' && entity.youtubeId && (
                          <a
                            href={`https://www.youtube.com/watch?v=${entity.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors"
                            title="Play Song on YouTube"
                          >
                            <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </a>
                        )}
                      </div>

                      {/* Full Name */}
                      <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                        {entity.name}
                      </h3>
                      {entity.aliases && entity.aliases.length > 0 && (
                        <p className="text-[11px] text-cinema-muted">
                          aka {entity.aliases[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Giant First Letter Badge */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-cinema-cardHover to-cinema-card border-2 border-brand-500/40 flex items-center justify-center shadow-xl shadow-brand-500/10 mb-2 group hover:border-brand-500 transition-colors">
                        <span className="font-display font-black text-5xl sm:text-6xl bg-gradient-to-b from-brand-300 via-brand-400 to-amber-500 bg-clip-text text-transparent">
                          {entity.firstLetter || entity.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-[11px] text-cinema-muted uppercase font-bold tracking-wider">
                        Starts with "{entity.firstLetter || entity.name.charAt(0)}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Input Area or Spectator / Solver State */}
                <div className="z-10 mt-2">
                  {!shouldReveal ? (
                    isSpectator ? (
                      <div className="text-center py-2 bg-cinema-dark/60 rounded-xl border border-cinema-border/50 text-xs font-semibold text-cinema-muted flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Director Mode — Watching contestants guess</span>
                      </div>
                    ) : (
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
                            className="w-full bg-cinema-dark/90 border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={isLocked || !inputs[key]?.trim()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-xs shadow-md shadow-brand-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                          >
                            Guess
                          </button>
                        </div>

                        {lastFeedback[key] && (
                          <div className="text-[11px] font-semibold text-red-400 flex items-center gap-1 pl-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{lastFeedback[key]}</span>
                          </div>
                        )}
                      </form>
                    )
                  ) : (
                    <div className="text-center py-1 flex items-center justify-center gap-2 text-xs font-semibold">
                      {isSolved ? (
                        <div className="flex items-center gap-2">
                          {sharedAnswer?.solvedByAvatar && (
                            <img
                              src={sharedAnswer.solvedByAvatar}
                              alt={sharedAnswer.solvedByName}
                              className="w-5 h-5 rounded-full border border-emerald-400"
                            />
                          )}
                          <span className="text-emerald-400">
                            {sharedAnswer ? `⚡ Solved by ${sharedAnswer.solvedByName} (+250 pts)` : '✨ Solved!'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-400/90">
                          🔒 Round Finished — Answer Locked
                        </span>
                      )}
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
