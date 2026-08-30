import React, { useState } from 'react';
import { Shield, FileText, HelpCircle, Mail, X, Cookie } from 'lucide-react';

interface FooterProps {
  onOpenHowToPlay?: () => void;
  onOpenProfile?: () => void;
  onOpenLibrary?: () => void;
  onOpenAdmin?: () => void;
  onOpenContact?: () => void;
  onOpenCookieSettings?: () => void;
  isFixed?: boolean;
}

type InfoModalType = 'privacy' | 'terms' | 'support' | null;

export const Footer: React.FC<FooterProps> = ({
  onOpenContact,
  onOpenCookieSettings,
  isFixed = false
}) => {
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);

  const handleContactClick = () => {
    if (onOpenContact) {
      onOpenContact();
    }
  };

  return (
    <>
      <footer
        className={`w-full bg-[#070a12]/95 border-t border-slate-800/80 backdrop-blur-md relative z-30 font-sans ${
          isFixed ? 'fixed bottom-0 left-0 right-0 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]' : 'mt-auto'
        }`}
      >
        {/* Subtle top neon ambient hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          
          {/* Left: Brand name */}
          <div className="flex items-center flex-shrink-0">
            <span className="font-display font-black text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] select-none">
              KOLLYWOOD GAME
            </span>
          </div>

          {/* Center: Legal & Support Utility Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 font-medium">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Privacy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Terms</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('support')}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Support</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenCookieSettings) onOpenCookieSettings();
              }}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Cookie className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cookie Settings</span>
            </button>

            <button
              type="button"
              onClick={handleContactClick}
              className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Page</span>
            </button>
          </nav>

          {/* Right: Copyright & Attribution */}
          <div className="text-[11px] sm:text-xs text-slate-500 text-center md:text-right flex-shrink-0 font-normal">
            © 2026 Kollywood Game • Developed by <strong className="text-cyan-400 font-semibold">Balamurugan V</strong>
          </div>
        </div>
      </footer>

      {/* Info Dialog Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0c101a] border border-slate-800 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.1)] text-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                {activeModal === 'privacy' && <Shield className="w-5 h-5 text-cyan-400" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-cyan-400" />}
                {activeModal === 'support' && <HelpCircle className="w-5 h-5 text-cyan-400" />}
                <h3 className="text-base sm:text-lg font-bold text-white font-display capitalize">
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'support' && 'Player Support & FAQs'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    Kollywood Game respects your privacy. We collect minimal gameplay data strictly for multiplayer room synchronization, leaderboards, and user profiles.
                  </p>
                  <p>
                    No personal data is sold or shared. Guest profiles are persisted securely in local browser storage.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    By participating in Kollywood Game matches, players agree to fair-play guidelines in multiplayer games.
                  </p>
                  <p>
                    All movie titles, soundtracks, and media references are property of their respective creators and copyright holders, curated under fair-use cinema trivia and fandom appreciation.
                  </p>
                </>
              )}

              {activeModal === 'support' && (
                <>
                  <p>
                    <strong>How does 2×2 Grid Trivia work?</strong>
                    <br />
                    Each round reveals 4 interconnected clues: Hero, Heroine, Movie Name, and Hit Song. Guess all 4 accurately to earn multiplier bonuses.
                  </p>
                  <p>
                    <strong>Multiplayer Matches:</strong>
                    <br />
                    Create a room to generate a 6-character code and share it with friends for instant synchronized buzzer battles.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
