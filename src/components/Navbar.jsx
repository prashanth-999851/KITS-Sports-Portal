import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, ChevronDown, UserCheck } from 'lucide-react';
import { useConvexState } from '../context/ConvexStateContext';

export default function Navbar({
  darkMode,
  setDarkMode,
  activeSection,
  setActiveSection,
  onOpenMembership,
  onOpenAdmin
}) {
  const { notifications = [] } = useConvexState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNotifIdx, setActiveNotifIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setActiveNotifIdx(prev => (prev + 1) % notifications.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'sports', label: 'Sports' },
    { id: 'executive', label: 'Leadership' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'jntuk-players', label: 'JNTUK Stars' },
    { id: 'membership', label: 'Membership' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rules' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (id === 'about') {
      window.location.href = '/about';
      return;
    }
    if (id === 'jntuk-players') {
      window.location.href = '/jntuk-stars';
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentNotification = notifications[activeNotifIdx] || notifications[0];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#070D1B]/90 backdrop-blur-md shadow-lg border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      {/* Top Dynamic Notification Ticker Bar */}
      <div className="bg-[#1E3A8A] text-white py-1.5 px-4 text-xs font-medium flex justify-between items-center overflow-hidden border-b border-white/10">
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>

          {currentNotification ? (
            <div className="flex items-center gap-2 truncate">
              {currentNotification.type && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                  currentNotification.type === 'Emergency' ? 'bg-red-600 text-white' :
                  currentNotification.type === 'Match Update' ? 'bg-amber-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {currentNotification.type}
                </span>
              )}
              <span className="truncate text-slate-200">
                {currentNotification.message}
              </span>
            </div>
          ) : (
            <span className="text-slate-300 truncate">
              Welcome to KKR & KSR Sports Club Portal • Official Sports Directorate
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-5 text-[11px] text-slate-300 shrink-0 ml-4">
          <span>📍 KKR & KSR Institute of Technology and Sciences, Guntur</span>
          <span>📞 +91 91827 55664</span>
        </div>
      </div>

      {/* Main Navigation - 100% Transparent */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img 
                src="/logo.png" 
                alt="KKR & KSR Sports Club" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div>
                <h1 className="text-sm font-bold text-white leading-tight drop-shadow-sm tracking-wide">
                  KKR & KSR Sports Club
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  KITS • Official Sports Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 7).map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeSection === link.id
                      ? 'text-white bg-[#1E3A8A] shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* More Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/15 flex items-center gap-1 transition-colors">
                  More <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#070D1B]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-1.5 hidden group-hover:block animate-fadeIn">
                  {navLinks.slice(7).map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/15 transition-colors"
                title={darkMode ? "Light Mode" : "Dark Mode"}
              >
                {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Register CTA */}
              <button
                onClick={onOpenMembership}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-all shadow-md shadow-blue-900/40"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Register
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/15"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070D1B]/95 backdrop-blur-2xl border-b border-white/15 px-4 pt-2 pb-5 space-y-1 animate-fadeIn shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === link.id
                  ? 'text-white bg-[#1E3A8A]'
                  : 'text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMembership(); }}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#1E3A8A] text-white text-center shadow-md"
            >
              Register for Membership
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-white/10 text-slate-300 text-center border border-white/15"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
