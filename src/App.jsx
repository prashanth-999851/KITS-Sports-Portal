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
import { ClipboardList, UserCheck, Activity, FileText } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentView, setCurrentView] = useState('portal'); // 'portal', 'rules', or 'contact'

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

  const handleNavigate = (id) => {
    if (id === 'rules') {
      setCurrentView('rules');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'contact') {
      setCurrentView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('portal');
      setActiveSection(id);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
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
      action: () => handleNavigate('rules')
    }
  ];

  // If viewing the Rules & Regulations standalone page:
  if (currentView === 'rules') {
    return (
      <RulesRegulations
        onBack={() => {
          setCurrentView('portal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // If viewing the Contact Us standalone page:
  if (currentView === 'contact') {
    return (
      <ContactSection
        onBack={() => {
          setCurrentView('portal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      
      {/* Top Fixed Header Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        unreadCount={notifications.length}
        onOpenMembership={() => handleNavigate('membership')}
        onOpenAdmin={() => handleNavigate('admin')}
      />

      {/* Main Page Content */}
      <main>
        <Hero
          onJoinClick={() => handleNavigate('membership')}
          onExploreClick={() => handleNavigate('sports')}
        />

        {/* Quick Actions Section */}
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
          onAddApplication={handleAddApplication}
        />

        <Gallery />

        <AdminDashboard
          applications={applications}
          onUpdateAppStatus={handleUpdateAppStatus}
          fixtures={fixtures}
          onUpdateFixtureScore={handleUpdateFixtureScore}
          onBroadcastNotification={handleBroadcastNotification}
        />
      </main>

      {/* Institutional Footer */}
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
