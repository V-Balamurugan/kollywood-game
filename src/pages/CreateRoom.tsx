import React, { useState } from 'react';
import { ArrowLeft, Users, ArrowRight, Clock, Award, Shield } from 'lucide-react';
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
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-6 py-8 max-w-4xl mx-auto overflow-hidden animate-fade-in font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Lobby</span>
      </button>

      {/* Main Config Card */}
      <div className="relative rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.08)]">
        
        {/* Top Centered Glowing Icon Badge */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-[#070a12] flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)]">
            <Users className="w-7 h-7 text-cyan-400 stroke-[2.2]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_20px_rgba(6,182,212,0.85)]">
            Create Cinema Room
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Configure your match settings and host a live multiplayer cinema arena with friends.
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed text-center">
            {error}
          </div>
        )}

        <div className="space-y-6 max-w-2xl mx-auto">
          
          {/* Round Timer Section */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Round Timer</span>
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5">
              {[
                { sec: 0, label: 'Chill' },
                { sec: 30, label: '30s' },
                { sec: 45, label: '45s' },
                { sec: 60, label: '60s' },
                { sec: 90, label: '90s' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, roundTimeSeconds: opt.sec }))}
                  className={`py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    settings.roundTimeSeconds === opt.sec
                      ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] font-black bg-cyan-950/20'
                      : 'bg-[#070a12] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-bold'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Pool Section */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Difficulty Pool</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {([
                { id: 'all', label: 'All Era' },
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' }
              ] as const).map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, difficulty: diff.id }))}
                  className={`py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    settings.difficulty === diff.id
                      ? 'border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)] font-black bg-cyan-950/20'
                      : 'bg-[#070a12] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-bold'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Hint */}
          <div className="p-3.5 rounded-2xl bg-[#070a12]/80 border border-slate-800/90 text-xs text-slate-400 flex items-center gap-3">
            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>A 6-character room code will be generated for friends to join live.</span>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full sm:max-w-md py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:shadow-[0_0_45px_rgba(6,182,212,0.9)] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">GENERATING ROOM...</span>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  <span>CREATE ROOM & ENTER LOBBY</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
