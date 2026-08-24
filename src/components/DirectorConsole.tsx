import React, { useState } from 'react';
import { Clapperboard, Send, Bell, HelpCircle, MessageSquare, Sparkles, Lock, Check } from 'lucide-react';
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
  directorName,
  hintRequests = [],
  directorHints = [],
  answers = {},
  onSendHint
}) => {
  const [customClue, setCustomClue] = useState('');
  const [justBroadcasted, setJustBroadcasted] = useState(false);

  // Normalize safe arrays in case Firebase returns objects
  const safeRequests: HintRequest[] = Array.isArray(hintRequests)
    ? hintRequests
    : (hintRequests && typeof hintRequests === 'object' ? (Object.values(hintRequests) as HintRequest[]) : []);

  const safeHints: DirectorHint[] = Array.isArray(directorHints)
    ? directorHints
    : (directorHints && typeof directorHints === 'object' ? (Object.values(directorHints) as DirectorHint[]) : []);

  // The hint section is ONLY open if a player has asked for a hint
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
    <div className="glass-card rounded-3xl p-4 sm:p-5 border-2 border-brand-500/70 shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3 flex-wrap gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500 text-black shadow-md flex-shrink-0">
            <Clapperboard className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-black text-amber-300 flex items-center gap-1.5">
              <span>Director's Hint Console</span>
              <span className="text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/40 font-black px-1.5 py-0.5 rounded uppercase">
                Director
              </span>
            </h3>
            <p className="text-[11px] text-cinema-muted">
              Respond to contestant hint requests • Earn <strong>+50 pts bounty</strong> per clue provided!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHintSectionOpen ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black animate-pulse shadow-sm">
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span>{safeRequests.length} Hint Request(s) Active!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cinema-dark border border-cinema-border text-cinema-muted text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Hint Section Closed (Waiting for Request)</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Request Status Banner */}
      {isHintSectionOpen ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-between gap-2 animate-fade-in shadow-md relative z-10">
          <div className="flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
            <span>
              Contestant asked for a hint: <strong className="text-white">{safeRequests.map(r => r.fromName).join(', ')}</strong> (-25 pts deducted). Choose or type <strong>1 clue</strong> to send below!
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-cinema-dark/80 border border-cinema-border/60 flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 text-xs text-cinema-muted font-medium">
            <Lock className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
            <span>
              Hint section is closed. When a contestant clicks <strong>"Ask Director"</strong>, this section will open to send 1 hint (+50 pts bounty).
            </span>
          </div>
        </div>
      )}

      {/* Hint Controls (Only interactive when isHintSectionOpen is true) */}
      <div className={`space-y-3 relative z-10 transition-all duration-300 ${!isHintSectionOpen ? 'opacity-35 pointer-events-none' : 'opacity-100'}`}>
        {/* Quick Clue Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Quick Clue Options (+50 pts bounty):</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {puzzle.director && (
              <button
                type="button"
                disabled={!isHintSectionOpen}
                onClick={() => handleSend(`Director Clue: Directed by ${puzzle.director}`)}
                className="px-3 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🎬 Dir:</span>
                <strong className="text-white">{puzzle.director}</strong>
              </button>
            )}

            {puzzle.musicDirector && (
              <button
                type="button"
                disabled={!isHintSectionOpen}
                onClick={() => handleSend(`Music Clue: Songs composed by ${puzzle.musicDirector}`)}
                className="px-3 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🎵 Music:</span>
                <strong className="text-white">{puzzle.musicDirector}</strong>
              </button>
            )}

            {puzzle.genre && (
              <button
                type="button"
                disabled={!isHintSectionOpen}
                onClick={() => handleSend(`Genre Clue: ${puzzle.genre} (${puzzle.year || 2024})`)}
                className="px-3 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🎭 Genre:</span>
                <strong className="text-white">{puzzle.genre}</strong>
              </button>
            )}

            {puzzle.trivia && (
              <button
                type="button"
                disabled={!isHintSectionOpen}
                onClick={() => handleSend(`Story Hook: ${puzzle.trivia}`)}
                className="px-3 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border hover:border-brand-500/50 text-slate-200 text-xs font-bold transition-all active:scale-95 text-left max-w-xs truncate shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                title={puzzle.trivia}
              >
                <span>💡 Plot:</span>
                <strong className="text-white truncate">{puzzle.trivia}</strong>
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
            disabled={!isHintSectionOpen}
            value={customClue}
            onChange={(e) => setCustomClue(e.target.value)}
            placeholder={isHintSectionOpen ? "Type a custom Tamil dialogue, punch line, actor hint, or story clue..." : "Hint section is closed until a contestant asks for a hint..."}
            className="flex-1 bg-cinema-dark border border-cinema-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isHintSectionOpen || !customClue.trim()}
            className="px-4 py-2.5 rounded-xl btn-cinema-primary text-black font-black text-xs sm:text-sm shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            {justBroadcasted ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Hint Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Hint</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Previously Broadcasted Clues Log */}
      {safeHints.length > 0 && (
        <div className="border-t border-cinema-border/50 pt-3 space-y-1.5 relative z-10">
          <span className="text-[10px] uppercase font-black text-cinema-muted block tracking-wider">
            Hints Provided This Round ({safeHints.length}):
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {safeHints.map((hint) => (
              <div
                key={hint.id || `hint-${hint.timestamp}`}
                className="p-2.5 rounded-xl bg-cinema-dark/80 border border-cinema-border/60 text-xs text-amber-300 flex items-start gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">"{hint.message}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
