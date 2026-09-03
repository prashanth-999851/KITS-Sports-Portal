import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CoreValues from '../components/CoreValues';
import SportsSection from '../components/SportsSection';
import ExecutiveBody from '../components/ExecutiveBody';
import Achievements from '../components/Achievements';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MainPortalView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      const timer = setTimeout(() => {
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (location.pathname === '/' && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.hash, location.pathname]);

  const handleNavigate = (id) => {
    if (id === 'about') {
      navigate('/about');
    } else if (id === 'rules') {
      navigate('/rules');
    } else if (id === 'contact') {
      navigate('/contact');
    } else if (id === 'membership' || id === 'register') {
      navigate('/register');
    } else if (id === 'jntuk-players' || id === 'jntuk-stars') {
      navigate('/jntuk-stars');
    } else if (id === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setActiveSection(id);
      const elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${id}`);
      }
    }
  };

  const openSportRegistration = (sportName) => {
    navigate(`/register?sport=${encodeURIComponent(sportName)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={handleNavigate}
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Page Sections */}
      <main>
        <Hero
          onJoinClick={() => navigate('/register')}
          onExploreClick={() => handleNavigate('sports')}
        />

        <CoreValues />

        <SportsSection onRegisterSport={openSportRegistration} />

        <ExecutiveBody />

        <Achievements />

        <Gallery />
      </main>

      {/* Footer */}
      <Footer setActiveSection={handleNavigate} />

    </div>
  );
}
