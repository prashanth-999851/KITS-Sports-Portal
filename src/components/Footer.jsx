import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function Footer({ setActiveSection }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1120] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain" 
              />
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">KKR & KSR Sports Club</h4>
                <p className="text-[10px] text-slate-500">KITS • Official Sports Portal</p>
              </div>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Fostering dynamic sports culture, physical resilience, leadership, and athletic excellence across 9+ sports disciplines.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] mb-3">Navigation</h5>
            <ul className="space-y-2">
              {['home', 'about', 'sports', 'executive', 'achievements'].map((sec) => (
                <li key={sec}>
                  <button
                    onClick={() => {
                      if (sec === 'about') {
                        window.location.href = '/about';
                        return;
                      }
                      setActiveSection(sec);
                      document.getElementById(sec)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 capitalize transition-colors text-slate-500 hover:translate-x-0.5 inline-block"
                  >
                    {sec}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] mb-3">Resources</h5>
            <ul className="space-y-2">
              {[
                { id: 'jntuk-stars', label: 'JNTUK Stars Roster', url: '/jntuk-stars' },
                { id: 'membership', label: 'Membership Portal' },
                { id: 'gallery', label: 'Gallery' },
                { id: 'rules', label: 'Constitution' },
                { id: 'contact', label: 'Contact Us' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.url) {
                        window.location.href = item.url;
                        return;
                      }
                      setActiveSection(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-blue-400 transition-colors text-slate-500 hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institute */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] mb-3">Institute</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              KKR & KSR Institute of Technology & Sciences<br />
              Vinjanampadu, Guntur, AP - 522017<br />
              sports@kkrksr.ac.in
            </p>
            <div className="p-2.5 rounded-lg bg-[#1E3A8A]/15 border border-[#1E3A8A]/30 text-[10px] text-blue-300 font-medium">
              🏆 Affiliated to JNTU Kakinada Sports Board
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 KKR & KSR Sports Club. All Rights Reserved.</p>
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-[#1E3A8A] transition-all duration-200 hover:shadow-md"
            title="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
