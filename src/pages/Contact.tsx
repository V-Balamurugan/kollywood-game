import React, { useState } from 'react';
import {
  Mail, Send, User, MessageSquare, MapPin, Sparkles,
  CheckCircle2, ArrowLeft, Heart, Film, Globe, MessageCircle
} from 'lucide-react';

interface ContactProps {
  onBack: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'collaboration' | 'general'>('suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto overflow-hidden animate-fade-in font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Lobby</span>
      </button>

      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span>Creator Direct Line</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-200 drop-shadow-[0_0_25px_rgba(6,182,212,0.85)]">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
          Have movie trivia suggestions, feature ideas, bug reports, or tournament queries? Send a direct dispatch to the creator!
        </p>
      </div>

      {/* Main Grid: Form + Creator Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Message Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.08)]">
          
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
                Message Dispatched!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you for your feedback! Your note has been delivered to the creator.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cinephile"
                      className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Subject / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Inquiry Topic
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'suggestion', label: '🎬 Film Suggestion' },
                    { id: 'bug', label: '🐞 Bug Report' },
                    { id: 'collaboration', label: '🤝 Collab' },
                    { id: 'general', label: '💬 General' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                        category === cat.id
                          ? 'border-2 border-cyan-400 text-cyan-300 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-[#070a12] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Message / Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts, recommended Tamil movies, clues to add, or feedback..."
                  className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-400 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">DISPATCHING MESSAGE...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>TRANSMIT DISPATCH</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Creator Info Profile (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Creator Identity Card */}
          <div className="rounded-3xl bg-[#0c101a]/90 border border-slate-800/90 backdrop-blur-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-[#070a12] border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0">
                <Film className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-display">
                  Balamurugan V
                </h3>
                <p className="text-xs text-cyan-400 font-semibold">
                  Lead Creator & Engineer
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Kollywood 2×2 Trivia Arena</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Multiplayer Cinema Trivia</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-800">
              "Built for passionate Tamil cinema fans worldwide. Celebrating iconic heroes, heroines, blockbusters, and chartbuster soundtracks."
            </p>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-2xl bg-[#070a12] border border-slate-800 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Community & Fair Use</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              All cinema content, audio samples, and cast images are referenced strictly for educational appreciation and fandom trivia challenges.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
