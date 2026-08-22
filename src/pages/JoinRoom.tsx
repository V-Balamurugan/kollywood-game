import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ArrowRight, Clipboard, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { joinRoom } from '../services/firebase';

interface JoinRoomProps {
  onRoomJoined: (code: string) => void;
  onBack: () => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onRoomJoined, onBack }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim().toUpperCase().slice(0, 6));
      }
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setError('Please enter a valid 6-character room code.');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await joinRoom(cleanCode, {
        uid: user.uid,
        displayName: user.displayName || 'Player',
        photoURL: user.photoURL
      });

      if (!result.success) {
        setError(result.message || `Room "${cleanCode}" was not found.`);
      } else {
        onRoomJoined(cleanCode);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to join room. Please check code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3.5 sm:px-4 py-4 sm:py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-cinema-muted hover:text-white mb-4 sm:mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Arena</span>
      </button>

      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cinema-border/60">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-display font-black text-white">Join Match Room</h2>
            <p className="text-[11px] sm:text-xs text-cinema-muted">Enter the 6-character room invite code</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <p className="text-[11px] text-slate-300 pl-6">
              Make sure the room host is in the lobby and your room code is typed correctly.
            </p>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
              🎟️ 6-Digit Room Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. K7X2QP"
                className="w-full bg-cinema-dark border-2 border-cinema-border focus:border-brand-500 rounded-2xl px-4 py-3.5 text-center font-mono font-black text-2xl sm:text-3xl tracking-widest text-amber-300 uppercase placeholder:text-slate-700 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="absolute right-3 top-3.5 p-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover text-cinema-muted hover:text-brand-300 border border-cinema-border/60 transition-colors"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-cinema-muted text-center mt-2">
              Ask the room host for their 6-character code.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-4 rounded-2xl btn-cinema-primary text-black font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Connecting to Room...</span>
            ) : (
              <>
                <span>ENTER ROOM ARENA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

