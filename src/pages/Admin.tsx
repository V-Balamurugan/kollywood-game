import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Film, Search, Plus, Trash2, Edit, Check, X,
  Users, RefreshCw, Sparkles, Play, ExternalLink, ShieldCheck,
  Trophy, Flame, Award, AlertCircle, Database, Lock, Key, LogOut, ShieldAlert
} from 'lucide-react';
import { Puzzle, UserProfile } from '../types/game';
import { getAllPuzzles, addPuzzle, updatePuzzle, deletePuzzle, resetPuzzlesToDefault, syncGlobalCustomPuzzles } from '../services/puzzleManager';
import { getAllStoredUsers, deleteStoredUser, resetUserStats } from '../services/userManager';
import { useAuth } from '../context/AuthContext';
import {
  searchMovieCandidates,
  fetchFullMovieDetailsByQid,
  MovieCandidate,
  FullMovieDetails,
  FullCastPerson
} from '../services/wikidataCast';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'admin@02072006';
const ADMIN_STORAGE_KEY = 'kollywood_admin_auth_active';

interface AdminProps {
  onBack: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const { user } = useAuth();

  // Admin Login Security Gate State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
      localStorage.getItem(ADMIN_STORAGE_KEY) === 'true' ||
      sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    );
  });

  const [inputEmail, setInputEmail] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'movies' | 'users'>('movies');

  // Movie State
  const [puzzles, setPuzzles] = useState<Puzzle[]>(() => getAllPuzzles());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Modal State for Add / Edit Movie
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  // Form Fields & Auto-Fetch State
  const [movieName, setMovieName] = useState('');
  const [movieYear, setMovieYear] = useState<number>(2024);
  const [moviePoster, setMoviePoster] = useState('');
  const [director, setDirector] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  const [genre, setGenre] = useState('Action / Drama');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [trivia, setTrivia] = useState('');

  // Hero Fields
  const [heroName, setHeroName] = useState(''); // Director display name
  const [heroCanonicalName, setHeroCanonicalName] = useState('');
  const [heroPhoto, setHeroPhoto] = useState('');
  const [heroQid, setHeroQid] = useState('');

  // Heroine Fields
  const [heroineName, setHeroineName] = useState(''); // Director display name
  const [heroineCanonicalName, setHeroineCanonicalName] = useState('');
  const [heroinePhoto, setHeroinePhoto] = useState('');
  const [heroineQid, setHeroineQid] = useState('');

  // Song Fields
  const [songName, setSongName] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  // Disambiguation & Cast State
  const [candidates, setCandidates] = useState<MovieCandidate[]>([]);
  const [fetchedDetails, setFetchedDetails] = useState<FullMovieDetails | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Auto-authenticate if logged in with admin email
  useEffect(() => {
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdminAuth(true);
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    }
  }, [user]);

  // Load initial data and sync global community movies
  useEffect(() => {
    if (isAdminAuth) {
      setPuzzles(getAllPuzzles());
      syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
      setUsers(getAllStoredUsers());
    }
  }, [isAdminAuth]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrim = inputEmail.trim().toLowerCase();
    const passTrim = inputPass.trim();

    if (emailTrim === ADMIN_EMAIL.toLowerCase() && passTrim === ADMIN_PASS) {
      setIsAdminAuth(true);
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      setPuzzles(getAllPuzzles());
      syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
      setUsers(getAllStoredUsers());
    } else {
      setAuthError('Invalid Admin Credentials. Please check your admin username and password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setInputEmail('');
    setInputPass('');
  };

  const refreshData = () => {
    setPuzzles(getAllPuzzles());
    syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
    setUsers(getAllStoredUsers());
  };

  // Step 1: Search movie candidates for disambiguation
  const handleAutoFetchMovie = async () => {
    if (!movieName.trim()) return;
    setIsFetchingData(true);
    setCandidates([]);
    setLoadingStep('🎬 Searching Wikidata for Tamil cinema matches...');

    try {
      const results = await searchMovieCandidates(movieName.trim());

      if (results.length === 0) {
        setLoadingStep(null);
        setFetchNotice(`No exact Wikidata matches found for "${movieName}". Please enter details manually.`);
      } else if (results.length === 1) {
        await handleSelectCandidate(results[0]);
      } else {
        setCandidates(results);
        setLoadingStep(null);
        setFetchNotice(`Found ${results.length} film versions. Please select the specific movie below:`);
      }
    } catch (e: any) {
      setLoadingStep(null);
      setFetchNotice(e?.message ? `Lookup notice: ${e.message}` : 'Lookup notice.');
    } finally {
      setIsFetchingData(false);
    }
  };

  // Step 2: Fetch full details for a chosen candidate
  const handleSelectCandidate = async (candidate: MovieCandidate) => {
    setIsFetchingData(true);
    setCandidates([]);
    setLoadingStep('🔎 Resolving film metadata, director & music composer...');

    try {
      setLoadingStep('👥 Finding main cast & extracting character roles...');
      const details = await fetchFullMovieDetailsByQid(candidate.qid, candidate.cleanTitle);
      setLoadingStep('🖼️ Retrieving Wikimedia Commons profile pictures...');

      if (details) {
        setFetchedDetails(details);
        setMovieName(details.movieTitle);
        setMovieYear(details.year || candidate.year || 2024);
        if (details.director) setDirector(details.director);
        if (details.musicDirector) setMusicDirector(details.musicDirector);
        if (details.genre) setGenre(details.genre);
        if (details.overview || candidate.snippet) setTrivia(details.overview || candidate.snippet);
        if (details.posterUrl) setMoviePoster(details.posterUrl);

        if (details.hero) {
          setHeroCanonicalName(details.hero.canonicalName);
          setHeroName(details.hero.suggestedDisplayName);
          setHeroPhoto(details.hero.imageUrl || '');
          setHeroQid(details.hero.id);
        }

        if (details.heroine) {
          setHeroineCanonicalName(details.heroine.canonicalName);
          setHeroineName(details.heroine.suggestedDisplayName);
          setHeroinePhoto(details.heroine.imageUrl || '');
          setHeroineQid(details.heroine.id);
        }

        setFetchNotice(`✨ Auto-filled "${details.movieTitle}" (${details.year}) from Wikidata! You can adjust display names below.`);
      }
    } catch (err) {
      setFetchNotice('Failed to fetch detailed cast. Please input names manually.');
    } finally {
      setLoadingStep(null);
      setIsFetchingData(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setMovieName('');
    setMovieYear(2024);
    setMoviePoster('');
    setDirector('');
    setMusicDirector('');
    setGenre('Action / Drama');
    setHeroName('');
    setHeroCanonicalName('');
    setHeroPhoto('');
    setHeroQid('');
    setHeroineName('');
    setHeroineCanonicalName('');
    setHeroinePhoto('');
    setHeroineQid('');
    setSongName('');
    setYoutubeId('');
    setDifficulty('easy');
    setTrivia('');
    setCandidates([]);
    setFetchedDetails(null);
    setFetchNotice(null);
    setLoadingStep(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Puzzle) => {
    setEditingId(p.id);
    setMovieName(p.movie.name);
    setMovieYear(p.year || 2024);
    setMoviePoster(p.movie.imageUrl || '');
    setDirector(p.director || '');
    setMusicDirector(p.musicDirector || '');
    setGenre(p.genre || 'Action / Drama');
    setHeroName(p.hero.displayName || p.hero.name);
    setHeroCanonicalName(p.hero.canonicalName || p.hero.name);
    setHeroPhoto(p.hero.imageUrl || '');
    setHeroQid(p.hero.wikidataId || '');
    setHeroineName(p.heroine.displayName || p.heroine.name);
    setHeroineCanonicalName(p.heroine.canonicalName || p.heroine.name);
    setHeroinePhoto(p.heroine.imageUrl || '');
    setHeroineQid(p.heroine.wikidataId || '');
    setSongName(p.song.name);
    setYoutubeId(p.song.youtubeId || '');
    setDifficulty(p.difficulty);
    setTrivia(p.trivia || '');
    setCandidates([]);
    setFetchedDetails(null);
    setFetchNotice(null);
    setLoadingStep(null);
    setIsModalOpen(true);
  };

  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim() || !heroName.trim() || !heroineName.trim() || !songName.trim()) {
      alert('Please fill in Movie, Hero, Heroine, and Song.');
      return;
    }

    const cleanId = editingId || movieName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + movieYear;

    const puzzleData: Puzzle = {
      id: cleanId,
      year: movieYear,
      difficulty,
      director: director.trim() || 'Kollywood Cinema',
      musicDirector: musicDirector.trim() || 'Tamil Music',
      genre: genre.trim() || 'Kollywood Blockbuster',
      trivia: trivia.trim() || `Blockbuster Tamil film starring ${heroName} & ${heroineName}`,
      wikidataId: fetchedDetails?.qid,
      posterUrl: moviePoster.trim() || undefined,
      movie: {
        name: movieName.trim(),
        displayName: movieName.trim(),
        canonicalName: fetchedDetails?.movieTitle || movieName.trim(),
        wikidataId: fetchedDetails?.qid,
        firstLetter: movieName.trim().charAt(0).toUpperCase(),
        imageUrl: moviePoster.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${movieName.trim()}`,
        aliases: [movieName.trim(), fetchedDetails?.movieTitle].filter(Boolean) as string[]
      },
      hero: {
        name: heroName.trim(),
        displayName: heroName.trim(),
        canonicalName: heroCanonicalName || heroName.trim(),
        wikidataId: heroQid || undefined,
        firstLetter: heroName.trim().charAt(0).toUpperCase(),
        imageUrl: heroPhoto.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroName.trim()}`,
        aliases: [heroName.trim(), heroCanonicalName].filter(Boolean) as string[]
      },
      heroine: {
        name: heroineName.trim(),
        displayName: heroineName.trim(),
        canonicalName: heroineCanonicalName || heroineName.trim(),
        wikidataId: heroineQid || undefined,
        firstLetter: heroineName.trim().charAt(0).toUpperCase(),
        imageUrl: heroinePhoto.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroineName.trim()}`,
        aliases: [heroineName.trim(), heroineCanonicalName].filter(Boolean) as string[]
      },
      song: {
        name: songName.trim(),
        displayName: songName.trim(),
        firstLetter: songName.trim().charAt(0).toUpperCase(),
        youtubeId: youtubeId.trim() || undefined,
        aliases: [songName.trim()]
      }
    };

    let updatedList: Puzzle[];
    if (editingId) {
      updatedList = updatePuzzle(editingId, puzzleData);
    } else {
      updatedList = addPuzzle(puzzleData);
    }

    setPuzzles(updatedList);
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteMovie = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      const updated = deletePuzzle(id);
      setPuzzles(updated);
      refreshData();
    }
  };

  const handleResetPuzzles = () => {
    if (window.confirm('Reset movie database back to default curated films?')) {
      const resetList = resetPuzzlesToDefault();
      setPuzzles(resetList);
      refreshData();
    }
  };

  // User Management Actions
  const handleDeleteUser = (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user profile for "${name}"?`)) {
      deleteStoredUser(uid);
      refreshData();
    }
  };

  const handleResetStats = (uid: string, name: string) => {
    if (window.confirm(`Reset game statistics for "${name}" back to zero?`)) {
      resetUserStats(uid);
      refreshData();
    }
  };

  // =========================================================================
  // ADMIN SECURITY LOGIN GATE
  // =========================================================================
  if (!isAdminAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-cinema-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Menu
        </button>

        <div className="glass-card rounded-3xl p-8 border border-cinema-border shadow-2xl shadow-brand-500/10 text-center relative overflow-hidden">
          {/* Glowing accents */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-black shadow-xl shadow-brand-500/30 mb-4 animate-pop">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-display font-black text-white tracking-tight">
            Admin Control Center
          </h2>
          <p className="text-xs text-cinema-muted mt-1 mb-6">
            Enter authorized administrator credentials to manage master database movies and users.
          </p>

          {authError && (
            <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-cinema-muted/60 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => setInputPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-cinema-muted/60 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-sm shadow-xl shadow-brand-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Key className="w-4 h-4" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          {/* Quick Fill Button */}
          <div className="mt-6 pt-4 border-t border-cinema-border/50">
            <button
              type="button"
              onClick={() => {
                setInputEmail(ADMIN_EMAIL);
                setInputPass(ADMIN_PASS);
                setAuthError(null);
              }}
              className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold underline transition-colors"
            >
              ⚡ Fill Admin Credentials (admin@gmail.com)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Movies
  const filteredPuzzles = puzzles.filter(p => {
    const matchesSearch =
      p.movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.heroine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.director && p.director.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;

    return matchesSearch && matchesDiff;
  });

  // Filtered Users
  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Main Menu
            </button>
            <span className="text-cinema-border">•</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Verified ({ADMIN_EMAIL})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-brand-400" />
            Kollywood Master Admin Control Center
          </h1>
          <p className="text-xs text-cinema-muted">
            Manage official database movie puzzles, Wikidata auto-fetch, user accounts, and stats
          </p>
        </div>

        {/* Tab Navigation & Logout */}
        <div className="flex flex-wrap items-center gap-2 bg-cinema-dark/90 p-1.5 rounded-2xl border border-cinema-border/70">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'movies'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies & Puzzles ({puzzles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'users'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Players ({users.length})</span>
          </button>

          <button
            onClick={handleAdminLogout}
            title="Lock & Logout Admin Session"
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: MOVIES MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-card p-4 rounded-2xl border border-cinema-border/70">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search title, actor, director, song..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-cinema-dark border border-cinema-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPuzzles}
                title="Reset to default dataset"
                className="p-2.5 rounded-xl bg-cinema-cardHover hover:bg-cinema-border border border-cinema-border/60 text-cinema-muted hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black text-xs font-bold shadow-md shadow-brand-500/20 hover:brightness-110 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Official Movie</span>
              </button>
            </div>
          </div>

          {/* Movies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPuzzles.map((p) => (
              <div
                key={p.id}
                className="glass-card rounded-2xl p-4 border border-cinema-border/70 hover:border-brand-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Film Title and Actions */}
                  <div className="flex items-start justify-between gap-2 border-b border-cinema-border/40 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.movie.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.movie.name}`}
                        alt={p.movie.name}
                        className="w-12 h-16 rounded-lg object-cover border border-cinema-border flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-display font-bold text-white text-base leading-tight">
                          {p.movie.name} ({p.year})
                        </h3>
                        <span className="text-[11px] text-cinema-muted block">
                          Dir: {p.director || 'Tamil Cinema'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded uppercase ${p.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                              p.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                                'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                            {p.difficulty}
                          </span>
                          {p.createdBy && (
                            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/40 truncate max-w-[120px]">
                              🎨 By {p.createdBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-cinema-cardHover hover:bg-cinema-border text-cinema-muted hover:text-brand-400 transition-colors"
                        title="Edit puzzle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(p.id, p.movie.name)}
                        className="p-1.5 rounded-lg bg-cinema-cardHover hover:bg-red-500/20 text-cinema-muted hover:text-red-400 transition-colors"
                        title="Delete movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2x2 Clues Grid Preview */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2 rounded-lg bg-cinema-dark/60 border border-cinema-border/30 flex items-center gap-2">
                      <img
                        src={p.hero.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.hero.name}`}
                        alt={p.hero.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                      <div className="truncate">
                        <span className="text-[9px] text-cinema-muted block">HERO ({p.hero.firstLetter})</span>
                        <span className="font-semibold text-white truncate block">{p.hero.name}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-cinema-dark/60 border border-cinema-border/30 flex items-center gap-2">
                      <img
                        src={p.heroine.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.heroine.name}`}
                        alt={p.heroine.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                      <div className="truncate">
                        <span className="text-[9px] text-cinema-muted block">HEROINE ({p.heroine.firstLetter})</span>
                        <span className="font-semibold text-white truncate block">{p.heroine.name}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-cinema-dark/60 border border-cinema-border/30 flex items-center gap-2 col-span-2">
                      <div className="w-6 h-6 rounded bg-red-600/30 text-red-400 flex items-center justify-center flex-shrink-0">
                        <Play className="w-3 h-3 fill-red-400" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="text-[9px] text-cinema-muted block">SONG ({p.song.firstLetter})</span>
                        <span className="font-semibold text-white truncate block">{p.song.name}</span>
                      </div>
                      {p.song.youtubeId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${p.song.youtubeId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cinema-muted hover:text-brand-400 p-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {p.trivia && (
                  <p className="text-[10px] text-cinema-muted italic border-t border-cinema-border/30 pt-2 line-clamp-2">
                    "{p.trivia}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS & PLAYERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Search Bar */}
          <div className="glass-card p-4 rounded-2xl border border-cinema-border/70 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search players by name or rank..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <span className="text-xs text-cinema-muted">
              {filteredUsers.length} total players registered
            </span>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-2xl border border-cinema-border/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cinema-dark/90 border-b border-cinema-border/60 text-cinema-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Rank Title</th>
                    <th className="py-3 px-4">Total Score</th>
                    <th className="py-3 px-4">Victories (Wins)</th>
                    <th className="py-3 px-4">Current Streak</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinema-border/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-cinema-cardHover/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-xl bg-cinema-dark border border-cinema-border object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.displayName || 'Cinema Buff'}</span>
                          <span className="text-[10px] text-cinema-muted font-mono">{u.email || `${u.uid.slice(0, 10)}...`}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold text-[11px]">
                          {u.totalScore > 5000 ? 'Superstar Buff 🌟' : u.totalScore > 1000 ? 'Director Buff 🎬' : 'Cinema Fan 🍿'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {(u.totalScore || 0).toLocaleString()} pts
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Trophy className="w-3.5 h-3.5" />
                          {u.wins || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-orange-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          {u.bestStreak || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleResetStats(u.uid, u.displayName)}
                          title="Reset Player Stats"
                          className="p-1.5 rounded-lg bg-cinema-cardHover hover:bg-amber-500/20 text-cinema-muted hover:text-amber-400 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.uid, u.displayName)}
                          title="Delete Player Profile"
                          className="p-1.5 rounded-lg bg-cinema-cardHover hover:bg-red-500/20 text-cinema-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MOVIE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-card border border-cinema-border/90 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover text-slate-400 hover:text-white border border-cinema-border/60 transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-white">
                  {editingId ? 'Edit Official Movie' : 'Add Official Movie to Database'}
                </h3>
                <p className="text-xs text-cinema-muted">
                  Auto-fetch info from Wikidata & control the exact display names players guess.
                </p>
              </div>
            </div>

            {/* Smart Auto-Fetch Search Toolbar */}
            <div className="p-3.5 rounded-2xl bg-cinema-surface border border-cinema-border/80 mb-4 space-y-2">
              <label className="block text-xs font-black text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-400">
                  <Search className="w-3.5 h-3.5" />
                  Auto-Fetch Movie Data (Wikidata & Wikipedia):
                </span>
                <span className="text-[10px] text-cinema-muted font-bold">e.g. Leo, Vikram, Master, 96, Ghilli</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter movie title to auto-fetch..."
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-medium placeholder:text-cinema-muted/60"
                />
                <button
                  type="button"
                  onClick={handleAutoFetchMovie}
                  disabled={isFetchingData || !movieName.trim()}
                  className="py-2.5 px-4 rounded-xl btn-cinema-primary text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Sparkles className={`w-4 h-4 ${isFetchingData ? 'animate-spin' : ''}`} />
                  <span>{isFetchingData ? 'Fetching...' : '⚡ Auto-Fetch'}</span>
                </button>
              </div>
            </div>

            {/* Loading State Banner */}
            {loadingStep && (
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 mb-3 text-xs text-brand-300 font-bold flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
                <span>{loadingStep}</span>
              </div>
            )}

            {/* Disambiguation Candidates */}
            {candidates.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 space-y-2">
                <span className="text-xs font-black text-amber-300 uppercase block">
                  Multiple Versions Found — Select One:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {candidates.map((c) => (
                    <div
                      key={c.qid}
                      className="p-2 rounded-xl bg-cinema-dark border border-cinema-border/80 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="truncate flex-1">
                        <span className="font-bold text-xs text-white">{c.cleanTitle}</span>
                        {c.year && <span className="ml-1.5 text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-bold border border-brand-500/30">{c.year}</span>}
                        <p className="text-[10px] text-cinema-muted truncate">{c.snippet}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectCandidate(c)}
                        className="py-1 px-2.5 rounded-lg btn-cinema-primary text-black text-xs font-bold transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fetchNotice && (
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 font-medium mb-3">
                {fetchNotice}
              </div>
            )}

            <form onSubmit={handleSaveMovie} className="space-y-4">
              {/* Movie Title & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">Movie Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo, Jailer, Vikram"
                    value={movieName}
                    onChange={(e) => setMovieName(e.target.value)}
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1">Release Year</label>
                  <input
                    type="number"
                    value={movieYear}
                    onChange={(e) => setMovieYear(parseInt(e.target.value, 10) || 2024)}
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Movie Poster Banner (Wikidata / Wikimedia Commons Auto-Fetched) */}
              <div className="p-3 rounded-xl bg-cinema-dark border border-cinema-border/80 space-y-1.5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-cinema-surface border border-cinema-border flex-shrink-0">
                    {moviePoster ? (
                      <img src={moviePoster} alt={movieName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-cinema-muted">
                        Poster
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                        Movie Poster Banner (Wikidata & Wikimedia Commons)
                      </label>
                      {moviePoster && (
                        <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-bold border border-brand-500/30">
                          Poster Active
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Poster URL (auto-fetched from Wikidata or custom)"
                      value={moviePoster}
                      onChange={(e) => setMoviePoster(e.target.value)}
                      className="w-full bg-cinema-surface border border-cinema-border focus:border-brand-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none placeholder:text-cinema-muted/60"
                    />
                  </div>
                </div>
              </div>

              {/* 2x2 MAIN CAST REVIEW & DIRECTOR DISPLAY NAMES */}
              <div className="glass-panel p-4 rounded-2xl border border-cinema-border/70 space-y-3">
                <span className="text-xs font-black font-display text-white uppercase tracking-wider block">
                  ⭐ Main Cast & Director-Controlled Display Names
                </span>

                {/* Hero Section */}
                <div className="p-3 rounded-xl card-category-hero border border-amber-500/30 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-cinema-dark border border-amber-500/30 flex-shrink-0">
                      {heroPhoto ? (
                        <img src={heroPhoto} alt={heroName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-amber-400 font-bold">Photo</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300 uppercase">Hero (Lead Actor) *</span>
                        {heroCanonicalName && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                            API: {heroCanonicalName}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Player-facing display name (e.g. Vijay)"
                        value={heroName}
                        onChange={(e) => setHeroName(e.target.value)}
                        className="w-full bg-cinema-dark border border-amber-500/40 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Heroine Section */}
                <div className="p-3 rounded-xl card-category-heroine border border-rose-500/30 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-cinema-dark border border-rose-500/30 flex-shrink-0">
                      {heroinePhoto ? (
                        <img src={heroinePhoto} alt={heroineName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-rose-400 font-bold">Photo</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-300 uppercase">Heroine (Lead Actress) *</span>
                        {heroineCanonicalName && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
                            API: {heroineCanonicalName}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Player-facing display name (e.g. Trisha)"
                        value={heroineName}
                        onChange={(e) => setHeroineName(e.target.value)}
                        className="w-full bg-cinema-dark border border-rose-500/40 focus:border-rose-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Song Section */}
                <div className="p-3 rounded-xl card-category-song border border-purple-500/30 space-y-1.5">
                  <span className="text-xs font-black text-purple-300 uppercase block">Hit Song & Audio Clue *</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Song Title (e.g. Naa Ready)"
                      value={songName}
                      onChange={(e) => setSongName(e.target.value)}
                      className="w-full bg-cinema-dark border border-purple-500/40 focus:border-purple-400 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="YouTube ID (e.g. szvt1vD0Uug)"
                      value={youtubeId}
                      onChange={(e) => setYoutubeId(e.target.value)}
                      className="w-full bg-cinema-dark border border-purple-500/40 focus:border-purple-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Director & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Film Director</label>
                  <input
                    type="text"
                    placeholder="e.g. Lokesh Kanagaraj, Nelson, Shankar"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
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
                    <option value="easy">Easy (Blockbusters & Popular Hits)</option>
                    <option value="medium">Medium (Standard Cinephile Hits)</option>
                    <option value="hard">Hard (Classic / Cult / Tricky Clues)</option>
                  </select>
                </div>
              </div>

              {/* Trivia / Clue Plot */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plot Summary / Trivia Clue</label>
                <textarea
                  rows={2}
                  placeholder="e.g. An iconic action thriller set in Kashmir with an animal sanctuary owner..."
                  value={trivia}
                  onChange={(e) => setTrivia(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border text-slate-300 hover:text-white text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl btn-cinema-primary text-black text-xs font-black shadow-xl shadow-brand-500/20 active:scale-95 transition-all"
                >
                  {editingId ? 'Save Changes' : '💾 Add to Master Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
