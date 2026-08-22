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
        className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-white mb-4 sm:mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Arena</span>
      </button>

      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cinema-border/60">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-display font-black text-white">Create Match Room</h2>
            <p className="text-[11px] sm:text-xs text-cinema-muted">Host a live multiplayer arena with friends</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Time per Round */}
          <div>
            <label className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
              ⏱️ Round Timer
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { sec: 0, label: '♾️ Chill' },
                { sec: 30, label: '30s' },
                { sec: 45, label: '45s' },
                { sec: 60, label: '60s' },
                { sec: 90, label: '90s' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, roundTimeSeconds: opt.sec }))}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${settings.roundTimeSeconds === opt.sec
                      ? 'btn-cinema-primary text-black border-amber-400'
                      : 'bg-cinema-surface text-slate-300 border-cinema-border/70 hover:text-white hover:border-brand-500/40'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
              🎬 Difficulty Pool
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { id: 'all', label: '🎲 All Era' },
                { id: 'easy', label: '⚡ Easy' },
                { id: 'medium', label: '🔥 Medium' },
                { id: 'hard', label: '💀 Hard' }
              ] as const).map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, difficulty: diff.id }))}
                  className={`py-2.5 rounded-xl text-xs font-black border tracking-wider transition-all active:scale-95 ${settings.difficulty === diff.id
                      ? 'btn-cinema-primary text-black border-amber-400'
                      : 'bg-cinema-surface text-slate-300 border-cinema-border/70 hover:text-white hover:border-brand-500/40'
                    }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-cinema-surface border border-cinema-border/80 text-[11px] sm:text-xs text-cinema-muted flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <span>
              A unique 6-character room code will be generated. You can invite friends to battle live.
            </span>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 rounded-2xl btn-cinema-primary text-black font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Generating Arena Room...</span>
            ) : (
              <>
                <span>CREATE ARENA & GO TO LOBBY</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

