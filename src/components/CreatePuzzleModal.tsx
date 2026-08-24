import React, { useState, useEffect } from 'react';
import {
  Film, Sparkles, X, Play, Music, Heart, User, Clapperboard,
  Database, Search, Check, AlertCircle, Eye, RefreshCw, Wand2, Info,
  Star, ChevronRight, Layers, ExternalLink, Image as ImageIcon,
  CheckCircle2, ArrowRight
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
        setFetchedDetails(null);
      }
    }
  }, [isOpen, initialPuzzle]);

  if (!isOpen) return null;

  // Handle Quick Clone from Database
  const handleSelectDbMovie = (id: string) => {
    setSelectedDbMovieId(id);
    if (!id) return;

    const chosen = existingDbPuzzles.find((p) => p.id === id);
    if (chosen) {
      setMovieTitle(chosen.movie.name);
      setMovieYear(chosen.year || 2024);
      setMoviePoster(chosen.movie.imageUrl || '');
      setDirector(chosen.director || '');
      setMusicDirector(chosen.musicDirector || '');
      setGenre(chosen.genre || 'Action / Drama');
      setOverview(chosen.trivia || '');

      setHeroCanonicalName(chosen.hero.canonicalName || chosen.hero.name);
      setHeroDisplayName(chosen.hero.displayName || chosen.hero.name);
      setHeroImageUrl(chosen.hero.imageUrl || '');
      setHeroQid(chosen.hero.wikidataId || '');

      setHeroineCanonicalName(chosen.heroine.canonicalName || chosen.heroine.name);
      setHeroineDisplayName(chosen.heroine.displayName || chosen.heroine.name);
      setHeroineImageUrl(chosen.heroine.imageUrl || '');
      setHeroineQid(chosen.heroine.wikidataId || '');

      setSongTitle(chosen.song.name);
      setYoutubeId(chosen.song.youtubeId || '');
      setDifficulty(chosen.difficulty || 'medium');

      setFetchedDetails({
        qid: chosen.wikidataId || 'Q-custom',
        movieTitle: chosen.movie.name,
        suggestedDisplayTitle: chosen.movie.name,
        year: chosen.year,
        director: chosen.director,
        musicDirector: chosen.musicDirector,
        genre: chosen.genre,
        overview: chosen.trivia,
        posterUrl: chosen.movie.imageUrl,
        hero: {
          id: chosen.hero.wikidataId || 'hero',
          canonicalName: chosen.hero.canonicalName || chosen.hero.name,
          suggestedDisplayName: chosen.hero.displayName || chosen.hero.name,
          imageUrl: chosen.hero.imageUrl,
          gender: 'male',
          wikidataUrl: `${WIKIDATA_WEB_URL}/${chosen.hero.wikidataId || ''}`
        },
        heroine: {
          id: chosen.heroine.wikidataId || 'heroine',
          canonicalName: chosen.heroine.canonicalName || chosen.heroine.name,
          suggestedDisplayName: chosen.heroine.displayName || chosen.heroine.name,
          imageUrl: chosen.heroine.imageUrl,
          gender: 'female',
          wikidataUrl: `${WIKIDATA_WEB_URL}/${chosen.heroine.wikidataId || ''}`
        },
        cast: [],
        source: 'database'
      });

      setStatusNotice({
        text: `✓ Loaded "${chosen.movie.name}" from Database! Customize display names below.`,
        type: 'success'
      });
    }
  };

  // Step 1: Search Wikidata for movie candidates
  const handleSearchMovie = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = (searchQuery || movieTitle).trim();
    if (!query) {
      setStatusNotice({ text: 'Please enter a movie title (e.g. Leo, Vikram, Master, 96)', type: 'error' });
      return;
    }

    setIsSearching(true);
    setCandidates([]);
    setStatusNotice(null);
    setLoadingStep('🎬 Searching Wikidata for Tamil cinema matches...');

    try {
      const results = await searchMovieCandidates(query);

      if (results.length === 0) {
        setLoadingStep(null);
        setStatusNotice({
          text: `No exact matches found for "${query}". You can enter movie and cast details manually.`,
          type: 'info'
        });
        setMovieTitle(query);
      } else if (results.length === 1) {
        await handleSelectCandidate(results[0]);
      } else {
        setCandidates(results);
        setLoadingStep(null);
        setStatusNotice({
          text: `Found ${results.length} movie matches. Please select the specific film version below:`,
          type: 'info'
        });
      }
    } catch (err: any) {
      setLoadingStep(null);
      setStatusNotice({
        text: 'Wikidata search failed. You can enter details manually below.',
        type: 'error'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Step 2: Fetch full details for a chosen QID
  const handleSelectCandidate = async (candidate: MovieCandidate) => {
    setIsSearching(true);
    setCandidates([]);
    setLoadingStep('🔎 Resolving film metadata, director & music composer...');

    try {
      setLoadingStep('👥 Finding main cast & extracting character roles...');
      const details = await fetchFullMovieDetailsByQid(candidate.qid, candidate.cleanTitle);

      setLoadingStep('🖼️ Retrieving Wikimedia Commons profile pictures...');

      if (details) {
        setFetchedDetails(details);
        setMovieTitle(details.movieTitle);
        setMovieYear(details.year || candidate.year || 2024);
        if (details.director) setDirector(details.director);
        if (details.musicDirector) setMusicDirector(details.musicDirector);
        if (details.genre) setGenre(details.genre);
        if (details.overview || candidate.snippet) setOverview(details.overview || candidate.snippet);
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
          text: `✨ Loaded "${details.movieTitle}" (${details.year}) from Wikidata & Wikimedia Commons!`,
          type: 'success'
        });
      } else {
        setMovieTitle(candidate.cleanTitle);
        if (candidate.year) setMovieYear(candidate.year);
        if (candidate.snippet) setOverview(candidate.snippet);
      }
    } catch (err) {
      setStatusNotice({
        text: 'Failed to fetch detailed cast. You can input display names manually.',
        type: 'error'
      });
    } finally {
      setLoadingStep(null);
      setIsSearching(false);
    }
  };

  // Set Hero from Cast Candidate
  const handleSetHeroFromCast = (person: FullCastPerson) => {
    setHeroCanonicalName(person.canonicalName);
    setHeroDisplayName(person.suggestedDisplayName || person.canonicalName);
    setHeroImageUrl(person.imageUrl || '');
    setHeroQid(person.id);
  };

  // Set Heroine from Cast Candidate
  const handleSetHeroineFromCast = (person: FullCastPerson) => {
    setHeroineCanonicalName(person.canonicalName);
    setHeroineDisplayName(person.suggestedDisplayName || person.canonicalName);
    setHeroineImageUrl(person.imageUrl || '');
    setHeroineQid(person.id);
  };

  // Final Form Submission & Save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!movieTitle.trim()) {
      setStatusNotice({ text: 'Please enter or select a Movie Title.', type: 'error' });
      return;
    }

    const normalizedNewTitle = movieTitle.toLowerCase().trim();
    // Check if creating a new movie that already exists in the database
    const existingMatch = existingDbPuzzles.find(
      p => (!initialPuzzle || p.id !== initialPuzzle.id) && (
        p.movie.name.toLowerCase().trim() === normalizedNewTitle ||
        p.movie.canonicalName?.toLowerCase().trim() === normalizedNewTitle ||
        (fetchedDetails?.qid && p.wikidataId && p.wikidataId === fetchedDetails.qid)
      )
    );

    if (existingMatch && !initialPuzzle) {
      setStatusNotice({
        text: `⚠️ "${existingMatch.movie.name}" already exists in the database! You cannot create duplicate movies. Please enter a new movie title.`,
        type: 'error'
      });
      setActiveTab('review');
      return;
    }

    if (!heroDisplayName.trim() || !heroineDisplayName.trim() || !songTitle.trim()) {
      setStatusNotice({
        text: 'Please fill in all required game answers: Hero, Heroine, and Song.',
        type: 'error'
      });
      return;
    }

    const cleanId =
      initialPuzzle?.id ||
      ('custom-' + movieTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now());

    const puzzle: Puzzle = {
      id: cleanId,
      year: movieYear,
      difficulty,
      director: director.trim() || 'Kollywood Cinema',
      musicDirector: musicDirector.trim() || 'Tamil Music',
      genre: genre.trim() || 'Kollywood Blockbuster',
      trivia: overview.trim() || `Iconic Tamil film crafted by ${creatorName}`,
      wikidataId: fetchedDetails?.qid || initialPuzzle?.wikidataId,
      posterUrl: moviePoster.trim() || undefined,
      createdBy: creatorName,
      creatorUid: creatorUid,
      movie: {
        name: movieTitle.trim(),
        displayName: movieTitle.trim(),
        canonicalName: fetchedDetails?.movieTitle || initialPuzzle?.movie.canonicalName || movieTitle.trim(),
        wikidataId: fetchedDetails?.qid || initialPuzzle?.movie.wikidataId,
        firstLetter: movieTitle.trim().charAt(0).toUpperCase(),
        imageUrl: moviePoster.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${movieTitle.trim()}`,
        aliases: [movieTitle.trim(), fetchedDetails?.movieTitle].filter(Boolean) as string[]
      },
      hero: {
        name: heroDisplayName.trim(),
        displayName: heroDisplayName.trim(),
        canonicalName: heroCanonicalName || heroDisplayName.trim(),
        wikidataId: heroQid || undefined,
        firstLetter: heroDisplayName.trim().charAt(0).toUpperCase(),
        imageUrl: heroImageUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroDisplayName.trim()}`,
        aliases: [heroDisplayName.trim(), heroCanonicalName].filter(Boolean) as string[]
      },
      heroine: {
        name: heroineDisplayName.trim(),
        displayName: heroineDisplayName.trim(),
        canonicalName: heroineCanonicalName || heroineDisplayName.trim(),
        wikidataId: heroineQid || undefined,
        firstLetter: heroineDisplayName.trim().charAt(0).toUpperCase(),
        imageUrl: heroineImageUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroineDisplayName.trim()}`,
        aliases: [heroineDisplayName.trim(), heroineCanonicalName].filter(Boolean) as string[]
      },
      song: {
        name: songTitle.trim(),
        displayName: songTitle.trim(),
        firstLetter: songTitle.trim().charAt(0).toUpperCase(),
        youtubeId: youtubeId.trim(),
        aliases: [songTitle.trim()]
      }
    };

    onSubmit(puzzle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card border border-cinema-border/90 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl my-auto max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover text-slate-400 hover:text-white border border-cinema-border/60 transition-colors shadow-sm"
          title="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
            <Clapperboard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                {modalTitle || "Director's Movie Crafting"}
              </h3>
              <span className="text-[10px] bg-brand-500/15 text-brand-300 border border-brand-500/30 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Auto-Fetch
              </span>
            </div>
            <p className="text-xs text-cinema-muted mt-0.5">
              {modalSubtitle || "Enter movie title to auto-fetch info & photos. You control the exact display names!"}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cinema-dark border border-cinema-border/70 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'review'
                ? 'btn-cinema-primary text-black shadow-md'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>1. Auto-Fetch & Edit Display Names</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'btn-cinema-primary text-black shadow-md'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. Live Contestant 2x2 Preview</span>
          </button>
        </div>

        {/* Dynamic Status Notice Banner */}
        {statusNotice && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 mb-4 border transition-all animate-fade-in ${
              statusNotice.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : statusNotice.type === 'error'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-brand-500/10 text-brand-300 border-brand-500/30'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : statusNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-brand-400 flex-shrink-0" />
            )}
            <span className="font-semibold">{statusNotice.text}</span>
          </div>
        )}

        {/* Step-by-Step Loading Progress Bar */}
        {loadingStep && (
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 mb-4 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-brand-300 text-xs font-black">
              <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
              <span>{loadingStep}</span>
            </div>
            <div className="w-full bg-cinema-dark rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-brand-500 to-amber-300 h-full w-3/4 rounded-full animate-indeterminate" />
            </div>
          </div>
        )}

        {activeTab === 'review' ? (
          <div className="space-y-4">
            {/* STEP 1: AUTO-FETCH SEARCH BAR */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-cinema-surface border border-cinema-border/80 space-y-2.5 shadow-sm">
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-400">
                  <Search className="w-4 h-4" />
                  Enter Movie Title to Auto-Fetch:
                </span>
                <span className="text-[10px] text-cinema-muted font-bold lowercase">e.g. Leo, Vikram, Master, 96, Ghilli</span>
              </label>

              <form onSubmit={handleSearchMovie} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type Tamil movie title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none font-semibold placeholder:text-cinema-muted/60"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="py-2.5 px-4 sm:px-5 rounded-xl btn-cinema-primary text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Sparkles className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'Fetching...' : '⚡ Auto-Fetch'}</span>
                </button>
              </form>
            </div>

            {/* DISAMBIGUATION CANDIDATE PICKER */}
            {candidates.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-scale-in shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Multiple Versions Found — Select One:
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {candidates.length} versions
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {candidates.map((c) => (
                    <div
                      key={c.qid}
                      className="p-2.5 rounded-xl bg-cinema-dark border border-cinema-border/80 hover:border-brand-500/60 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{c.cleanTitle}</span>
                          {c.year && (
                            <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-black border border-brand-500/30">
                              {c.year}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-cinema-muted truncate mt-0.5">{c.snippet}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCandidate(c)}
                        className="py-1.5 px-3 rounded-xl btn-cinema-primary text-black text-xs font-black flex items-center gap-1 shadow-sm flex-shrink-0 transition-all active:scale-95"
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
            <div className="p-3 rounded-2xl bg-cinema-surface border border-cinema-border/70 flex items-center justify-between gap-2.5 text-xs">
              <span className="font-bold text-cinema-muted flex items-center gap-1.5 flex-shrink-0">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                Pick Existing Movie:
              </span>
              <select
                value={selectedDbMovieId}
                onChange={(e) => handleSelectDbMovie(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none shadow-xs font-medium"
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
              <div className="glass-panel p-4 rounded-2xl border border-cinema-border/70 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-cinema-border/60">
                  <h4 className="text-xs font-black font-display text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-brand-400" />
                    <span>🎬 Movie Information</span>
                  </h4>
                  {fetchedDetails?.qid && (
                    <a
                      href={`${WIKIDATA_WEB_URL}/${fetchedDetails.qid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
                    >
                      <span>Wikidata: {fetchedDetails.qid}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Leo, Master, Vikram"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={movieYear}
                      onChange={(e) => setMovieYear(parseInt(e.target.value, 10) || 2024)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Film Director (Clue)</label>
                    <input
                      type="text"
                      placeholder="e.g. Lokesh Kanagaraj, Nelson, Shankar"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Music Composer (Clue)</label>
                    <input
                      type="text"
                      placeholder="e.g. Anirudh, AR Rahman, Yuvan"
                      value={musicDirector}
                      onChange={(e) => setMusicDirector(e.target.value)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Genre</label>
                    <input
                      type="text"
                      placeholder="e.g. Action Thriller, Rom-Com"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="easy">Easy (Blockbusters & Mass Hits)</option>
                      <option value="medium">Medium (Standard Popular Hits)</option>
                      <option value="hard">Hard (Tricky Classics & Cult Hits)</option>
                    </select>
                  </div>
                </div>

                {/* Movie Poster Banner (Wikidata / Wikimedia Commons Auto-Fetched) */}
                <div className="p-3 rounded-xl bg-cinema-dark border border-cinema-border/80 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-cinema-surface border border-cinema-border flex-shrink-0 shadow-inner">
                      {moviePoster ? (
                        <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-cinema-muted">
                          <ImageIcon className="w-5 h-5 mb-1 text-brand-400" />
                          <span className="text-[8px] font-bold">No Poster</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-300">
                          🎬 Movie Poster Banner (Wikidata & Wikimedia Commons)
                        </label>
                        {moviePoster && (
                          <span className="text-[9px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                            Poster Active
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://... (Auto-populated from Wikidata or paste custom URL)"
                        value={moviePoster}
                        onChange={(e) => setMoviePoster(e.target.value)}
                        className="w-full bg-cinema-surface border border-cinema-border focus:border-brand-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-cinema-muted/60"
                      />
                      <p className="text-[10px] text-cinema-muted">
                        Automatically fetched from Wikidata & Wikimedia Commons.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Plot Overview / Trivia Clue
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Storyline synopsis..."
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none font-normal"
                  />
                </div>
              </div>

              {/* SECTION B: MAIN CAST & DIRECTOR-CONTROLLED DISPLAY NAMES */}
              <div className="glass-panel p-4 rounded-2xl border border-cinema-border/70 space-y-4">
                <div className="pb-1.5 border-b border-cinema-border/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black font-display text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>⭐ Main Cast & Director-Controlled Display Names</span>
                    </h4>
                    <p className="text-[11px] text-cinema-muted">
                      Players see ONLY the Display Name you specify below!
                    </p>
                  </div>
                </div>

                {/* 1. HERO (LEAD ACTOR) SECTION */}
                <div className="p-3.5 rounded-2xl card-category-hero border border-amber-500/35 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Hero Profile Picture (Auto-populated from Wikimedia) */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-cinema-dark border border-amber-500/40 flex-shrink-0 shadow-inner">
                      {heroImageUrl ? (
                        <img
                          src={heroImageUrl}
                          alt={heroDisplayName || 'Hero'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-amber-500/10 text-amber-300">
                          <User className="w-6 h-6 mb-1 text-amber-400" />
                          <span className="text-[8px] font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Hero Names: Canonical API Name vs Director Display Name */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hero (Lead Actor) *</span>
                        </span>
                        {heroDisplayName && (
                          <span className="text-xs font-mono font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40">
                            Starts: {heroDisplayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Canonical Name Reference Badge */}
                      {heroCanonicalName && (
                        <div className="text-[11px] text-amber-200 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center justify-between">
                          <span>
                            <strong>API Canonical:</strong> {heroCanonicalName}
                          </span>
                          <span className="text-[9px] text-amber-400 font-semibold">(Internal)</span>
                        </div>
                      )}

                      {/* EDITABLE DIRECTOR DISPLAY NAME */}
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-0.5">
                          Player-Facing Display Name (What Players Guess):
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vijay, Rajinikanth, Kamal Haasan"
                          value={heroDisplayName}
                          onChange={(e) => setHeroDisplayName(e.target.value)}
                          className="w-full bg-cinema-dark border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Alternative Hero from Detected Cast */}
                  {fetchedDetails?.cast && fetchedDetails.cast.length > 0 && (
                    <div className="pt-2 border-t border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-amber-300 block">
                        Switch Hero to Another Discovered Actor:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {fetchedDetails.cast
                          .filter((c) => c.gender === 'male' && c.canonicalName !== heroCanonicalName)
                          .map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleSetHeroFromCast(person)}
                              className="px-2 py-0.5 rounded-lg bg-cinema-surface hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-colors shadow-2xs"
                            >
                              + Set: {person.suggestedDisplayName || person.canonicalName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. HEROINE (LEAD ACTRESS) SECTION */}
                <div className="p-3.5 rounded-2xl card-category-heroine border border-rose-500/35 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Heroine Profile Picture */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-cinema-dark border border-rose-500/40 flex-shrink-0 shadow-inner">
                      {heroineImageUrl ? (
                        <img
                          src={heroineImageUrl}
                          alt={heroineDisplayName || 'Heroine'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-rose-500/10 text-rose-300">
                          <Heart className="w-6 h-6 mb-1 text-rose-400" />
                          <span className="text-[8px] font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Heroine Names: Canonical API Name vs Director Display Name */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-300 uppercase flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>Heroine (Lead Actress) *</span>
                        </span>
                        {heroineDisplayName && (
                          <span className="text-xs font-mono font-black px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/40">
                            Starts: {heroineDisplayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Canonical Name Reference Badge */}
                      {heroineCanonicalName && (
                        <div className="text-[11px] text-rose-200 bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center justify-between">
                          <span>
                            <strong>API Canonical:</strong> {heroineCanonicalName}
                          </span>
                          <span className="text-[9px] text-rose-400 font-semibold">(Internal)</span>
                        </div>
                      )}

                      {/* EDITABLE DIRECTOR DISPLAY NAME */}
                      <div>
                        <label className="block text-[11px] font-bold text-rose-300 mb-0.5">
                          Player-Facing Display Name (What Players Guess):
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Trisha, Nayanthara, Samantha"
                          value={heroineDisplayName}
                          onChange={(e) => setHeroineDisplayName(e.target.value)}
                          className="w-full bg-cinema-dark border-2 border-rose-500/50 focus:border-rose-400 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Alternative Heroine from Detected Cast */}
                  {fetchedDetails?.cast && fetchedDetails.cast.length > 0 && (
                    <div className="pt-2 border-t border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-rose-300 block">
                        Switch Heroine to Another Discovered Actress:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {fetchedDetails.cast
                          .filter((c) => c.gender === 'female' && c.canonicalName !== heroineCanonicalName)
                          .map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleSetHeroineFromCast(person)}
                              className="px-2 py-0.5 rounded-lg bg-cinema-surface hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors shadow-2xs"
                            >
                              + Set: {person.suggestedDisplayName || person.canonicalName}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SONG & YOUTUBE AUDIO SECTION */}
                <div className="p-3.5 rounded-2xl card-category-song border border-purple-500/35 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 uppercase flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-purple-400" />
                      <span>Hit Song Title *</span>
                    </span>
                    {songTitle && (
                      <span className="text-xs font-mono font-black px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/40">
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
                        className="w-full bg-cinema-dark border-2 border-purple-500/50 focus:border-purple-400 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="YouTube ID (e.g. szvt1vD0Uug)"
                        value={youtubeId}
                        onChange={(e) => setYoutubeId(e.target.value)}
                        className="w-full bg-cinema-dark border border-cinema-border focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
                  className="flex-1 py-3.5 rounded-2xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl btn-cinema-primary text-black text-xs sm:text-sm font-black shadow-xl shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Clapperboard className="w-4 h-4 fill-black" />
                  <span>💾 Save & Launch Movie</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: LIVE CONTESTANT 2x2 PREVIEW */
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/70 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Contestant Game View Preview
                </h4>
                <p className="text-[11px] text-cinema-muted">
                  Players see only the photos, first letters, and director-approved display names!
                </p>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                {difficulty}
              </span>
            </div>

            {/* 2x2 Grid View */}
            <div className="grid grid-cols-2 gap-3">
              {/* Hero Card */}
              <div className="p-3.5 rounded-2xl card-category-hero border border-amber-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-amber-400">Hero</span>
                  <span className="text-xs font-mono font-black px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                    {heroDisplayName ? heroDisplayName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-cinema-dark border border-amber-500/30">
                  {heroImageUrl ? (
                    <img src={heroImageUrl} alt={heroDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-amber-400 font-bold">
                      Avatar
                    </div>
                  )}
                </div>
                <div className="font-black text-white text-sm truncate">
                  {heroDisplayName || <span className="text-cinema-muted italic">Enter Hero Name</span>}
                </div>
              </div>

              {/* Heroine Card */}
              <div className="p-3.5 rounded-2xl card-category-heroine border border-rose-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-rose-400">Heroine</span>
                  <span className="text-xs font-mono font-black px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">
                    {heroineDisplayName ? heroineDisplayName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-cinema-dark border border-rose-500/30">
                  {heroineImageUrl ? (
                    <img src={heroineImageUrl} alt={heroineDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-rose-400 font-bold">
                      Avatar
                    </div>
                  )}
                </div>
                <div className="font-black text-white text-sm truncate">
                  {heroineDisplayName || <span className="text-cinema-muted italic">Enter Heroine Name</span>}
                </div>
              </div>

              {/* Movie Card */}
              <div className="p-3.5 rounded-2xl card-category-movie border border-blue-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-blue-400">Movie</span>
                  <span className="text-xs font-mono font-black px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                    {movieTitle ? movieTitle.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-cinema-dark border border-blue-500/30">
                  {moviePoster ? (
                    <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-blue-400 font-bold">
                      Poster
                    </div>
                  )}
                </div>
                <div className="font-black text-white text-sm truncate">
                  {movieTitle || <span className="text-cinema-muted italic">Enter Movie Title</span>}
                </div>
                <div className="text-[10px] text-cinema-muted font-bold">
                  {movieYear} • {genre}
                </div>
              </div>

              {/* Song Card */}
              <div className="p-3.5 rounded-2xl card-category-song border border-purple-500/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black text-purple-400">Song</span>
                  <span className="text-xs font-mono font-black px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">
                    {songTitle ? songTitle.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="font-black text-white text-sm truncate">
                  {songTitle || <span className="text-cinema-muted italic">Enter Song Title</span>}
                </div>
                <div className="text-[10px] text-cinema-muted font-semibold">
                  {youtubeId ? '🎵 Audio Clue Attached' : 'Audio Clue Optional'}
                </div>
              </div>
            </div>

            {/* Clue Summary */}
            <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/70 space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>
                  <strong className="text-white">Director:</strong> {director || 'Not specified'}
                </span>
                <span>
                  <strong className="text-white">Music:</strong> {musicDirector || 'Not specified'}
                </span>
              </div>
              {overview && (
                <p className="text-[11px] text-cinema-muted italic pt-1 border-t border-cinema-border/40">
                  "{overview}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className="flex-1 py-3.5 rounded-2xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
              >
                ✏️ Return to Edit Display Names
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="flex-1 py-3.5 rounded-2xl btn-cinema-primary text-black text-xs sm:text-sm font-black shadow-xl shadow-brand-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Clapperboard className="w-4 h-4 fill-black" />
                <span>💾 Save & Launch Movie</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
