import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Film, Search, Plus, Trash2, Edit,
  Users, RefreshCw, Sparkles, ShieldCheck,
  Trophy, Flame, Lock, LogOut, ShieldAlert,
  Play, BarChart3, Database, Star,
  Clapperboard, Music, UserCircle2,
  TrendingUp, Crown, Settings
} from 'lucide-react';
import { Puzzle, UserProfile } from '../types/game';
import { getAllPuzzles, deletePuzzle, resetPuzzlesToDefault, syncGlobalCustomPuzzles, subscribeGlobalCustomPuzzles, addOrUpdatePuzzle } from '../services/puzzleManager';
import { getAllStoredUsers, deleteStoredUser, resetUserStats } from '../services/userManager';
import { useAuth } from '../context/AuthContext';
import { CreatePuzzleModal } from '../components/CreatePuzzleModal';

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
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);

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

  // Load initial data and subscribe to real-time library updates
  useEffect(() => {
    if (isAdminAuth) {
      setPuzzles(getAllPuzzles());
      const unsubscribe = subscribeGlobalCustomPuzzles((synced) => {
        setPuzzles(synced);
      });
      syncGlobalCustomPuzzles().then(synced => setPuzzles(synced));
      setUsers(getAllStoredUsers());

      return () => {
        unsubscribe();
      };
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

  const handleOpenAddModal = () => {
    setEditingPuzzle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Puzzle) => {
    setEditingPuzzle(p);
    setIsModalOpen(true);
  };

  const handleSaveMovie = (puzzleData: Puzzle) => {
    const updatedList = addOrUpdatePuzzle(puzzleData);
    setPuzzles(updatedList);
    setIsModalOpen(false);
    setEditingPuzzle(null);
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
  // ADMIN SECURITY LOGIN GATE — Premium full-screen design
  // =========================================================================
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden animate-fade-in">
        {/* Decorative BG Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-rose-500/8 rounded-full blur-[80px] pointer-events-none" />

        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-cinema-muted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Main Menu
        </button>

        <div className="w-full max-w-sm relative">
          {/* Logo badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-brand-500/40 mb-4">
                <Lock className="w-9 h-9 text-black" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#06080D] flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight mt-2">Admin Portal</h1>
            <p className="text-sm text-cinema-muted mt-1">Kollywood Game Control Center</p>
          </div>

          <div className="glass-card rounded-3xl p-7 border border-cinema-border shadow-2xl shadow-black/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-amber-500/5 pointer-events-none rounded-3xl" />

            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Admin Email
                </label>
                <input
                  type="text"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full bg-cinema-dark/80 border border-cinema-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-cinema-muted/50 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cinema-dark/80 border border-cinema-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-cinema-muted/50 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black text-sm font-black tracking-wide shadow-xl shadow-brand-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Unlock Admin Panel
              </button>

              <button
                type="button"
                onClick={() => { setInputEmail(ADMIN_EMAIL); setInputPass(ADMIN_PASS); setAuthError(null); }}
                className="w-full py-2.5 rounded-2xl border border-cinema-border/60 text-cinema-muted hover:text-white hover:border-cinema-border text-xs font-semibold transition-all"
              >
                ⚡ Fill Admin Credentials
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-cinema-muted/50 mt-4">
            🔒 Authorized personnel only · Access is logged
          </p>
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

  // Stats derived values
  const easyCount = puzzles.filter(p => p.difficulty === 'easy').length;
  const medCount  = puzzles.filter(p => p.difficulty === 'medium').length;
  const hardCount = puzzles.filter(p => p.difficulty === 'hard').length;
  const topPlayer = [...users].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0];

  const diffBadge = (d: string) =>
    d === 'easy'   ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' :
    d === 'medium' ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' :
                     'text-rose-400 bg-rose-500/15 border-rose-500/30';

  return (
    <>
      <div className="min-h-screen relative">
        {/* Ambient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 animate-fade-in">

          {/* ── HEADER ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl border border-cinema-border/60 bg-cinema-dark/80 text-cinema-muted hover:text-white hover:border-cinema-border transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
                  <Settings className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-none">
                    Admin Control Center
                  </h1>
                  <p className="text-[11px] text-cinema-muted mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Verified</span>
                    <span>· {ADMIN_EMAIL}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* ── STATS CARDS ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Clapperboard className="w-5 h-5" />, label: 'Total Films',   value: puzzles.length,                             grad: 'from-brand-500/20 to-brand-700/10 border-brand-500/30',   icon2: 'text-brand-400',  glow: 'shadow-brand-500/10' },
              { icon: <Users className="w-5 h-5" />,        label: 'Total Players', value: users.length,                               grad: 'from-violet-500/20 to-violet-700/10 border-violet-500/30', icon2: 'text-violet-400', glow: 'shadow-violet-500/10' },
              { icon: <TrendingUp className="w-5 h-5" />,   label: 'Hard Puzzles',  value: hardCount,                                  grad: 'from-rose-500/20 to-rose-700/10 border-rose-500/30',       icon2: 'text-rose-400',   glow: 'shadow-rose-500/10' },
              { icon: <Crown className="w-5 h-5" />,        label: 'Top Score',     value: (topPlayer?.totalScore || 0).toLocaleString(), grad: 'from-amber-500/20 to-amber-700/10 border-amber-500/30',   icon2: 'text-amber-400',  glow: 'shadow-amber-500/10' },
            ].map((s, i) => (
              <div key={i} className={`glass-card rounded-2xl p-4 border bg-gradient-to-br ${s.grad} shadow-lg ${s.glow}`}>
                <div className={`${s.icon2} mb-2.5`}>{s.icon}</div>
                <div className="text-2xl font-display font-black text-white">{s.value}</div>
                <div className="text-[11px] text-cinema-muted font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── DIFFICULTY BAR ────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6 px-0.5">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{easyCount} Easy
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-cinema-dark/80 overflow-hidden flex">
              <div className="bg-emerald-500/70 h-full transition-all" style={{ width: `${(easyCount / (puzzles.length || 1)) * 100}%` }} />
              <div className="bg-amber-500/70 h-full transition-all"   style={{ width: `${(medCount  / (puzzles.length || 1)) * 100}%` }} />
              <div className="bg-rose-500/70 h-full transition-all"    style={{ width: `${(hardCount / (puzzles.length || 1)) * 100}%` }} />
            </div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{medCount} Med
            </span>
            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />{hardCount} Hard
            </span>
          </div>

          {/* ── TABS ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 mb-6 p-1.5 bg-cinema-dark/90 border border-cinema-border/60 rounded-2xl w-fit">
            {([
              { key: 'movies', icon: <Film className="w-3.5 h-3.5" />, label: 'Movies & Puzzles', count: puzzles.length },
              { key: 'users',  icon: <Users className="w-3.5 h-3.5" />, label: 'Players',         count: users.length  },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-black shadow-lg shadow-brand-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.key ? 'bg-black/20 text-black' : 'bg-cinema-cardHover text-cinema-muted'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 1 — MOVIES                                             */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === 'movies' && (
            <div className="space-y-5">

              {/* Controls */}
              <div className="glass-card rounded-2xl border border-cinema-border/60 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, actor, director, song..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none transition-all placeholder:text-cinema-muted/50"
                  />
                </div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-cinema-dark border border-cinema-border rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshData}
                    title="Sync database"
                    className="p-2.5 rounded-xl border border-cinema-border/70 bg-cinema-dark text-cinema-muted hover:text-white hover:border-cinema-border transition-all group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                  <button
                    onClick={handleResetPuzzles}
                    className="px-3.5 py-2.5 rounded-xl border border-cinema-border/70 bg-cinema-dark text-cinema-muted hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Defaults</span>
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black text-xs font-black shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.97] flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Official Movie
                  </button>
                </div>
              </div>

              {searchTerm && (
                <p className="text-xs text-cinema-muted px-1">
                  Showing <span className="text-white font-bold">{filteredPuzzles.length}</span> results for "<span className="text-brand-400">{searchTerm}</span>"
                </p>
              )}

              {/* Movies Grid */}
              {filteredPuzzles.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border border-cinema-border/50">
                  <Film className="w-12 h-12 text-cinema-muted/30 mx-auto mb-3" />
                  <p className="text-cinema-muted font-semibold">No movies found</p>
                  <p className="text-cinema-muted/60 text-xs mt-1">Try a different search or add a new movie</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPuzzles.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenEditModal(p)}
                      className="group glass-card rounded-2xl border border-cinema-border/60 hover:border-brand-500/50 transition-all duration-300 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-0.5 cursor-pointer"
                      title="Click to edit this movie"
                    >
                      {/* Poster Banner */}
                      <div className="relative h-40 bg-cinema-dark overflow-hidden flex-shrink-0">
                        {p.movie.imageUrl ? (
                          <img
                            src={p.movie.imageUrl}
                            alt={p.movie.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cinema-dark to-cinema-surface">
                            <Clapperboard className="w-10 h-10 text-cinema-muted/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                        {/* Difficulty badge */}
                        <span className={`absolute top-2.5 left-2.5 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${diffBadge(p.difficulty || 'medium')}`}>
                          {p.difficulty || 'medium'}
                        </span>

                        {/* Hover: Edit hint + Delete button */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-2 py-1 rounded-lg bg-brand-500/80 backdrop-blur-sm text-black text-[9px] font-black flex items-center gap-1">
                            <Edit className="w-2.5 h-2.5" /> Edit
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMovie(p.id, p.movie.name); }}
                            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-red-400 hover:border-red-500/50 transition-colors"
                            title="Delete movie"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <h3 className="font-display font-black text-white text-sm leading-tight drop-shadow-lg">{p.movie.name}</h3>
                          <p className="text-[10px] text-slate-300/80">{p.year} · {p.director || 'Tamil Cinema'}</p>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-3 space-y-2 flex-1">
                        {/* Hero */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-shrink-0">
                            <img src={p.hero.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.hero.name}&backgroundColor=1e293b`}
                              alt={p.hero.name} className="w-7 h-7 rounded-lg object-cover border border-cinema-border" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500/80 border border-[#06080D] flex items-center justify-center">
                              <Star className="w-1.5 h-1.5 text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Hero · {p.hero.firstLetter}</div>
                            <div className="text-xs font-bold text-white truncate">{p.hero.displayName || p.hero.name}</div>
                          </div>
                        </div>

                        {/* Heroine */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-shrink-0">
                            <img src={p.heroine.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.heroine.name}&backgroundColor=1e293b`}
                              alt={p.heroine.name} className="w-7 h-7 rounded-lg object-cover border border-cinema-border" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-500/80 border border-[#06080D] flex items-center justify-center">
                              <Star className="w-1.5 h-1.5 text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Heroine · {p.heroine.firstLetter}</div>
                            <div className="text-xs font-bold text-white truncate">{p.heroine.displayName || p.heroine.name}</div>
                          </div>
                        </div>

                        {/* Song */}
                        <div className="flex items-center gap-2 pt-1 border-t border-cinema-border/30">
                          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                            <Music className="w-3.5 h-3.5 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Song · {p.song.firstLetter}</div>
                            <div className="text-xs font-bold text-white truncate">{p.song.name}</div>
                          </div>
                          {p.song.youtubeId && (
                            <a href={`https://www.youtube.com/watch?v=${p.song.youtubeId}`} target="_blank" rel="noreferrer"
                              className="p-1 text-cinema-muted hover:text-red-400 transition-colors flex-shrink-0" title="Watch on YouTube">
                              <Play className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="px-3 py-2 border-t border-cinema-border/30 bg-cinema-dark/50 flex items-center justify-between">
                        <span className="text-[9px] text-cinema-muted/50 font-mono">#{p.id.slice(0, 8)}</span>
                        {p.createdBy && <span className="text-[9px] text-brand-400/80 font-semibold">By {p.createdBy}</span>}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-cinema-muted/40 flex items-center gap-0.5 group-hover:text-brand-400/60 transition-colors">
                            <Edit className="w-2.5 h-2.5" /> click to edit
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMovie(p.id, p.movie.name); }}
                            className="p-1 rounded-lg text-cinema-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete movie"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB 2 — PLAYERS (Leaderboard style)                       */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Search */}
              <div className="glass-card p-3.5 rounded-2xl border border-cinema-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search players by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-cinema-muted">
                  <BarChart3 className="w-4 h-4 text-brand-400" />
                  <span><span className="text-white font-bold">{filteredUsers.length}</span> players registered</span>
                </div>
              </div>

              {/* Leaderboard rows */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="glass-card rounded-3xl p-16 text-center border border-cinema-border/50">
                    <UserCircle2 className="w-12 h-12 text-cinema-muted/30 mx-auto mb-3" />
                    <p className="text-cinema-muted font-semibold">No players found</p>
                  </div>
                ) : (
                  [...filteredUsers]
                    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                    .map((u, idx) => {
                      const rank = idx + 1;
                      const rankBadge =
                        rank === 1 ? 'text-amber-400 bg-amber-400/15 border-amber-400/40' :
                        rank === 2 ? 'text-slate-300 bg-slate-400/10 border-slate-400/30' :
                        rank === 3 ? 'text-orange-400 bg-orange-400/15 border-orange-400/40' :
                                     'text-cinema-muted bg-cinema-dark border-cinema-border/40';
                      const rankEmoji = ['🥇','🥈','🥉'][rank - 1] ?? `#${rank}`;
                      const title = (u.totalScore || 0) > 5000 ? { label: 'Superstar Buff', icon: '🌟' }
                                  : (u.totalScore || 0) > 1000 ? { label: 'Director Buff',  icon: '🎬' }
                                  :                              { label: 'Cinema Fan',      icon: '🍿' };

                      return (
                        <div key={u.uid} className="glass-card rounded-2xl border border-cinema-border/60 hover:border-cinema-border transition-all p-3.5 flex items-center gap-3 sm:gap-4">
                          {/* Rank */}
                          <div className={`w-9 h-9 rounded-xl border text-sm font-black flex items-center justify-center flex-shrink-0 ${rankBadge}`}>
                            {rankEmoji}
                          </div>

                          {/* Avatar */}
                          <img src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}
                            alt={u.displayName}
                            className="w-10 h-10 rounded-xl bg-cinema-dark border border-cinema-border object-cover flex-shrink-0" />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm truncate">{u.displayName || 'Cinema Buff'}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold flex-shrink-0">
                                {title.icon} {title.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-cinema-muted font-mono block truncate">{u.email || u.uid.slice(0, 14) + '...'}</span>
                          </div>

                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                            <div className="text-center min-w-[48px]">
                              <div className="text-base font-display font-black text-white">{(u.totalScore || 0).toLocaleString()}</div>
                              <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Score</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 justify-center text-amber-400 font-black">
                                <Trophy className="w-3.5 h-3.5" />{u.wins || 0}
                              </div>
                              <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Wins</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 justify-center text-orange-400 font-black">
                                <Flame className="w-3.5 h-3.5" />{u.bestStreak || 0}
                              </div>
                              <div className="text-[9px] text-cinema-muted uppercase tracking-wider font-bold">Streak</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => handleResetStats(u.uid, u.displayName)} title="Reset Stats"
                              className="p-2 rounded-xl bg-cinema-dark border border-cinema-border/60 hover:bg-amber-500/15 hover:border-amber-500/40 text-cinema-muted hover:text-amber-400 transition-all">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteUser(u.uid, u.displayName)} title="Delete Profile"
                              className="p-2 rounded-xl bg-cinema-dark border border-cinema-border/60 hover:bg-red-500/15 hover:border-red-500/40 text-cinema-muted hover:text-red-400 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD / EDIT MOVIE MODAL */}
      <CreatePuzzleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPuzzle(null); }}
        onSubmit={handleSaveMovie}
        creatorName="Master Admin"
        creatorUid={user?.uid || 'admin'}
        initialPuzzle={editingPuzzle}
        modalTitle={editingPuzzle ? 'Edit Official Master Movie' : 'Add Official Movie to Database'}
        modalSubtitle="Auto-fetch info from Wikidata & control the exact display names players guess."
      />
    </>
  );
};
