import React, { useState } from 'react';
import { Sun, Moon, Search, Bell, Menu, X, ChevronDown, UserCheck } from 'lucide-react';

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
    { id: 'about', label: 'About' },
    { id: 'sports', label: 'Sports' },
    { id: 'executive', label: 'Leadership' },
    { id: 'events', label: 'Events' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'membership', label: 'Membership' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rules' },
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
    <header className="sticky top-0 z-50 transition-colors duration-300">
      {/* Top Info Bar */}
      <div className="bg-[#0F172A] text-white py-1.5 px-4 text-xs font-medium flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
          <span>Annual Sports Meet 2026 'KRIDA PRATIBHA' — Registrations Open</span>
        </div>
        <div className="hidden md:flex items-center gap-5 text-[11px] text-slate-300">
          <span>📍 KKR & KSR Institute, Guntur</span>
          <span>📞 +91 91827 55664</span>
          <button 
            onClick={() => handleNavClick('admin')}
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Admin Portal
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border-color)] group-hover:border-amber-400 transition-colors bg-slate-100 dark:bg-slate-800">
                <img 
                  src="/assets/images/logo.png" 
                  alt="KITS Sports Club" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100";
                  }}
                />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                  KITS Sports Club
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">
                  Official Sports Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 7).map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    activeSection === link.id
                      ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* More Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] flex items-center gap-1 transition-colors">
                  More <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-1.5 hidden group-hover:block">
                  {navLinks.slice(7).map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                title={darkMode ? "Light Mode" : "Dark Mode"}
              >
                {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Register CTA */}
              <button
                onClick={onOpenMembership}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Register
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--bg-card)] border-b border-[var(--border-color)] px-4 pt-2 pb-5 space-y-1 animate-fadeIn shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === link.id
                  ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMembership(); }}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#1E3A8A] text-white text-center shadow-sm"
            >
              Register for Membership
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] text-center border border-[var(--border-color)]"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
