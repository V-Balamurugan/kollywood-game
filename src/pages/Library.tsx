import React, { useState, useEffect } from 'react';
import {
  Film, Search, Play, ExternalLink, Clapperboard,
  Music, User, Heart, ArrowLeft, Database, SlidersHorizontal, BookOpen
} from 'lucide-react';
import { Puzzle } from '../types/game';
import { getAllPuzzles, syncGlobalCustomPuzzles, subscribeGlobalCustomPuzzles } from '../services/puzzleManager';

interface LibraryProps {
  onBack: () => void;
  onSelectMovieForMatch?: (puzzle: Puzzle) => void;
}

export const Library: React.FC<LibraryProps> = ({ onBack }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(() => getAllPuzzles());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'curated' | 'community'>('all');

  useEffect(() => {
    setPuzzles(getAllPuzzles());

    const unsubscribe = subscribeGlobalCustomPuzzles((syncedList) => {
      setPuzzles(syncedList);
    });

    syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));

    return () => {
      unsubscribe();
    };
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Lobby</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0c101a] border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] flex-shrink-0">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_20px_rgba(6,182,212,0.85)] uppercase tracking-tight">
                Movie Library & Clues
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Complete database of {puzzles.length} Tamil cinema blockbusters in the arena.
              </p>
            </div>
          </div>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2 bg-[#0c101a] border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400 self-start md:self-auto font-mono">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>{filteredPuzzles.length} Films Listed</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-4 sm:p-5 mb-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movie, hero, heroine, song, director..."
              className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-cyan-400 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff === 'all' ? 'All Tiers' : diff}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'curated', label: 'Curated' },
              { id: 'community', label: 'Community' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-cyan-400 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {filteredPuzzles.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#0c101a]/90 border border-slate-800">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">No movies matched your search</h3>
          <p className="text-xs text-slate-400">Try a different title, actor, or reset the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPuzzles.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 hover:border-cyan-500/50 p-5 transition-all flex flex-col justify-between group shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.1)]"
            >
              <div>
                {/* Poster & Details */}
                <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4 mb-4">
                  <img
                    src={p.movie.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.movie.name}`}
                    alt={p.movie.name}
                    className="w-16 h-22 rounded-2xl object-cover border border-slate-800 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                        p.difficulty === 'easy'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : p.difficulty === 'medium'
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}>
                        {p.difficulty}
                      </span>
                      {p.createdBy ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 truncate max-w-[120px]">
                          🎨 {p.createdBy}
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[#070a12] text-slate-400 border border-slate-800">
                          🎬 Curated
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-white text-lg leading-tight truncate">
                      {p.movie.name}
                    </h3>
                    <span className="text-xs text-cyan-400 font-bold block">
                      {p.year} {p.genre ? `• ${p.genre}` : ''}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      Dir: <strong className="text-slate-200">{p.director || 'Tamil Cinema'}</strong>
                    </span>
                  </div>
                </div>

                {/* 2x2 Clues Presentation */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
                  {/* Hero */}
                  <div className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800/80 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 font-bold text-xs">
                      {p.hero.firstLetter}
                    </div>
                    <div className="truncate">
                      <span className="text-[9px] text-cyan-400 block uppercase font-bold">Hero</span>
                      <span className="font-bold text-white truncate block">{p.hero.name}</span>
                    </div>
                  </div>

                  {/* Heroine */}
                  <div className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800/80 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0 font-bold text-xs">
                      {p.heroine.firstLetter}
                    </div>
                    <div className="truncate">
                      <span className="text-[9px] text-pink-400 block uppercase font-bold">Heroine</span>
                      <span className="font-bold text-white truncate block">{p.heroine.name}</span>
                    </div>
                  </div>

                  {/* Song */}
                  <div className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800/80 flex items-center gap-2 col-span-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-[9px] text-purple-400 block uppercase font-bold">Song ({p.song.firstLetter})</span>
                      <span className="font-bold text-white truncate block">{p.song.name}</span>
                    </div>
                    {p.song.youtubeId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${p.song.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 p-1 hover:bg-cyan-950/40 rounded-lg transition-colors"
                      >
                        <span>Audio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Plot Trivia */}
                {p.trivia && (
                  <p className="text-[11px] text-slate-400 italic border-t border-slate-800/60 pt-2.5 line-clamp-2">
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
