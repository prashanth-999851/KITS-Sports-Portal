import React, { useEffect } from 'react';
import JntukPlayersSection from '../components/JntukPlayersSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function JntukStarsView({ onBack }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col transition-colors duration-300">
      
      {/* Unified Top Navbar */}
      <Navbar
        activeSection="jntuk-players"
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-24 lg:pt-28">
        <JntukPlayersSection />
      </main>

      {/* Footer */}
      <Footer setActiveSection={() => navigate('/')} />

    </div>
  );
}
