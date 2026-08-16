import React, { useState } from 'react';
import { ArrowLeft, Users, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRoom } from '../services/firebase';
import { GameSettings } from '../types/game';

interface CreateRoomProps {
  onRoomCreated: (code: string) => void;
  onBack: () => void;
}

export const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<GameSettings>({
    roundTimeSeconds: 60,
    totalRounds: 5,
    difficulty: 'all',
    gameMode: 'shared-first-solve',
    allowPlayerCustomPuzzles: true
  });

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const code = await createRoom(
        {
          uid: user.uid,
          displayName: user.displayName || 'Room Host',
          photoURL: user.photoURL
        },
        settings
      );
      onRoomCreated(code);
    } catch (err: any) {
      setError(err?.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 py-4 sm:py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl">
        <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-3.5 sm:pb-4 border-b border-cinema-border/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white">Create Custom Match Room</h2>
            <p className="text-[11px] sm:text-xs text-cinema-muted">Play with custom movies created by you & your friends</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-5 sm:space-y-6">
          {/* Time per Round */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Round Timer
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { sec: 0, label: '♾️ No Timer' },
                { sec: 30, label: '30s' },
                { sec: 45, label: '45s' },
                { sec: 60, label: '60s' },
                { sec: 90, label: '90s' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, roundTimeSeconds: opt.sec }))}
                  className={`py-2 sm:py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.roundTimeSeconds === opt.sec
                      ? 'bg-brand-500 text-black border-brand-500 shadow-md shadow-brand-500/20'
                      : 'bg-cinema-cardHover text-slate-300 border-cinema-border/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Difficulty Pool
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {([
                { id: 'all', label: '🎲 Mixed (All)' },
                { id: 'easy', label: '⚡ Easy' },
                { id: 'medium', label: '🔥 Medium' },
                { id: 'hard', label: '💀 Hard' }
              ] as const).map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, difficulty: diff.id }))}
                  className={`py-2 sm:py-2.5 rounded-xl text-xs font-bold border tracking-wider transition-all ${
                    settings.difficulty === diff.id
                      ? 'bg-brand-500 text-black border-brand-500 shadow-md shadow-brand-500/20'
                      : 'bg-cinema-cardHover text-slate-300 border-cinema-border/60 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-cinema-dark/80 border border-cinema-border/60 text-[11px] sm:text-xs text-cinema-muted flex items-center gap-2.5 sm:gap-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400 flex-shrink-0" />
            <span>
              A unique 6-character room code will be generated. You can invite friends to battle live.
            </span>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-brand-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Generating Room...</span>
            ) : (
              <>
                <span>Create Arena & Go to Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

