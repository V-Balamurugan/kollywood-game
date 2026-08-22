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

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'admin@02072006';
const ADMIN_SESSION_KEY = 'kollywood_admin_auth_active';

interface AdminProps {
  onBack: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  // Admin Login Security Gate State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return (
      (user && user.email === ADMIN_EMAIL) ||
      sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    );
  });

  const [inputEmail, setInputEmail] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'movies' | 'users'>('movies');
  
  // Movie State
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Modal State for Add / Edit Movie
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [omdbLoading, setOmdbLoading] = useState(false);
  const [omdbNotice, setOmdbNotice] = useState<string | null>(null);

  // Form Fields
  const [movieName, setMovieName] = useState('');
  const [movieYear, setMovieYear] = useState<number>(2024);
  const [moviePoster, setMoviePoster] = useState('');
  const [director, setDirector] = useState('');
  const [heroName, setHeroName] = useState('');
  const [heroPhoto, setHeroPhoto] = useState('');
  const [heroineName, setHeroineName] = useState('');
  const [heroinePhoto, setHeroinePhoto] = useState('');
  const [songName, setSongName] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [trivia, setTrivia] = useState('');

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Auto-authenticate if logged in with admin email
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      setIsAdminAuth(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    }
  }, [user]);

  // Load initial data and sync global community movies
  useEffect(() => {
    if (isAdminAuth) {
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
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
      setUsers(getAllStoredUsers());
    } else {
      setAuthError('Invalid Admin Credentials. Please check your admin username and password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setInputEmail('');
    setInputPass('');
  };

  const refreshData = () => {
    syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
    setUsers(getAllStoredUsers());
  };

  // OMDB Auto-fetch for Movie Poster and Director
  const handleOmdbFetch = async () => {
    if (!movieName.trim()) return;
    setOmdbLoading(true);
    setOmdbNotice(null);

    const apiKey = import.meta.env.VITE_OMDB_API_KEY || '140528bd';

    try {
      let url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName.trim())}&apikey=${apiKey}`;
      if (movieYear) url += `&y=${movieYear}`;

      let res = await fetch(url);
      let data = await res.json();

      // If not found with year or direct match, try without year
      if (data.Response !== 'True' && movieYear) {
        const fallbackUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName.trim())}&apikey=${apiKey}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.Response === 'True') {
          data = fallbackData;
        }
      }

      // If still not found, try search query
      if (data.Response !== 'True') {
        const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(movieName.trim())}&type=movie&apikey=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        if (searchData.Response === 'True' && searchData.Search && searchData.Search.length > 0) {
          const detailRes = await fetch(`https://www.omdbapi.com/?i=${searchData.Search[0].imdbID}&apikey=${apiKey}`);
          const detailData = await detailRes.json();
          if (detailData.Response === 'True') {
            data = detailData;
          }
        }
      }

      if (data.Response === 'True') {
        if (data.Poster && data.Poster !== 'N/A') {
          setMoviePoster(data.Poster);
        }
        if (data.Director && data.Director !== 'N/A') {
          setDirector(data.Director);
        }
        if (data.Plot && data.Plot !== 'N/A') {
          setTrivia(data.Plot);
        }
        if (data.Year) {
          setMovieYear(parseInt(data.Year, 10) || movieYear);
        }
        setOmdbNotice(`✓ Found Film: ${data.Title} (${data.Year})`);
      } else {
        setOmdbNotice(data.Error || 'Movie not found on OMDB. You can manually enter poster URL.');
      }
    } catch (e: any) {
      setOmdbNotice(e?.message ? `Failed to connect to OMDB API: ${e.message}` : 'Failed to connect to OMDB API.');
    } finally {
      setOmdbLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setMovieName('');
    setMovieYear(2024);
    setMoviePoster('');
    setDirector('');
    setHeroName('');
    setHeroPhoto('');
    setHeroineName('');
    setHeroinePhoto('');
    setSongName('');
    setYoutubeId('');
    setDifficulty('easy');
    setTrivia('');
    setOmdbNotice(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Puzzle) => {
    setEditingId(p.id);
    setMovieName(p.movie.name);
    setMovieYear(p.year || 2024);
    setMoviePoster(p.movie.imageUrl || '');
    setDirector(p.director || '');
    setHeroName(p.hero.name);
    setHeroPhoto(p.hero.imageUrl || '');
    setHeroineName(p.heroine.name);
    setHeroinePhoto(p.heroine.imageUrl || '');
    setSongName(p.song.name);
    setYoutubeId(p.song.youtubeId || '');
    setDifficulty(p.difficulty);
    setTrivia(p.trivia || '');
    setOmdbNotice(null);
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
      trivia: trivia.trim() || `Blockbuster Tamil film starring ${heroName} & ${heroineName}`,
      movie: {
        name: movieName.trim(),
        firstLetter: movieName.trim().charAt(0).toUpperCase(),
        imageUrl: moviePoster.trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${movieName.trim()}`,
        aliases: [movieName.trim()]
      },
      hero: {
        name: heroName.trim(),
        firstLetter: heroName.trim().charAt(0).toUpperCase(),
        imageUrl: heroPhoto.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroName.trim()}`,
        aliases: [heroName.trim()]
      },
      heroine: {
        name: heroineName.trim(),
        firstLetter: heroineName.trim().charAt(0).toUpperCase(),
        imageUrl: heroinePhoto.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${heroineName.trim()}`,
        aliases: [heroineName.trim()]
      },
      song: {
        name: songName.trim(),
        firstLetter: songName.trim().charAt(0).toUpperCase(),
        youtubeId: youtubeId.trim() || undefined,
        aliases: [songName.trim()]
      }
    };

    if (editingId) {
      updatePuzzle(editingId, puzzleData);
    } else {
      addPuzzle(puzzleData);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteMovie = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      deletePuzzle(id);
      refreshData();
    }
  };

  const handleResetPuzzles = () => {
    if (window.confirm('Reset movie database back to default curated films?')) {
      resetPuzzlesToDefault();
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
            Manage official database movie puzzles, OMDB scraper, user accounts, and stats
          </p>
        </div>

        {/* Tab Navigation & Logout */}
        <div className="flex flex-wrap items-center gap-2 bg-cinema-dark/90 p-1.5 rounded-2xl border border-cinema-border/70">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'movies'
                ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies & Puzzles ({puzzles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
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
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            p.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-cinema-card border border-cinema-border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/10 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-cinema-cardHover text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-black">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-white">
                  {editingId ? 'Edit Official Movie' : 'Add Official Movie to Database'}
                </h3>
                <p className="text-xs text-cinema-muted">
                  Official Kollywood database movies are available across all game modes.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4">
              {/* OMDB Auto-fetch Toolbar */}
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">OMDB Scraper Integration</span>
                  <p className="text-[11px] text-cinema-muted">
                    Enter Tamil movie title and click Fetch to auto-fill poster, director & plot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOmdbFetch}
                  disabled={omdbLoading || !movieName.trim()}
                  className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{omdbLoading ? 'Fetching...' : 'Auto-Fetch from OMDB'}</span>
                </button>
              </div>

              {omdbNotice && (
                <div className="p-2.5 rounded-xl bg-cinema-dark border border-brand-500/30 text-xs text-brand-300">
                  {omdbNotice}
                </div>
              )}

              {/* Movie Title & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Movie Name *</label>
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

              {/* Director & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Film Director</label>
                  <input
                    type="text"
                    placeholder="e.g. Lokesh Kanagaraj, Nelson, Shankar"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
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
                    <option value="easy">Easy (Blockbusters & Popular Hits)</option>
                    <option value="medium">Medium (Standard Cinephile Hits)</option>
                    <option value="hard">Hard (Classic / Cult / Tricky Clues)</option>
                  </select>
                </div>
              </div>

              {/* Poster URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Poster Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={moviePoster}
                  onChange={(e) => setMoviePoster(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Hero & Heroine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Lead Actor (Hero) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijay, Rajinikanth, Kamal"
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

              {/* Song & YouTube Link */}
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

              {/* Trivia / Clue Plot */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plot Summary / Trivia Clue</label>
                <textarea
                  rows={2}
                  placeholder="e.g. An iconic action thriller set in Kashmir with an animal sanctuary owner..."
                  value={trivia}
                  onChange={(e) => setTrivia(e.target.value)}
                  className="w-full bg-cinema-dark border border-cinema-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-cinema-cardHover border border-cinema-border text-slate-300 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-lg shadow-brand-500/20"
                >
                  {editingId ? 'Save Changes' : 'Add to Master Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
