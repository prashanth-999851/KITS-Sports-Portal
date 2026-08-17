import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CoreValues from '../components/CoreValues';
import SportsSection from '../components/SportsSection';
import ExecutiveBody from '../components/ExecutiveBody';
import Achievements from '../components/Achievements';
import MembershipPortal from '../components/MembershipPortal';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import RegistrationModal from '../components/RegistrationModal';
import { useConvexState } from '../context/ConvexStateContext';
import { useNavigate } from 'react-router-dom';

export default function MainPortalView({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { 
    applications, 
    addStudentApplication 
  } = useConvexState();

  const [activeSection, setActiveSection] = useState('home');
  const [regModalData, setRegModalData] = useState({ isOpen: false, sportName: "", eventName: "" });

  const handleNavigate = (id) => {
    if (id === 'about') {
      navigate('/about');
    } else if (id === 'rules') {
      navigate('/rules');
    } else if (id === 'contact') {
      navigate('/contact');
    } else if (id === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setActiveSection(id);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openSportRegistration = (sportName) => {
    setRegModalData({ isOpen: true, sportName, eventName: "" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={handleNavigate}
        onOpenMembership={() => handleNavigate('membership')}
        onOpenAdmin={() => navigate('/admin/login')}
      />

      {/* Main Page Sections */}
      <main>
        <Hero
          onJoinClick={() => handleNavigate('membership')}
          onExploreClick={() => handleNavigate('sports')}
        />

        <CoreValues />

        <SportsSection onRegisterSport={openSportRegistration} />

        <ExecutiveBody />

        <Achievements />

        <MembershipPortal
          applications={applications}
          onAddApplication={addStudentApplication}
        />

        <Gallery />
      </main>

      {/* Footer */}
      <Footer setActiveSection={handleNavigate} />

      {/* Interactive Global Modals */}
      <RegistrationModal
        sportName={regModalData.sportName}
        eventName={regModalData.eventName}
        isOpen={regModalData.isOpen}
        onClose={() => setRegModalData({ isOpen: false, sportName: "", eventName: "" })}
        onAddApplication={addStudentApplication}
      />

    </div>
  );
}
