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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back to Portal Home"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[#0b2e5b] leading-tight truncate">
                  JNTUK Players Roster
                </h1>
                <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                  Inter-University Athletic Representation • KKR & KSR Institute
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#0b2e5b] shrink-0" />
            <span className="hidden md:inline">JNTUK Sports Board</span>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <JntukPlayersSection />
      </main>

      {/* Footer */}
      <Footer setActiveSection={() => navigate('/')} />

    </div>
  );
}
