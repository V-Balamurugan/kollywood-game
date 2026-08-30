import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Film, Search, Plus, Trash2, Edit,
  RefreshCw, Sparkles, ShieldCheck, Lock,
  ShieldAlert, Database
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdminAuth(true);
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    }
  }, [user]);

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
      setAuthError('Invalid Admin Credentials. Please check your username and password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setInputEmail('');
    setInputPass('');
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    if (onBack) {
      onBack();
    }
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

  // ADMIN LOGIN GATE
  if (!isAdminAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden animate-fade-in font-sans">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Lobby</span>
        </button>

        <div className="w-full max-w-md relative">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-3xl border-2 border-cyan-400 bg-[#070a12] flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] mb-3">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">Kollywood Game Control Center</p>
          </div>

          <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 p-7 shadow-2xl">
            {authError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <input
                  type="text"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer mt-2"
              >
                AUTHORIZE ACCESS
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Movie List
  const filteredPuzzles = puzzles.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.movie.name.toLowerCase().includes(term) ||
      p.hero.name.toLowerCase().includes(term) ||
      p.heroine.name.toLowerCase().includes(term) ||
      p.song.name.toLowerCase().includes(term);

    const matchesDiff = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase().trim();
    return !term || u.displayName.toLowerCase().includes(term) || u.uid.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Lobby</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0c101a] border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 uppercase tracking-tight">
                Admin Control Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage blockbuster puzzles, community submissions, and leaderboard stats.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            title="Sync Database"
            className="p-2.5 rounded-xl bg-[#0c101a] hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Exit Console
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 bg-[#0c101a] p-1.5 rounded-2xl border border-slate-800 mb-6 max-w-sm">
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'movies'
              ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎬 Movies ({puzzles.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👤 Users ({users.length})
        </button>
      </div>

      {/* TAB 1: MOVIES */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search database..."
                className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Movie</span>
              </button>
              <button
                onClick={handleResetPuzzles}
                className="px-3.5 py-2 rounded-xl bg-[#0c101a] hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPuzzles.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#0c101a]/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                      {p.difficulty}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{p.year}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 truncate">{p.movie.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 truncate">
                    {p.hero.name} • {p.heroine.name} • {p.song.name}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(p.id, p.movie.name)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name or ID..."
              className="w-full bg-[#0c101a] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl bg-[#0c101a]/90 border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <div key={u.uid} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}
                      alt={u.displayName}
                      className="w-8 h-8 rounded-lg object-cover bg-black border border-slate-800"
                    />
                    <div>
                      <div className="font-bold text-white">{u.displayName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.uid}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-cyan-300">{u.totalScore} pts</div>
                      <div className="text-[10px] text-slate-400">{u.totalGamesPlayed} matches</div>
                    </div>
                    <button
                      onClick={() => handleResetStats(u.uid, u.displayName)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.uid, u.displayName)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Movie Modal */}
      {isModalOpen && (
        <CreatePuzzleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPuzzle(null);
          }}
          onSubmit={handleSaveMovie}
          creatorName="Admin"
          creatorUid={user?.uid}
          initialPuzzle={editingPuzzle || undefined}
        />
      )}
    </div>
  );
};
