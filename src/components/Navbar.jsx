import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConvexState } from '../context/ConvexStateContext';
import { tw } from '@/constants';

export default function Navbar({
  activeSection,
  setActiveSection,
  onOpenMembership
}) {
  const navigate = useNavigate();
  const { notifications = [] } = useConvexState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'sports', label: 'Sports' },
    { id: 'executive', label: 'Leadership' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'jntuk-players', label: 'JNTUK Players' },
    { id: 'membership', label: 'Registration' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'rules', label: 'Rules' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);

    if (setActiveSection) {
      setActiveSection(id);
      return;
    }

    const routeMap = {
      home: '/',
      about: '/about',
      sports: '/#sports',
      executive: '/#executive',
      achievements: '/#achievements',
      'jntuk-players': '/jntuk-players',
      membership: '/register',
      registration: '/register',
      gallery: '/#gallery',
      rules: '/rules',
      contact: '/contact',
    };

    const targetRoute = routeMap[id] || '/';
    if (targetRoute.startsWith('/#')) {
      if (window.location.pathname !== '/') {
        navigate(targetRoute);
      } else {
        const sectionId = targetRoute.replace('/#', '');
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(targetRoute);
    }
  };

  const hasNotifications = notifications && notifications.length > 0;

  // Build repeated list to ensure smooth infinite marquee scroll even with 1 notification
  const tickerItems = notifications.length > 0 ? (
    notifications.length < 4
      ? [...notifications, ...notifications, ...notifications, ...notifications]
      : notifications
  ) : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-md">
      
      {/* 1. Main Navigation Bar */}
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
                alt="KiTS Sports Club" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <h1 className={`${tw`text-body`} font-bold text-[#0b2e5b] leading-tight tracking-wide group-hover:text-[#0d3a73] transition-colors`}>
                K<span className="text-red-600">i</span>TS Sports Club
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 h-16">
              {navLinks.slice(0, 7).map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`relative px-3 py-2 ${tw`text-body`} font-bold transition-colors flex items-center group cursor-pointer ${
                      isActive
                        ? 'text-[#0b2e5b]'
                        : 'text-slate-700 hover:text-[#0b2e5b]'
                    }`}
                  >
                    <span className="relative">
                      {link.label}
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

              {/* More Dropdown */}
              <div className="relative group flex items-center">
                <button className={`relative px-3 py-2 ${tw`text-body`} font-bold text-slate-700 hover:text-[#0b2e5b] flex items-center gap-1 transition-colors cursor-pointer group`}>
                  <span className="relative flex items-center gap-1">
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#0b2e5b] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-200 origin-center" />
                  </span>
                </button>

                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl p-1.5 hidden group-hover:block animate-fadeIn z-50">
                  {navLinks.slice(7).map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg ${tw`text-body`} font-semibold text-slate-700 hover:text-[#0b2e5b] hover:bg-slate-50 transition-colors`}
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
                onClick={() => onOpenMembership ? onOpenMembership() : handleNavClick('membership')}
                className={`hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-lg ${tw`text-body`} font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all duration-200 active:scale-95 shadow-sm cursor-pointer`}
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

      {/* 2. Announcement Header */}
      {hasNotifications && (
        <div className={`bg-black text-white py-1.5 px-3 sm:px-4 ${tw`text-helper`} flex items-center overflow-hidden border-t border-white/10 shadow-inner select-none`}>
          
          <div className="shrink-0 bg-black pr-3.5 z-10 border-r border-white/20">
            <span className={`${tw`text-caption`} font-extrabold uppercase tracking-wider text-amber-400`}>
              Announcements
            </span>
          </div>

          {/* Realistic Continuous Scrolling Ticker */}
          <div className="flex-1 overflow-hidden relative pl-4">
            <div className="animate-ticker whitespace-nowrap flex items-center text-white">
              
              {/* Track 1 */}
              <div className="flex items-center shrink-0">
                {tickerItems.map((notif, idx) => (
                  <div key={`t1-${idx}`} className="inline-flex items-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                        {notif.category || 'NOTICE'}
                      </span>
                      <span className="font-semibold text-[#f8fafc] text-xs">
                        {notif.title}
                      </span>
                      {notif.message && (
                        <span className="text-slate-400 text-xs">
                          — {notif.message}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-400/80 font-bold mx-3.5 text-xs select-none" aria-hidden="true">•</span>
                  </div>
                ))}
              </div>

              {/* Track 2 (Duplicate for Seamless Infinite Marquee Loop) */}
              <div className="flex items-center shrink-0">
                {tickerItems.map((notif, idx) => (
                  <div key={`t2-${idx}`} className="inline-flex items-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                        {notif.category || 'NOTICE'}
                      </span>
                      <span className="font-semibold text-[#f8fafc] text-xs">
                        {notif.title}
                      </span>
                      {notif.message && (
                        <span className="text-slate-400 text-xs">
                          — {notif.message}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-400/80 font-bold mx-3.5 text-xs select-none" aria-hidden="true">•</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 ${tw`text-body`} font-semibold transition-all border-l-2 ${
                  isActive
                    ? 'border-[#0b2e5b] text-[#0b2e5b] bg-slate-50 pl-4'
                    : 'border-transparent text-[#0b2e5b] hover:text-[#0b2e5b] hover:border-slate-300 pl-3'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-200">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMembership ? onOpenMembership() : handleNavClick('membership'); }}
              className={`w-full py-2.5 rounded-lg ${tw`text-body`} font-bold bg-[#0b2e5b] text-white text-center transition-colors shadow-sm cursor-pointer`}
            >
              Register for Sports
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
