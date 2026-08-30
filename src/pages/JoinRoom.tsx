import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ArrowRight, Clipboard, AlertCircle } from 'lucide-react';
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
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-6 py-8 max-w-xl mx-auto overflow-hidden animate-fade-in font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Lobby</span>
      </button>

      {/* Main Card */}
      <div className="relative rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.08)]">
        
        {/* Top Centered Glowing Icon Badge */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-[#070a12] flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)]">
            <KeyRound className="w-7 h-7 text-cyan-400 stroke-[2.2]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_20px_rgba(6,182,212,0.85)]">
            Join Cinema Room
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Enter the 6-character room access pass code shared by the room host.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Room Pass Code
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste Code</span>
              </button>
            </div>

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
                className="w-full bg-[#070a12] border-2 border-slate-800 focus:border-cyan-400 rounded-2xl px-4 py-4 text-center font-mono font-black text-2xl sm:text-3xl tracking-[0.25em] text-cyan-300 uppercase placeholder:text-slate-700 placeholder:tracking-normal focus:outline-none transition-colors shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Ask your host for the 6-digit room code.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:shadow-[0_0_45px_rgba(6,182,212,0.9)] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">AUTHENTICATING PASS...</span>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  <span>ENTER CINEMA ROOM</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
