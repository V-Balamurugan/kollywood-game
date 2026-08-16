import React, { useState, useEffect } from 'react';
import { 
  Film, Search, Play, ExternalLink, Sparkles, Clapperboard, 
  Music, User, Heart, ArrowLeft, Database, SlidersHorizontal, BookOpen
} from 'lucide-react';
import { Puzzle } from '../types/game';
import { getAllPuzzles, syncGlobalCustomPuzzles } from '../services/puzzleManager';

interface LibraryProps {
  onBack: () => void;
  onSelectMovieForMatch?: (puzzle: Puzzle) => void;
}

export const Library: React.FC<LibraryProps> = ({ onBack, onSelectMovieForMatch }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'curated' | 'community'>('all');
  const [selectedMovie, setSelectedMovie] = useState<Puzzle | null>(null);

  useEffect(() => {
    // Load and sync all available database movies
    syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
  }, []);

  // Filter logic
  const filteredPuzzles = puzzles.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.movie.name.toLowerCase().includes(term) ||
      p.hero.name.toLowerCase().includes(term) ||
      p.heroine.name.toLowerCase().includes(term) ||
      p.song.name.toLowerCase().includes(term) ||
      (p.director && p.director.toLowerCase().includes(term)) ||
      (p.musicDirector && p.musicDirector.toLowerCase().includes(term)) ||
      (p.genre && p.genre.toLowerCase().includes(term));

    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    
    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'community' && Boolean(p.createdBy)) ||
      (selectedType === 'curated' && !p.createdBy);

    return matchesSearch && matchesDiff && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Arena
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-black shadow-lg shadow-brand-500/20 flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
                Movie Library & Clues
              </h1>
              <p className="text-[11px] sm:text-xs text-cinema-muted">
                Complete catalogue of {puzzles.length} Tamil cinema films stored in the database.
              </p>
            </div>
          </div>
        </div>

        {/* View-Only Badge */}
        <div className="flex items-center gap-2 bg-cinema-dark/80 border border-cinema-border/70 px-3 py-1.5 rounded-2xl text-xs text-cinema-muted self-start md:self-auto">
          <Database className="w-4 h-4 text-brand-400" />
          <span>{filteredPuzzles.length} Films Listed</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-3.5 sm:p-4 rounded-3xl border border-cinema-border/70 mb-6 sm:mb-8 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Movie, Actor, Actress, Director, Music, or Song..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-cinema-muted/60 focus:outline-none"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:flex items-center gap-2">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-cinema-dark border border-cinema-border rounded-xl px-2.5 sm:px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (Blockbusters)</option>
              <option value="medium">Medium (Hit Films)</option>
              <option value="hard">Hard (Cult Classics)</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-cinema-dark border border-cinema-border rounded-xl px-2.5 sm:px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Collections</option>
              <option value="curated">🎬 Official Curated</option>
              <option value="community">🎨 Player Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid Showcase */}
      {filteredPuzzles.length === 0 ? (
        <div className="text-center py-12 sm:py-16 glass-card rounded-3xl border border-cinema-border/50">
          <Film className="w-10 h-10 sm:w-12 sm:h-12 text-cinema-muted mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">No movies matched your search</h3>
          <p className="text-xs text-cinema-muted">Try a different search term or reset the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">

          {filteredPuzzles.map((p) => (
            <div
              key={p.id}
              className="glass-card rounded-3xl p-5 border border-cinema-border/70 hover:border-brand-500/50 transition-all flex flex-col justify-between group shadow-xl hover:shadow-brand-500/10"
            >
              <div>
                {/* Header: Poster + Title + Director */}
                <div className="flex items-start gap-3.5 border-b border-cinema-border/40 pb-3.5 mb-3.5">
                  <img
                    src={p.movie.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.movie.name}`}
                    alt={p.movie.name}
                    className="w-16 h-22 rounded-2xl object-cover border border-cinema-border flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        p.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {p.difficulty}
                      </span>
                      {p.createdBy ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/40 truncate max-w-[120px]">
                          🎨 {p.createdBy}
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-cinema-dark text-slate-300 border border-cinema-border/50">
                          🎬 Curated
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-white text-lg leading-tight truncate">
                      {p.movie.name}
                    </h3>
                    <span className="text-xs text-brand-400 font-semibold block">
                      {p.year} {p.genre ? `• ${p.genre}` : ''}
                    </span>
                    <span className="text-[11px] text-cinema-muted block truncate mt-0.5">
                      Dir: <strong className="text-slate-200">{p.director || 'Tamil Cinema'}</strong>
                    </span>
                  </div>
                </div>

                {/* 2x2 Clues Presentation */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
                  {/* Hero */}
                  <div className="p-2 rounded-xl bg-cinema-dark/70 border border-cinema-border/40 flex items-center gap-2">
                    <img
                      src={p.hero.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.hero.name}`}
                      alt={p.hero.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <span className="text-[9px] text-cinema-muted block uppercase font-bold">Hero ({p.hero.firstLetter})</span>
                      <span className="font-semibold text-white truncate block">{p.hero.name}</span>
                    </div>
                  </div>

                  {/* Heroine */}
                  <div className="p-2 rounded-xl bg-cinema-dark/70 border border-cinema-border/40 flex items-center gap-2">
                    <img
                      src={p.heroine.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.heroine.name}`}
                      alt={p.heroine.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <span className="text-[9px] text-cinema-muted block uppercase font-bold">Heroine ({p.heroine.firstLetter})</span>
                      <span className="font-semibold text-white truncate block">{p.heroine.name}</span>
                    </div>
                  </div>

                  {/* Song */}
                  <div className="p-2 rounded-xl bg-cinema-dark/70 border border-cinema-border/40 flex items-center gap-2 col-span-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0">
                      <Play className="w-3.5 h-3.5 fill-red-400" />
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-[9px] text-cinema-muted block uppercase font-bold">Song ({p.song.firstLetter})</span>
                      <span className="font-semibold text-white truncate block">{p.song.name}</span>
                    </div>
                    {p.song.youtubeId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${p.song.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 p-1 hover:bg-brand-500/10 rounded-lg transition-colors"
                      >
                        <span>Listen</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Plot Trivia */}
                {p.trivia && (
                  <p className="text-[11px] text-cinema-muted italic border-t border-cinema-border/30 pt-2.5 line-clamp-2">
                    "{p.trivia}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
