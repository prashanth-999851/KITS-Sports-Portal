import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import CoreValues from './components/CoreValues';
import SportsSection from './components/SportsSection';
import ExecutiveBody from './components/ExecutiveBody';
import EventsTournaments from './components/EventsTournaments';
import Achievements from './components/Achievements';
import MembershipPortal from './components/MembershipPortal';
import Gallery from './components/Gallery';
import RulesRegulations from './components/RulesRegulations';
import AdminDashboard from './components/AdminDashboard';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import RegistrationModal from './components/RegistrationModal';
import NotificationsModal from './components/NotificationsModal';
import { INITIAL_STUDENT_APPLICATIONS, FIXTURES_DATA } from './data/mockData';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  // Application State
  const [applications, setApplications] = useState(INITIAL_STUDENT_APPLICATIONS);

  // Fixtures State
  const [fixtures, setFixtures] = useState(FIXTURES_DATA);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { text: "Annual Sports Meet 2026 'KRIDA PRATIBHA' Registration is officially open!", time: "10 mins ago" },
    { text: "Inter-College Cricket Semi-Finals live match in progress on Turf Oval Ground.", time: "1 hour ago" },
    { text: "KKR & KSR Mind Champions bagged 1st rank in All India University Chess League.", time: " Yesterday" }
  ]);

  // Modals State
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [regModalData, setRegModalData] = useState({ isOpen: false, sportName: "", eventName: "" });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddApplication = (newApp) => {
    setApplications(prev => [newApp, ...prev]);
  };

  const handleUpdateAppStatus = (id, newStatus) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleUpdateFixtureScore = (id, score1, score2) => {
    setFixtures(prev => prev.map(f => f.id === id ? { ...f, score1, score2 } : f));
  };

  const handleBroadcastNotification = (text) => {
    setNotifications(prev => [{ text, time: "Just now" }, ...prev]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const openSportRegistration = (sportName) => {
    setRegModalData({ isOpen: true, sportName, eventName: "" });
  };

  const openEventRegistration = (eventName) => {
    setRegModalData({ isOpen: true, sportName: "", eventName });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Fixed Header Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        unreadCount={notifications.length}
        onOpenMembership={() => {
          setActiveSection('membership');
          document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          setActiveSection('admin');
          document.getElementById('admin')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Page Content */}
      <main>
        <Hero
          onJoinClick={() => {
            setActiveSection('membership');
            document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreClick={() => {
            setActiveSection('sports');
            document.getElementById('sports')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <AboutUs />

        <CoreValues />

        <SportsSection onRegisterSport={openSportRegistration} />

        <ExecutiveBody />

        <EventsTournaments onRegisterEvent={openEventRegistration} />

        <Achievements />

        <MembershipPortal
          applications={applications}
          onAddApplication={handleAddApplication}
        />

        <Gallery />

        <RulesRegulations />

        <AdminDashboard
          applications={applications}
          onUpdateAppStatus={handleUpdateAppStatus}
          fixtures={fixtures}
          onUpdateFixtureScore={handleUpdateFixtureScore}
          onBroadcastNotification={handleBroadcastNotification}
        />

        <ContactSection />
      </main>

      {/* Institutional Footer */}
      <Footer setActiveSection={setActiveSection} />

      {/* Interactive Global Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(secId) => {
          setActiveSection(secId);
          document.getElementById(secId)?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <RegistrationModal
        sportName={regModalData.sportName}
        eventName={regModalData.eventName}
        isOpen={regModalData.isOpen}
        onClose={() => setRegModalData({ isOpen: false, sportName: "", eventName: "" })}
        onAddApplication={handleAddApplication}
      />

      <NotificationsModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />

    </div>
  );
}
