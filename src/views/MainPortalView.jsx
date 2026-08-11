import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import CoreValues from '../components/CoreValues';
import SportsSection from '../components/SportsSection';
import ExecutiveBody from '../components/ExecutiveBody';
import EventsTournaments from '../components/EventsTournaments';
import Achievements from '../components/Achievements';
import MembershipPortal from '../components/MembershipPortal';
import Gallery from '../components/Gallery';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import SearchModal from '../components/SearchModal';
import RegistrationModal from '../components/RegistrationModal';
import NotificationsModal from '../components/NotificationsModal';
import { useConvexState } from '../context/ConvexStateContext';
import { ClipboardList, UserCheck, Activity, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MainPortalView({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { 
    applications, 
    addStudentApplication, 
    notifications, 
    clearNotifications 
  } = useConvexState();

  const [activeSection, setActiveSection] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [regModalData, setRegModalData] = useState({ isOpen: false, sportName: "", eventName: "" });

  const handleNavigate = (id) => {
    if (id === 'rules') {
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

  const openEventRegistration = (eventName) => {
    setRegModalData({ isOpen: true, sportName: "", eventName });
  };

  const quickActions = [
    {
      icon: ClipboardList,
      title: "Sports Registration",
      desc: "Register for any of our 11 sports disciplines",
      action: () => handleNavigate('membership')
    },
    {
      icon: UserCheck,
      title: "Membership Status",
      desc: "Track your application and approval status",
      action: () => handleNavigate('membership')
    },
    {
      icon: Activity,
      title: "Live Scores",
      desc: "View live match scores and tournament fixtures",
      action: () => handleNavigate('events')
    },
    {
      icon: FileText,
      title: "Rules & Constitution",
      desc: "Read official rules & eligibility charter",
      action: () => navigate('/rules')
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        unreadCount={notifications.length}
        onOpenMembership={() => handleNavigate('membership')}
        onOpenAdmin={() => navigate('/admin/login')}
      />

      {/* Main Page Sections */}
      <main>
        <Hero
          onJoinClick={() => handleNavigate('membership')}
          onExploreClick={() => handleNavigate('sports')}
        />

        {/* Quick Actions */}
        <section className="py-12 bg-[var(--bg-main)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="group p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-400 text-left transition-all duration-200 card-hover"
                  >
                    <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{action.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <AboutUs />

        <CoreValues />

        <SportsSection onRegisterSport={openSportRegistration} />

        <ExecutiveBody />

        <EventsTournaments onRegisterEvent={openEventRegistration} />

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
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(secId) => handleNavigate(secId)}
      />

      <RegistrationModal
        sportName={regModalData.sportName}
        eventName={regModalData.eventName}
        isOpen={regModalData.isOpen}
        onClose={() => setRegModalData({ isOpen: false, sportName: "", eventName: "" })}
        onAddApplication={addStudentApplication}
      />

      <NotificationsModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onClearNotifications={clearNotifications}
      />

    </div>
  );
}
