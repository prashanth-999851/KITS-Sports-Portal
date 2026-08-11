import React, { useState } from 'react';
import { Sun, Moon, Search, Bell, Menu, X, Shield, ChevronRight, UserCheck } from 'lucide-react';

export default function Navbar({
  darkMode,
  setDarkMode,
  activeSection,
  setActiveSection,
  onOpenSearch,
  onOpenNotifications,
  unreadCount,
  onOpenMembership,
  onOpenAdmin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'values', label: 'Core Values' },
    { id: 'sports', label: 'Sports (11)' },
    { id: 'executive', label: 'Executive Body' },
    { id: 'events', label: 'Events & Fixtures' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'membership', label: 'Membership' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rulebook' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 bg-white/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 py-1 px-4 text-xs font-bold tracking-wide flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse">
          <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[10px] uppercase">Live</span>
          <span>Annual Sports Meet 2026 'KRIDA PRATIBHA' Registrations Open!</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px]">
          <span>📍 KKR & KSR Institute Campus, Guntur</span>
          <span>📞 Sports Desk: +91 91827 55664</span>
          <button 
            onClick={() => handleNavClick('admin')}
            className="font-extrabold underline hover:text-slate-800 transition"
          >
            Admin Console Portal
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform duration-300 bg-slate-900">
              <img 
                src="/kkr_ksr_logo.jpg" 
                alt="KKR & KSR Sports Club Emblem" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  KKR & KSR
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold uppercase">
                  Sports Club
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Institute of Technology & Sciences
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.slice(0, 8).map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeSection === link.id
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Dropdown More */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-1">
                More <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 hidden group-hover:block transition-all">
                {navLinks.slice(8).map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Action Buttons & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              title="Search Portal (Ctrl+K)"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Notifications Popover Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />}
            </button>

            {/* Join Club / Membership CTA */}
            <button
              onClick={onOpenMembership}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              <UserCheck className="w-4 h-4" />
              Join Club
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-fadeIn shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition ${
                activeSection === link.id
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMembership(); }}
              className="w-full py-3 rounded-xl text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-center shadow-lg"
            >
              Join Club / Student Portal
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-center border border-slate-300 dark:border-slate-700"
            >
              Admin Dashboard Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
