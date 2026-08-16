import React, { useState } from 'react';
import { Clapperboard, Send, Sparkles, Bell, HelpCircle, MessageSquare } from 'lucide-react';
import { Puzzle, HintRequest, DirectorHint } from '../types/game';

interface DirectorConsoleProps {
  puzzle: Puzzle;
  directorName: string;
  hintRequests: HintRequest[];
  directorHints: DirectorHint[];
  onSendHint: (message: string) => void;
}

export const DirectorConsole: React.FC<DirectorConsoleProps> = ({
  puzzle,
  directorName,
  hintRequests = [],
  directorHints = [],
  onSendHint
}) => {
  const [customClue, setCustomClue] = useState('');

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    onSendHint(msg.trim());
    setCustomClue('');
  };

  return (
    <div className="glass-card rounded-3xl p-5 border-2 border-brand-500/60 shadow-xl shadow-brand-500/10 space-y-4 animate-pop">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cinema-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500 text-black shadow-md">
            <Clapperboard className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-amber-300 flex items-center gap-1.5">
              <span>Director's Clue Console</span>
              <span className="text-[9px] bg-brand-500/20 text-brand-400 font-bold px-1.5 py-0.5 rounded uppercase">
                Director
              </span>
            </h3>
            <p className="text-[11px] text-cinema-muted">
              Guide the contestants with hints & earn +50 pts bounty for each clue given!
            </p>
          </div>
        </div>

        {hintRequests.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
            <Bell className="w-3.5 h-3.5" />
            <span>{hintRequests.length} Request(s)</span>
          </div>
        )}
      </div>

      {/* Pending Contestant Requests Banner */}
      {hintRequests.length > 0 && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>
              Contestants are asking for help: <strong>{hintRequests.map(r => r.fromName).join(', ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Quick Clue Presets */}
      <div>
        <span className="text-[10px] uppercase font-bold text-cinema-muted block mb-2">
          ⚡ Quick Broadcast Clues (+50 pts bounty)
        </span>
        <div className="flex flex-wrap gap-2">
          {puzzle.director && (
            <button
              onClick={() => handleSend(`Director Clue: Directed by ${puzzle.director}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-semibold transition-all text-left"
            >
              🎬 Dir: <strong>{puzzle.director}</strong>
            </button>
          )}

          {puzzle.musicDirector && (
            <button
              onClick={() => handleSend(`Music Clue: Songs composed by ${puzzle.musicDirector}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-semibold transition-all text-left"
            >
              🎵 Music: <strong>{puzzle.musicDirector}</strong>
            </button>
          )}

          {puzzle.genre && (
            <button
              onClick={() => handleSend(`Genre: ${puzzle.genre} (${puzzle.year})`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-semibold transition-all text-left"
            >
              🎭 Genre: <strong>{puzzle.genre}</strong>
            </button>
          )}

          {puzzle.trivia && (
            <button
              onClick={() => handleSend(`Story Clue: ${puzzle.trivia}`)}
              className="px-3 py-1.5 rounded-xl bg-cinema-dark hover:bg-cinema-cardHover border border-cinema-border/70 hover:border-brand-500/40 text-slate-200 text-xs font-semibold transition-all text-left max-w-xs truncate"
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
        className="flex gap-2"
      >
        <input
          type="text"
          value={customClue}
          onChange={(e) => setCustomClue(e.target.value)}
          placeholder="Type a custom Tamil dialogue, character name, or clue..."
          className="flex-1 bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!customClue.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-black font-bold text-xs shadow-md shadow-brand-500/20 hover:brightness-110 flex items-center gap-1.5 transition-all disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Clue</span>
        </button>
      </form>

      {/* Previously Broadcasted Clues Log */}
      {directorHints.length > 0 && (
        <div className="border-t border-cinema-border/40 pt-3 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-cinema-muted block">
            Broadcasted Clues:
          </span>
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {directorHints.map((hint) => (
              <div
                key={hint.id}
                className="p-2 rounded-xl bg-cinema-dark/60 border border-cinema-border/40 text-xs text-amber-300 flex items-start gap-2"
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
