import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useConvexState } from '../context/ConvexStateContext';

export default function Navbar({
  activeSection,
  setActiveSection,
  onOpenMembership
}) {
  const { notifications = [] } = useConvexState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'sports', label: 'Sports' },
    { id: 'executive', label: 'Leadership' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'jntuk-players', label: 'JNTUK Players' },
    { id: 'membership', label: 'Membership' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rules' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setActiveSection?.(id);
    setMobileMenuOpen(false);
  };

  const hasNotifications = notifications && notifications.length > 0;

  // Build a seamless looping list of items
  const repeatedNotifications = notifications.length > 0 ? [
    ...notifications,
    ...notifications,
    ...notifications,
    ...notifications,
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-md">
      
      {/* 1. Main Navigation Bar (Clean White Background with Text-Underline Hover Lines) */}
      <div className="bg-white border-b border-slate-200 shadow-sm transition-colors">
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
              <h1 className="text-base font-bold text-[#0b2e5b] leading-tight tracking-wide group-hover:text-[#0d3a73] transition-colors">
                KKR & KSR Sports Club
              </h1>
            </div>

            {/* Desktop Navigation with Tight Underlines Right Below Text */}
            <nav className="hidden lg:flex items-center gap-2 h-16">
              {navLinks.slice(0, 7).map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`relative px-3 py-2 text-sm font-bold transition-colors flex items-center group cursor-pointer ${
                      isActive
                        ? 'text-[#0b2e5b]'
                        : 'text-slate-700 hover:text-[#0b2e5b]'
                    }`}
                  >
                    <span className="relative">
                      {link.label}
                      
                      {/* Underline right below the text on hover & active */}
                      <span 
                        className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#0b2e5b] transition-all duration-200 origin-center ${
                          isActive
                            ? 'opacity-100 scale-x-100'
                            : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}

              {/* More Dropdown with Text Underline */}
              <div className="relative group flex items-center">
                <button className="relative px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b2e5b] flex items-center gap-1 transition-colors cursor-pointer group">
                  <span className="relative flex items-center gap-1">
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    
                    {/* Underline right below More */}
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#0b2e5b] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-200 origin-center" />
                  </span>
                </button>

                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl p-1.5 hidden group-hover:block animate-fadeIn z-50">
                  {navLinks.slice(7).map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0b2e5b] hover:bg-slate-50 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">

              {/* Register CTA - Solid Theme Blue Button */}
              <button
                onClick={onOpenMembership}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
              >
                Register
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Announcement Header - Clean Black Bar, White Text, Smooth Realistic Ticker (No Icons) */}
      {hasNotifications && (
        <div className="bg-black text-white py-1.5 px-3 sm:px-4 text-xs font-medium flex items-center overflow-hidden border-t border-white/10 shadow-inner select-none">
          
          {/* Left Title Label (No Icons) */}
          <div className="shrink-0 bg-black pr-3.5 z-10 border-r border-white/20">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Announcements
            </span>
          </div>

          {/* Realistic Continuous Scrolling Ticker */}
          <div className="flex-1 overflow-hidden relative pl-4">
            <div className="animate-ticker whitespace-nowrap flex items-center gap-10 text-white">
              
              {/* Primary Looping Track */}
              <div className="flex items-center gap-10 shrink-0">
                {repeatedNotifications.map((notif, idx) => (
                  <span key={idx} className="flex items-center gap-10">
                    <span className="text-white/95 font-medium tracking-wide">
                      {notif.message}
                    </span>
                    <span className="text-white/30">•</span>
                  </span>
                ))}
              </div>

              {/* Duplicate Track for Smooth Infinite Loop */}
              <div className="flex items-center gap-10 shrink-0">
                {repeatedNotifications.map((notif, idx) => (
                  <span key={`dup-${idx}`} className="flex items-center gap-10">
                    <span className="text-white/95 font-medium tracking-wide">
                      {notif.message}
                    </span>
                    <span className="text-white/30">•</span>
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* Right Institutional Label (No Icons) */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-white/80 shrink-0 ml-4 pl-3.5 bg-black z-10 border-l border-white/20 font-medium">
            <span>KKR and KSR Institute of Technology and Sciences</span>
            <span>+91 91827 55664</span>
          </div>

        </div>
      )}

      {/* Mobile Drawer with Left-Line Indicators */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1 animate-fadeIn shadow-xl">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 text-sm font-semibold transition-all border-l-2 ${
                  isActive
                    ? 'border-[#0b2e5b] text-[#0b2e5b] bg-slate-50 pl-4'
                    : 'border-transparent text-slate-700 hover:text-[#0b2e5b] hover:border-slate-300 pl-3'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-200">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMembership(); }}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#0b2e5b] text-white text-center transition-colors shadow-sm cursor-pointer"
            >
              Register for Membership
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
