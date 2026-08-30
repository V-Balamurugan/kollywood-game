import React, { useState } from 'react';
import { Clapperboard, Send, Bell, HelpCircle, MessageSquare, Lock, Check } from 'lucide-react';
import { Puzzle, HintRequest, DirectorHint } from '../types/game';

interface DirectorConsoleProps {
  puzzle: Puzzle;
  directorName: string;
  hintRequests?: HintRequest[];
  directorHints?: DirectorHint[];
  answers?: Record<string, any>;
  onSendHint: (message: string) => void;
}

export const DirectorConsole: React.FC<DirectorConsoleProps> = ({
  puzzle,
  directorName: _directorName,
  hintRequests = [],
  directorHints = [],
  answers: _answers = {},
  onSendHint
}) => {
  const [customClue, setCustomClue] = useState('');
  const [justBroadcasted, setJustBroadcasted] = useState(false);

  const safeRequests: HintRequest[] = Array.isArray(hintRequests)
    ? hintRequests
    : (hintRequests && typeof hintRequests === 'object' ? (Object.values(hintRequests) as HintRequest[]) : []);

  const safeHints: DirectorHint[] = Array.isArray(directorHints)
    ? directorHints
    : (directorHints && typeof directorHints === 'object' ? (Object.values(directorHints) as DirectorHint[]) : []);

  const isHintSectionOpen = safeRequests.length > 0;

  const handleSend = (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed || !isHintSectionOpen) return;
    onSendHint(trimmed);
    setCustomClue('');
    setJustBroadcasted(true);
    setTimeout(() => setJustBroadcasted(false), 2500);
  };

  return (
    <div className="rounded-3xl p-5 bg-[#0c101a]/95 border-2 border-cyan-500/60 shadow-2xl space-y-4 font-sans animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-400 text-black shadow-md flex-shrink-0">
            <Clapperboard className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-black text-cyan-300 flex items-center gap-1.5 uppercase">
              <span>Director's Hint Console</span>
              <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-black px-1.5 py-0.5 rounded">
                Director
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide clues upon request • Earn <strong>+50 pts bounty</strong> per broadcast!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHintSectionOpen ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black animate-pulse shadow-sm">
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>{safeRequests.length} Hint Request(s) Active!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070a12] border border-slate-800 text-slate-500 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Waiting for Request</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Request Status Banner */}
      {isHintSectionOpen ? (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-2 animate-fade-in shadow-md relative z-10">
          <div className="flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Contestant requested a hint: <strong className="text-white">{safeRequests.map(r => r.fromName).join(', ')}</strong>. Pick or type a clue below!
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#070a12] border border-slate-800 flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span>
              Hint section is closed. When a contestant clicks <strong>"Ask Director"</strong>, this section will unlock.
            </span>
          </div>
        </div>
      )}

      {/* Preset Quick Clues (Only enabled if requested) */}
      <div className={`space-y-2 relative z-10 transition-opacity ${!isHintSectionOpen ? 'opacity-40 pointer-events-none' : ''}`}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick 1-Click Broadcast Clues</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {puzzle.trivia && (
            <button
              type="button"
              onClick={() => handleSend(`Plot Hook: ${puzzle.trivia}`)}
              className="p-2.5 rounded-xl bg-[#070a12] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">Story / Hook</span>
              <span className="truncate block font-semibold">{puzzle.trivia}</span>
            </button>
          )}

          {puzzle.director && (
            <button
              type="button"
              onClick={() => handleSend(`Directed by the visionary ${puzzle.director}`)}
              className="p-2.5 rounded-xl bg-[#070a12] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">Director Clue</span>
              <span className="truncate block font-semibold">Dir: {puzzle.director}</span>
            </button>
          )}

          {puzzle.musicDirector && (
            <button
              type="button"
              onClick={() => handleSend(`Musical chartbuster score composed by ${puzzle.musicDirector}`)}
              className="p-2.5 rounded-xl bg-[#070a12] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">Music Maestro</span>
              <span className="truncate block font-semibold">Music: {puzzle.musicDirector}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSend(`Released in ${puzzle.year || 2024}, genre: ${puzzle.genre || 'Blockbuster'}`)}
            className="p-2.5 rounded-xl bg-[#070a12] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-left text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-[10px] text-cyan-400 font-bold block uppercase">Release Year & Genre</span>
            <span className="truncate block font-semibold">{puzzle.year} • {puzzle.genre || 'Action'}</span>
          </button>
        </div>
      </div>

      {/* Custom Broadcast Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(customClue);
        }}
        className={`flex gap-2 relative z-10 ${!isHintSectionOpen ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <input
          type="text"
          value={customClue}
          disabled={!isHintSectionOpen}
          onChange={(e) => setCustomClue(e.target.value)}
          placeholder={isHintSectionOpen ? 'Type a custom clue or dialogue reference...' : 'Hint section locked...'}
          className="flex-1 bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!customClue.trim() || !isHintSectionOpen}
          className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Send Hint</span>
        </button>
      </form>

      {/* Success Notification */}
      {justBroadcasted && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>✓ Hint broadcasted to all contestants! +50 pts bounty earned.</span>
        </div>
      )}
    </div>
  );
};
