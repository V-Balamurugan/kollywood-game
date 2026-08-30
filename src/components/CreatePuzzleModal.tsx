import React, { useState, useEffect } from 'react';
import {
  Film, Sparkles, X, Music, Heart, User, Clapperboard,
  Database, Search, AlertCircle, Eye, Wand2, Info,
  Star, ChevronRight, Layers, ExternalLink, Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { Puzzle } from '../types/game';
import { getAllPuzzles } from '../services/puzzleManager';
import {
  searchMovieCandidates,
  fetchFullMovieDetailsByQid,
  MovieCandidate,
  FullMovieDetails,
  FullCastPerson,
  WIKIDATA_WEB_URL
} from '../services/wikidataCast';

interface CreatePuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (puzzle: Puzzle) => void;
  creatorName: string;
  creatorUid?: string;
  initialPuzzle?: Puzzle | null;
  modalTitle?: string;
  modalSubtitle?: string;
}

export const CreatePuzzleModal: React.FC<CreatePuzzleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  creatorName,
  creatorUid,
  initialPuzzle,
  modalTitle,
  modalSubtitle
}) => {
  const [existingDbPuzzles, setExistingDbPuzzles] = useState<Puzzle[]>([]);
  const [selectedDbMovieId, setSelectedDbMovieId] = useState<string>('');

  // Search & Disambiguation State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MovieCandidate[]>([]);

  // Fetched Details
  const [fetchedDetails, setFetchedDetails] = useState<FullMovieDetails | null>(null);

  // Form Fields (Director-Controlled Display Names)
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState<number>(2024);
  const [moviePoster, setMoviePoster] = useState('');
  const [director, setDirector] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  const [genre, setGenre] = useState('Action / Drama');
  const [overview, setOverview] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Hero State
  const [heroCanonicalName, setHeroCanonicalName] = useState('');
  const [heroDisplayName, setHeroDisplayName] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroQid, setHeroQid] = useState('');

  // Heroine State
  const [heroineCanonicalName, setHeroineCanonicalName] = useState('');
  const [heroineDisplayName, setHeroineDisplayName] = useState('');
  const [heroineImageUrl, setHeroineImageUrl] = useState('');
  const [heroineQid, setHeroineQid] = useState('');

  // Song State
  const [songTitle, setSongTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  // UI Tabs & Notices
  const [activeTab, setActiveTab] = useState<'review' | 'preview'>('review');
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setExistingDbPuzzles(getAllPuzzles());
      setStatusNotice(null);
      setCandidates([]);
      setLoadingStep(null);

      if (initialPuzzle) {
        setMovieTitle(initialPuzzle.movie.displayName || initialPuzzle.movie.name);
        setMovieYear(initialPuzzle.year || 2024);
        setMoviePoster(initialPuzzle.posterUrl || initialPuzzle.movie.imageUrl || '');
        setDirector(initialPuzzle.director || '');
        setMusicDirector(initialPuzzle.musicDirector || '');
        setGenre(initialPuzzle.genre || 'Action / Drama');
        setOverview(initialPuzzle.trivia || '');
        setDifficulty(initialPuzzle.difficulty || 'medium');
        setHeroCanonicalName(initialPuzzle.hero.canonicalName || initialPuzzle.hero.name);
        setHeroDisplayName(initialPuzzle.hero.displayName || initialPuzzle.hero.name);
        setHeroImageUrl(initialPuzzle.hero.imageUrl || '');
        setHeroQid(initialPuzzle.hero.wikidataId || '');
        setHeroineCanonicalName(initialPuzzle.heroine.canonicalName || initialPuzzle.heroine.name);
        setHeroineDisplayName(initialPuzzle.heroine.displayName || initialPuzzle.heroine.name);
        setHeroineImageUrl(initialPuzzle.heroine.imageUrl || '');
        setHeroineQid(initialPuzzle.heroine.wikidataId || '');
        setSongTitle(initialPuzzle.song.displayName || initialPuzzle.song.name);
        setYoutubeId(initialPuzzle.song.youtubeId || '');
      } else {
        setMovieTitle('');
        setMovieYear(2024);
        setMoviePoster('');
        setDirector('');
        setMusicDirector('');
        setGenre('Action / Drama');
        setOverview('');
        setDifficulty('medium');
        setHeroCanonicalName('');
        setHeroDisplayName('');
        setHeroImageUrl('');
        setHeroQid('');
        setHeroineCanonicalName('');
        setHeroineDisplayName('');
        setHeroineImageUrl('');
        setHeroineQid('');
        setSongTitle('');
        setYoutubeId('');
      }
    }
  }, [isOpen, initialPuzzle]);

  if (!isOpen) return null;

  const handleSelectDbMovie = (puzzleId: string) => {
    setSelectedDbMovieId(puzzleId);
    if (!puzzleId) return;
    const found = existingDbPuzzles.find((p) => p.id === puzzleId);
    if (found) {
      setMovieTitle(found.movie.displayName || found.movie.name);
      setMovieYear(found.year || 2024);
      setMoviePoster(found.posterUrl || found.movie.imageUrl || '');
      setDirector(found.director || '');
      setMusicDirector(found.musicDirector || '');
      setGenre(found.genre || 'Action / Drama');
      setOverview(found.trivia || '');
      setDifficulty(found.difficulty || 'medium');
      setHeroCanonicalName(found.hero.canonicalName || found.hero.name);
      setHeroDisplayName(found.hero.displayName || found.hero.name);
      setHeroImageUrl(found.hero.imageUrl || '');
      setHeroineCanonicalName(found.heroine.canonicalName || found.heroine.name);
      setHeroineDisplayName(found.heroine.displayName || found.heroine.name);
      setHeroineImageUrl(found.heroine.imageUrl || '');
      setSongTitle(found.song.displayName || found.song.name);
      setYoutubeId(found.song.youtubeId || '');
      setStatusNotice({
        text: `Loaded "${found.movie.name}" from curated library. You can customize any field!`,
        type: 'info'
      });
    }
  };

  const handleSearchMovie = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setLoadingStep('Searching Wikidata cinema database...');
    setStatusNotice(null);
    setCandidates([]);

    try {
      const results = await searchMovieCandidates(query);
      if (results.length === 0) {
        setStatusNotice({
          text: `No movie matches found on Wikidata for "${query}". You can fill in the fields manually.`,
          type: 'error'
        });
        return;
      }

      if (results.length === 1) {
        await handleFetchFullDetails(results[0].qid, results[0].cleanTitle);
      } else {
        setCandidates(results);
        setStatusNotice({
          text: `Found ${results.length} movie versions on Wikidata. Please select the correct version below.`,
          type: 'info'
        });
      }
    } catch (err: any) {
      setStatusNotice({
        text: `Search error: ${err?.message || 'Failed to query Wikidata.'}`,
        type: 'error'
      });
    } finally {
      setIsSearching(false);
      setLoadingStep(null);
    }
  };

  const handleFetchFullDetails = async (qid: string, defaultTitle: string) => {
    setIsSearching(true);
    setLoadingStep('Auto-fetching movie cast, director, poster and photos from Wikimedia...');
    try {
      const details = await fetchFullMovieDetailsByQid(qid, defaultTitle);
      if (!details) {
        setStatusNotice({
          text: `Could not fetch details for "${defaultTitle}".`,
          type: 'error'
        });
        return;
      }
      setFetchedDetails(details);
      setCandidates([]);

      setMovieTitle(details.suggestedDisplayTitle || details.movieTitle);
      if (details.year) setMovieYear(details.year);
      if (details.director) setDirector(details.director);
      if (details.musicDirector) setMusicDirector(details.musicDirector);
      if (details.genre) setGenre(details.genre);
      if (details.overview) setOverview(details.overview);
      if (details.posterUrl) setMoviePoster(details.posterUrl);

      if (details.hero) {
        setHeroCanonicalName(details.hero.canonicalName);
        setHeroDisplayName(details.hero.suggestedDisplayName);
        setHeroImageUrl(details.hero.imageUrl || '');
        setHeroQid(details.hero.id);
      }

      if (details.heroine) {
        setHeroineCanonicalName(details.heroine.canonicalName);
        setHeroineDisplayName(details.heroine.suggestedDisplayName);
        setHeroineImageUrl(details.heroine.imageUrl || '');
        setHeroineQid(details.heroine.id);
      }

      setStatusNotice({
        text: `✓ Auto-fetched data for "${details.movieTitle}"! Review & customize display names.`,
        type: 'success'
      });
    } catch (err: any) {
      setStatusNotice({
        text: `Error fetching details: ${err?.message || 'Could not fetch cast details.'}`,
        type: 'error'
      });
    } finally {
      setIsSearching(false);
      setLoadingStep(null);
    }
  };

  const handleSelectCandidate = (candidate: MovieCandidate) => {
    handleFetchFullDetails(candidate.qid, candidate.cleanTitle);
  };

  const handleSetHeroFromCast = (person: FullCastPerson) => {
    setHeroCanonicalName(person.canonicalName);
    setHeroDisplayName(person.suggestedDisplayName);
    setHeroImageUrl(person.imageUrl || '');
    setHeroQid(person.id);
    setStatusNotice({
      text: `Hero updated to: ${person.suggestedDisplayName} (${person.canonicalName})`,
      type: 'info'
    });
  };

  const handleSetHeroineFromCast = (person: FullCastPerson) => {
    setHeroineCanonicalName(person.canonicalName);
    setHeroineDisplayName(person.suggestedDisplayName);
    setHeroineImageUrl(person.imageUrl || '');
    setHeroineQid(person.id);
    setStatusNotice({
      text: `Heroine updated to: ${person.suggestedDisplayName} (${person.canonicalName})`,
      type: 'info'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!movieTitle.trim()) {
      setStatusNotice({ text: 'Please provide a movie title.', type: 'error' });
      return;
    }
    if (!heroDisplayName.trim()) {
      setStatusNotice({ text: 'Please provide the Hero display name.', type: 'error' });
      return;
    }
    if (!heroineDisplayName.trim()) {
      setStatusNotice({ text: 'Please provide the Heroine display name.', type: 'error' });
      return;
    }
    if (!songTitle.trim()) {
      setStatusNotice({ text: 'Please provide a hit song title.', type: 'error' });
      return;
    }

    const puzzleId = initialPuzzle?.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const puzzle: Puzzle = {
      id: puzzleId,
      year: movieYear || 2024,
      director: director.trim() || undefined,
      musicDirector: musicDirector.trim() || undefined,
      genre: genre.trim() || 'Action / Drama',
      trivia: overview.trim() || undefined,
      difficulty,
      createdBy: creatorName,
      creatorUid: creatorUid || undefined,
      posterUrl: moviePoster.trim() || undefined,
      wikidataId: fetchedDetails?.qid || undefined,
      movie: {
        name: movieTitle.trim(),
        displayName: movieTitle.trim(),
        firstLetter: (movieTitle.trim().charAt(0) || 'M').toUpperCase(),
        imageUrl: moviePoster.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${movieTitle.trim()}`,
        aliases: [movieTitle.trim()]
      },
      hero: {
        name: heroDisplayName.trim(),
        displayName: heroDisplayName.trim(),
        canonicalName: heroCanonicalName.trim() || heroDisplayName.trim(),
        wikidataId: heroQid || undefined,
        firstLetter: (heroDisplayName.trim().charAt(0) || 'H').toUpperCase(),
        imageUrl: heroImageUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroDisplayName.trim()}`,
        aliases: [heroDisplayName.trim(), heroCanonicalName.trim()].filter(Boolean)
      },
      heroine: {
        name: heroineDisplayName.trim(),
        displayName: heroineDisplayName.trim(),
        canonicalName: heroineCanonicalName.trim() || heroineDisplayName.trim(),
        wikidataId: heroineQid || undefined,
        firstLetter: (heroineDisplayName.trim().charAt(0) || 'H').toUpperCase(),
        imageUrl: heroineImageUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroineDisplayName.trim()}`,
        aliases: [heroineDisplayName.trim(), heroineCanonicalName.trim()].filter(Boolean)
      },
      song: {
        name: songTitle.trim(),
        displayName: songTitle.trim(),
        firstLetter: (songTitle.trim().charAt(0) || 'S').toUpperCase(),
        youtubeId: youtubeId.trim() || '',
        aliases: [songTitle.trim()]
      }
    };

    onSubmit(puzzle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c101a] border border-slate-800 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] my-auto max-h-[94vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#070a12] hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors z-10 cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#070a12] border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] flex-shrink-0">
            <Clapperboard className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
                {modalTitle || "Director's Movie Crafting"}
              </h3>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-black px-2.5 py-0.5 rounded-full uppercase">
                Auto-Fetch
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {modalSubtitle || "Enter movie title to auto-fetch info & photos. You control the exact display names!"}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#070a12] border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'review'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>1. Auto-Fetch & Edit Display Names</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. Live Contestant 2×2 Preview</span>
          </button>
        </div>

        {/* Dynamic Status Notice Banner */}
        {statusNotice && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 mb-4 border transition-all animate-fade-in ${
              statusNotice.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : statusNotice.type === 'error'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : statusNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            )}
            <span className="font-semibold">{statusNotice.text}</span>
          </div>
        )}

        {/* Loading Progress */}
        {loadingStep && (
          <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 mb-4 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{loadingStep}</span>
            </div>
            <div className="w-full bg-[#070a12] rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-teal-300 h-full w-3/4 rounded-full animate-indeterminate shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>
          </div>
        )}

        {activeTab === 'review' ? (
          <div className="space-y-4">
            {/* SEARCH BAR */}
            <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Search className="w-4 h-4" />
                  Enter Movie Title to Auto-Fetch:
                </span>
                <span className="text-[10px] text-slate-500 font-bold lowercase">e.g. Leo, Vikram, Master, 96, Ghilli</span>
              </label>

              <form onSubmit={handleSearchMovie} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type Tamil movie title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="py-2.5 px-4 sm:px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex-shrink-0 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'Fetching...' : '⚡ Auto-Fetch'}</span>
                </button>
              </form>
            </div>

            {/* CANDIDATES */}
            {candidates.length > 0 && (
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Multiple Versions Found — Select One:
                  </span>
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {candidates.length} versions
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {candidates.map((c) => (
                    <div
                      key={c.qid}
                      className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800 hover:border-cyan-500/60 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{c.cleanTitle}</span>
                          {c.year && (
                            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded font-black border border-cyan-500/30">
                              {c.year}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.snippet}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCandidate(c)}
                        className="py-1.5 px-3 rounded-xl bg-cyan-400 text-black text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer hover:bg-cyan-300 transition-all"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Preset Selector */}
            <div className="p-3 rounded-2xl bg-[#070a12] border border-slate-800 flex items-center justify-between gap-2.5 text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Pick Existing Movie:
              </span>
              <select
                value={selectedDbMovieId}
                onChange={(e) => handleSelectDbMovie(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">-- Choose from Curated Library --</option>
                {existingDbPuzzles.map((p) => (
                  <option key={p.id} value={p.id}>
                    🎬 {p.movie.name} ({p.year}) - Dir: {p.director || 'Kollywood'}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* SECTION A: MOVIE METADATA */}
              <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>🎬 Movie Information</span>
                  </h4>
                  {fetchedDetails?.qid && (
                    <a
                      href={`${WIKIDATA_WEB_URL}/${fetchedDetails.qid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <span>Wikidata: {fetchedDetails.qid}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Leo, Master, Vikram"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={movieYear}
                      onChange={(e) => setMovieYear(parseInt(e.target.value, 10) || 2024)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Film Director (Clue)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lokesh Kanagaraj, Nelson, Shankar"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Music Composer (Clue)</label>
                    <input
                      type="text"
                      placeholder="e.g. Anirudh, AR Rahman, Yuvan"
                      value={musicDirector}
                      onChange={(e) => setMusicDirector(e.target.value)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Genre</label>
                    <input
                      type="text"
                      placeholder="e.g. Action Thriller, Rom-Com"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="easy">Easy (Blockbusters & Mass Hits)</option>
                      <option value="medium">Medium (Standard Popular Hits)</option>
                      <option value="hard">Hard (Tricky Classics & Cult Hits)</option>
                    </select>
                  </div>
                </div>

                {/* Movie Poster Banner */}
                <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-[#070a12] border border-slate-800 flex-shrink-0 shadow-inner">
                      {moviePoster ? (
                        <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-slate-500">
                          <ImageIcon className="w-5 h-5 mb-1 text-cyan-400" />
                          <span className="text-[8px] font-bold">No Poster</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-300">
                          🎬 Movie Poster URL (Auto-fetched or custom)
                        </label>
                        {moviePoster && (
                          <span className="text-[9px] bg-cyan-950/80 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                            Poster Active
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={moviePoster}
                        onChange={(e) => setMoviePoster(e.target.value)}
                        className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Plot Overview / Trivia Clue
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Storyline synopsis..."
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* SECTION B: MAIN CAST */}
              <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 space-y-4">
                <div className="pb-1.5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-cyan-400" />
                      <span>⭐ Main Cast & Display Names</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Players see ONLY the Display Name you specify below!
                    </p>
                  </div>
                </div>

                {/* 1. HERO */}
                <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-cyan-500/30 space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#070a12] border border-cyan-500/40 flex-shrink-0 shadow-inner">
                      {heroImageUrl ? (
                        <img
                          src={heroImageUrl}
                          alt={heroDisplayName || 'Hero'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-cyan-950/40 text-cyan-300">
                          <User className="w-6 h-6 mb-1 text-cyan-400" />
                          <span className="text-[8px] font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Hero (Lead Actor) *</span>
                        </span>
                        {heroDisplayName && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950/80 text-cyan-300 rounded-lg border border-cyan-500/40">
                            Starts: {heroDisplayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {heroCanonicalName && (
                        <div className="text-[11px] text-cyan-200 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                          <span>
                            <strong>Wikidata API:</strong> {heroCanonicalName}
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-cyan-300 mb-0.5">
                          Player Guess Display Name:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vijay, Rajinikanth, Kamal Haasan"
                          value={heroDisplayName}
                          onChange={(e) => setHeroDisplayName(e.target.value)}
                          className="w-full bg-[#070a12] border-2 border-cyan-500/50 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {fetchedDetails?.cast && fetchedDetails.cast.length > 0 && (
                    <div className="pt-2 border-t border-cyan-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-cyan-300 block">
                        Switch Hero to Discovered Cast:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {fetchedDetails.cast
                          .filter((c) => c.gender === 'male' && c.canonicalName !== heroCanonicalName)
                          .map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleSetHeroFromCast(person)}
                              className="px-2 py-0.5 rounded-lg bg-[#070a12] hover:bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              + Set: {person.suggestedDisplayName || person.canonicalName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. HEROINE */}
                <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-pink-500/30 space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#070a12] border border-pink-500/40 flex-shrink-0 shadow-inner">
                      {heroineImageUrl ? (
                        <img
                          src={heroineImageUrl}
                          alt={heroineDisplayName || 'Heroine'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-pink-950/40 text-pink-300">
                          <Heart className="w-6 h-6 mb-1 text-pink-400" />
                          <span className="text-[8px] font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-300 uppercase flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-pink-400" />
                          <span>Heroine (Lead Actress) *</span>
                        </span>
                        {heroineDisplayName && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-pink-950/80 text-pink-300 rounded-lg border border-pink-500/40">
                            Starts: {heroineDisplayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {heroineCanonicalName && (
                        <div className="text-[11px] text-pink-200 bg-pink-950/40 px-2.5 py-1 rounded-lg border border-pink-500/30 flex items-center justify-between">
                          <span>
                            <strong>Wikidata API:</strong> {heroineCanonicalName}
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-pink-300 mb-0.5">
                          Player Guess Display Name:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Trisha, Nayanthara, Samantha"
                          value={heroineDisplayName}
                          onChange={(e) => setHeroineDisplayName(e.target.value)}
                          className="w-full bg-[#070a12] border-2 border-pink-500/50 focus:border-pink-400 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {fetchedDetails?.cast && fetchedDetails.cast.length > 0 && (
                    <div className="pt-2 border-t border-pink-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-pink-300 block">
                        Switch Heroine to Discovered Cast:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {fetchedDetails.cast
                          .filter((c) => c.gender === 'female' && c.canonicalName !== heroineCanonicalName)
                          .map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleSetHeroineFromCast(person)}
                              className="px-2 py-0.5 rounded-lg bg-[#070a12] hover:bg-pink-950/40 border border-pink-500/30 text-pink-300 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              + Set: {person.suggestedDisplayName || person.canonicalName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SONG */}
                <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-purple-400" />
                      <span>Hit Song Title *</span>
                    </span>
                    {songTitle && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-950/80 text-purple-300 rounded-lg border border-purple-500/40">
                        Starts: {songTitle.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Naa Ready, Hukum, Arabic Kuthu"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="w-full bg-[#070a12] border-2 border-purple-500/50 focus:border-purple-400 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="YouTube ID (e.g. szvt1vD0Uug)"
                        value={youtubeId}
                        onChange={(e) => setYoutubeId(e.target.value)}
                        className="w-full bg-[#070a12] border border-slate-800 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-full bg-[#070a12] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clapperboard className="w-4 h-4 fill-black text-black" />
                  <span>Save & Launch Movie</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: LIVE CONTESTANT 2x2 PREVIEW */
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-[#070a12] border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Contestant Game View Preview
                </h4>
                <p className="text-[11px] text-slate-400">
                  Players see only the photos, first letters, and director-approved display names!
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase">
                {difficulty}
              </span>
            </div>

            {/* 2x2 Grid View */}
            <div className="grid grid-cols-2 gap-3">
              {/* Hero Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-cyan-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Hero</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950/80 text-cyan-300 rounded-md border border-cyan-500/30">
                    {heroDisplayName ? heroDisplayName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#070a12] border border-cyan-500/30">
                  {heroImageUrl ? (
                    <img src={heroImageUrl} alt={heroDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-cyan-400 font-bold">
                      Avatar
                    </div>
                  )}
                </div>
                <div className="font-bold text-white text-sm truncate">
                  {heroDisplayName || <span className="text-slate-500 italic">Enter Hero Name</span>}
                </div>
              </div>

              {/* Heroine Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-pink-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-pink-400">Heroine</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-pink-950/80 text-pink-300 rounded-md border border-pink-500/30">
                    {heroineDisplayName ? heroineDisplayName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#070a12] border border-pink-500/30">
                  {heroineImageUrl ? (
                    <img src={heroineImageUrl} alt={heroineDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-pink-400 font-bold">
                      Avatar
                    </div>
                  )}
                </div>
                <div className="font-bold text-white text-sm truncate">
                  {heroineDisplayName || <span className="text-slate-500 italic">Enter Heroine Name</span>}
                </div>
              </div>

              {/* Movie Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-teal-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-400">Movie</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-teal-950/80 text-teal-300 rounded-md border border-teal-500/30">
                    {movieTitle ? movieTitle.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#070a12] border border-teal-500/30">
                  {moviePoster ? (
                    <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-teal-400 font-bold">
                      Poster
                    </div>
                  )}
                </div>
                <div className="font-bold text-white text-sm truncate">
                  {movieTitle || <span className="text-slate-500 italic">Enter Movie Title</span>}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {movieYear} • {genre}
                </div>
              </div>

              {/* Song Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c101a] border border-purple-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-400">Song</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-950/80 text-purple-300 rounded-md border border-purple-500/30">
                    {songTitle ? songTitle.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="font-bold text-white text-sm truncate">
                  {songTitle || <span className="text-slate-500 italic">Enter Song Title</span>}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {youtubeId ? '🎵 Audio Clue Attached' : 'Audio Clue Optional'}
                </div>
              </div>
            </div>

            {/* Clue Summary */}
            <div className="p-3.5 rounded-2xl bg-[#070a12] border border-slate-800 space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>
                  <strong className="text-white">Director:</strong> {director || 'Not specified'}
                </span>
                <span>
                  <strong className="text-white">Music:</strong> {musicDirector || 'Not specified'}
                </span>
              </div>
              {overview && (
                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                  "{overview}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className="flex-1 py-3.5 rounded-full bg-[#070a12] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                ✏️ Return to Edit Display Names
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="flex-1 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clapperboard className="w-4 h-4 fill-black text-black" />
                <span>Save & Launch Movie</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
