import React, { useState, useEffect } from 'react';
import { Film, Sparkles, X, Play, Music, Heart, User, Clapperboard, HelpCircle, Database, Search } from 'lucide-react';
import { Puzzle } from '../types/game';
import { getAllPuzzles } from '../services/puzzleManager';

interface CreatePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (puzzle: Puzzle) => void;
  creatorName: string;
  creatorUid?: string;
}

export const CreatePuzzleModal: React.FC<CreatePuzzleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  creatorName,
  creatorUid
}) => {
  const [existingDbPuzzles, setExistingDbPuzzles] = useState<Puzzle[]>([]);
  const [selectedDbMovieId, setSelectedDbMovieId] = useState<string>('');

  const [movieName, setMovieName] = useState('');
  const [movieYear, setMovieYear] = useState<number>(2024);
  const [moviePoster, setMoviePoster] = useState('');
  const [director, setDirector] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  const [genre, setGenre] = useState('Action / Drama');
  const [trivia, setTrivia] = useState('');
  const [heroName, setHeroName] = useState('');
  const [heroineName, setHeroineName] = useState('');
  const [songName, setSongName] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [omdbLoading, setOmdbLoading] = useState(false);
  const [omdbNotice, setOmdbNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setExistingDbPuzzles(getAllPuzzles());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle selecting a base movie from the database to clone / customize
  const handleSelectDbMovie = (id: string) => {
    setSelectedDbMovieId(id);
    if (!id) return;

    const chosen = existingDbPuzzles.find(p => p.id === id);
    if (chosen) {
      setMovieName(chosen.movie.name);
      setMovieYear(chosen.year || 2024);
      setMoviePoster(chosen.movie.imageUrl || '');
      setDirector(chosen.director || '');
      setMusicDirector(chosen.musicDirector || '');
      setGenre(chosen.genre || 'Action / Drama');
      setTrivia(chosen.trivia || '');
      setHeroName(chosen.hero.name);
      setHeroineName(chosen.heroine.name);
      setSongName(chosen.song.name);
      setYoutubeId(chosen.song.youtubeId || '');
      setDifficulty(chosen.difficulty || 'medium');
      setOmdbNotice(`✓ Loaded "${chosen.movie.name}" from Database! You can now customize any fields.`);
    }
  };

  const handleOmdbFetch = async () => {
    if (!movieName.trim()) return;
    setOmdbLoading(true);
    setOmdbNotice(null);

    const apiKey = import.meta.env.VITE_OMDB_API_KEY || '140528bd';

    try {
      let url = `http://www.omdbapi.com/?t=${encodeURIComponent(movieName.trim())}&apikey=${apiKey}`;
      if (movieYear) url += `&y=${movieYear}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === 'True') {
        if (data.Poster && data.Poster !== 'N/A') setMoviePoster(data.Poster);
        if (data.Director && data.Director !== 'N/A') setDirector(data.Director);
        if (data.Genre && data.Genre !== 'N/A') setGenre(data.Genre);
        if (data.Plot && data.Plot !== 'N/A') setTrivia(data.Plot);
        if (data.Year) setMovieYear(parseInt(data.Year, 10) || movieYear);
        setOmdbNotice(`✓ Found Tamil Film: ${data.Title} (${data.Year}) - ${data.Genre || ''}`);
      } else {
        setOmdbNotice('Movie not found on OMDB. You can enter details manually.');
      }
    } catch {
      setOmdbNotice('OMDB lookup failed. Please enter details manually.');
    } finally {
      setOmdbLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim() || !heroName.trim() || !heroineName.trim() || !songName.trim()) {
      alert('Please fill in Movie, Hero, Heroine, and Song.');
      return;
    }

    const cleanId = 'custom-' + movieName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    const puzzle: Puzzle = {
      id: cleanId,
      year: movieYear,
      difficulty,
      director: director.trim() || 'Kollywood Cinema',
      musicDirector: musicDirector.trim() || 'Tamil Music',
      genre: genre.trim() || 'Kollywood Blockbuster',
      trivia: trivia.trim() || `Iconic Tamil film created by ${creatorName}`,
      createdBy: creatorName,
      creatorUid: creatorUid,
      movie: {
        name: movieName.trim(),
        firstLetter: movieName.trim().charAt(0).toUpperCase(),
        imageUrl: moviePoster.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${movieName.trim()}`,
        aliases: [movieName.trim()]
      },
      hero: {
        name: heroName.trim(),
        firstLetter: heroName.trim().charAt(0).toUpperCase(),
        imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${heroName.trim()}`,
        aliases: [heroName.trim()]
      },
      heroine: {
        name: heroineName.trim(),
        firstLetter: heroineName.trim().charAt(0).toUpperCase(),
        imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${heroineName.trim()}`,
        aliases: [heroineName.trim()]
      },
      song: {
        name: songName.trim(),
        firstLetter: songName.trim().charAt(0).toUpperCase(),
        youtubeId: youtubeId.trim(),
        aliases: [songName.trim()]
      }
    };

    onSubmit(puzzle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-cinema-card border border-cinema-border rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-brand-500/20 my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:top-5 p-2 rounded-xl bg-cinema-cardHover text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 sm:mb-6 pr-8">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-black shadow-lg shadow-brand-500/25 flex-shrink-0">
            <Clapperboard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white">
              Director's Movie Crafting
            </h3>
            <p className="text-[11px] sm:text-xs text-cinema-muted">
              Choose a movie from database to customize or create your own brand new Kollywood puzzle!
            </p>
          </div>
        </div>


        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Quick Database Selector / Preset Loader */}
          <div className="p-3.5 rounded-2xl bg-cinema-dark border border-brand-500/30 space-y-2">
            <div className="flex items-center gap-2 text-brand-300">
              <Database className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold">Load from Existing Database Movie (Quick Fill):</span>
            </div>
            <select
              value={selectedDbMovieId}
              onChange={(e) => handleSelectDbMovie(e.target.value)}
              className="w-full bg-cinema-cardHover border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose a Kollywood Movie from Database to Customize --</option>
              {existingDbPuzzles.map((p) => (
                <option key={p.id} value={p.id}>
                  🎬 {p.movie.name} ({p.year}) - Dir: {p.director || 'Kollywood'}
                </option>
              ))}
            </select>
          </div>

          {/* OMDB Scraper Integration */}
          <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex-1 text-xs">
              <span className="font-bold text-white block">Auto-Fetch Movie Poster & Trivia</span>
              <span className="text-cinema-muted text-[11px]">Type movie name and click fetch.</span>
            </div>
            <button
              type="button"
              onClick={handleOmdbFetch}
              disabled={omdbLoading || !movieName.trim()}
              className="py-2 px-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{omdbLoading ? 'Fetching...' : 'OMDB Auto-Fetch'}</span>
            </button>
          </div>

          {omdbNotice && (
            <div className="p-2.5 rounded-xl bg-cinema-dark border border-brand-500/40 text-xs text-brand-300">
              {omdbNotice}
            </div>
          )}

          {/* Movie Title & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Movie Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Leo, Jailer, Vikram"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Release Year</label>
              <input
                type="number"
                value={movieYear}
                onChange={(e) => setMovieYear(parseInt(e.target.value, 10) || 2024)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Director & Music Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Director (Clue 2)</label>
              <input
                type="text"
                placeholder="e.g. Lokesh Kanagaraj, Nelson, Mani Ratnam"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Music Director (Clue 2)</label>
              <input
                type="text"
                placeholder="e.g. Anirudh, AR Rahman, Harris Jayaraj"
                value={musicDirector}
                onChange={(e) => setMusicDirector(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Genre & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Genre (Clue 1)</label>
              <input
                type="text"
                placeholder="e.g. Action Thriller, Romantic Comedy"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="easy">Easy (Mass Hits & Blockbusters)</option>
                <option value="medium">Medium (Standard Tamil Hits)</option>
                <option value="hard">Hard (Cult Classics / Tricky Trivia)</option>
              </select>
            </div>
          </div>

          {/* Hero & Heroine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lead Actor (Hero) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vijay, Rajinikanth, Suriya"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lead Actress (Heroine) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Trisha, Nayanthara, Samantha"
                value={heroineName}
                onChange={(e) => setHeroineName(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Song & YouTube link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hit Song Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Naa Ready, Hukum, Arabic Kuthu"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube Video ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. szvt1vD0Uug"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Plot Trivia (Clue 3) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Plot Trivia / Storyline (Clue 3)</label>
            <textarea
              rows={2}
              placeholder="e.g. An animal rescuer living in Himachal Pradesh is targeted by a ruthless drug cartel..."
              value={trivia}
              onChange={(e) => setTrivia(e.target.value)}
              className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-cinema-cardHover border border-cinema-border text-slate-300 text-xs font-bold hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black text-xs sm:text-sm font-black shadow-xl shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              🎬 Launch Round with this Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
