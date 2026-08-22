import React, { useState } from 'react';
import { Clapperboard, Send, Bell, HelpCircle, MessageSquare, Lock } from 'lucide-react';
import { Puzzle, HintRequest, DirectorHint } from '../types/game';

interface DirectorConsoleProps {
  puzzle: Puzzle;
  directorName: string;
  hintRequests: HintRequest[];
  directorHints: DirectorHint[];
  answers?: Record<string, any>;
  onSendHint: (message: string) => void;
}

export const DirectorConsole: React.FC<DirectorConsoleProps> = ({
  puzzle,
  directorName,
  hintRequests = [],
  directorHints = [],
  answers = {},
  onSendHint
}) => {
  const [customClue, setCustomClue] = useState('');
  const isUnlocked = hintRequests && hintRequests.length > 0;

  const handleSend = (msg: string) => {
    if (!msg.trim() || !isUnlocked) return;
    onSendHint(msg.trim());
    setCustomClue('');
  };

  return (
    <div className="glass-card rounded-3xl p-5 border-2 border-brand-500/60 shadow-2xl space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500 text-black shadow-md flex-shrink-0">
            <Clapperboard className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-amber-300 flex items-center gap-1.5">
              <span>Director's Broadcast Console</span>
              <span className="text-[9px] bg-brand-500/20 text-brand-400 font-black px-1.5 py-0.5 rounded uppercase">
                Director Only
              </span>
            </h3>
            <p className="text-[11px] text-cinema-muted">
              Guide the contestants with hints & earn +50 pts bounty for each clue broadcasted!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black animate-pulse shadow-sm">
              <Bell className="w-3.5 h-3.5" />
              <span>{hintRequests.length} Request(s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinema-dark border border-cinema-border text-cinema-muted text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400/70" />
              <span>Locked (Waiting for Request)</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Status / Request Banner */}
      {isUnlocked ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 animate-fade-in shadow-md">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
            <span>
              Contestant asked for a hint: <strong className="text-white">{hintRequests.map(r => r.fromName).join(', ')}</strong> (-25 pts deducted). Choose or type <strong>1 clue</strong> to broadcast!
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-cinema-dark/80 border border-cinema-border/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-cinema-muted font-medium">
            <Lock className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
            <span>
              Broadcast locked. When a contestant clicks <strong>"Ask Director"</strong>, this console unlocks to send 1 clue.
            </span>
          </div>
        </div>
      )}

      {/* Quick Clue Presets */}
      <div className={!isUnlocked ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <span className="text-[10px] uppercase font-black text-cinema-muted block mb-2 tracking-wider">
          ⚡ Quick Broadcast Clues (+50 pts bounty to director):
        </span>
        <div className="flex flex-wrap gap-2">
          {puzzle.director && (
            <button
              disabled={!isUnlocked}
              onClick={() => handleSend(`Director Clue: Directed by ${puzzle.director}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left disabled:opacity-50"
            >
              🎬 Dir: <strong>{puzzle.director}</strong>
            </button>
          )}

          {puzzle.musicDirector && (
            <button
              disabled={!isUnlocked}
              onClick={() => handleSend(`Music Clue: Songs composed by ${puzzle.musicDirector}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left disabled:opacity-50"
            >
              🎵 Music: <strong>{puzzle.musicDirector}</strong>
            </button>
          )}

          {puzzle.genre && (
            <button
              disabled={!isUnlocked}
              onClick={() => handleSend(`Genre: ${puzzle.genre} (${puzzle.year})`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left disabled:opacity-50"
            >
              🎭 Genre: <strong>{puzzle.genre}</strong>
            </button>
          )}

          {puzzle.trivia && (
            <button
              disabled={!isUnlocked}
              onClick={() => handleSend(`Story Clue: ${puzzle.trivia}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left max-w-xs truncate disabled:opacity-50"
              title={puzzle.trivia}
            >
              💡 Plot: <strong>{puzzle.trivia}</strong>
            </button>
          )}
        </div>
      </div>

      {/* Custom Director Clue Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(customClue);
        }}
        className={`flex gap-2 ${!isUnlocked ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}`}
      >
        <input
          type="text"
          disabled={!isUnlocked}
          value={customClue}
          onChange={(e) => setCustomClue(e.target.value)}
          placeholder={isUnlocked ? "Type a custom Tamil dialogue, character hint, or clue..." : "Console locked until player requests hint..."}
          className="flex-1 bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isUnlocked || !customClue.trim()}
          className="px-4 py-2.5 rounded-xl btn-cinema-primary text-black font-black text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast (1 Clue)</span>
        </button>
      </form>

      {/* Previously Broadcasted Clues Log */}
      {directorHints.length > 0 && (
        <div className="border-t border-cinema-border/50 pt-3 space-y-1.5">
          <span className="text-[10px] uppercase font-black text-cinema-muted block tracking-wider">
            Broadcasted Clues ({directorHints.length}):
          </span>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {directorHints.map((hint) => (
              <div
                key={hint.id}
                className="p-2 rounded-xl bg-cinema-dark/70 border border-cinema-border/50 text-xs text-amber-300 flex items-start gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>"{hint.message}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
