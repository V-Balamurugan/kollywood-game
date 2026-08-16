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
        className="flex items-center gap-1.5 text-xs font-semibold text-cinema-muted hover:text-white mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-cinema-border shadow-2xl">
        <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-3.5 sm:pb-4 border-b border-cinema-border/50">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white">Join Cinema Room</h2>
            <p className="text-[11px] sm:text-xs text-cinema-muted">Enter the 6-character host code</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
              Make sure the host is currently in the lobby and your Firebase Realtime Database rules have been set to public.
            </p>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Room Code
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
                className="w-full bg-cinema-dark border-2 border-cinema-border focus:border-brand-500 rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 text-center font-mono font-black text-xl sm:text-2xl tracking-widest text-white uppercase placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3.5 p-1.5 rounded-xl bg-cinema-cardHover hover:bg-cinema-border text-cinema-muted hover:text-white transition-colors"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-cinema-muted text-center mt-2">
              Ask your friend for their 6-character room code.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-amber-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-brand-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Connecting to Room...</span>
            ) : (
              <>
                <span>Enter Room Arena</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

