import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
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
      <div className="bg-[#0F172A] text-white py-3 px-4 sm:px-8 border-b border-slate-800 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-[#1E3A8A] text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">JNTUK Represented Athletes Roster</span>
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
