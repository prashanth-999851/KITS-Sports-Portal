import React, { useEffect } from 'react';
import JntukPlayersSection from '../components/JntukPlayersSection';
import Footer from '../components/Footer';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JntukStarsView({ onBack }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans flex flex-col transition-colors duration-300">
      
      {/* Standalone Header Bar */}
      <div className="bg-[#0F172A] text-white py-2.5 sm:py-3 px-3 sm:px-8 border-b border-slate-800 flex items-center justify-between gap-2 sticky top-0 z-50">
        <button
          onClick={handleBack}
          aria-label="Back to Main Portal"
          className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-[#1E3A8A] text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Main Portal</span>
        </button>

        <div className="flex items-center gap-2 shrink min-w-0">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
            JNTUK Athletes Roster
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <JntukPlayersSection />
      </main>

      {/* Footer */}
      <Footer setActiveSection={() => navigate('/')} />

    </div>
  );
}
