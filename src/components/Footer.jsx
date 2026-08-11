import React from 'react';
import { ShieldCheck, Trophy, Heart, ArrowUp } from 'lucide-react';

export default function Footer({ setActiveSection }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/kkr_ksr_logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-amber-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">KKR & KSR</h4>
                <p className="text-[10px] text-amber-400 font-bold uppercase">Sports Club Portal</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Fostering dynamic sports culture, physical resilience, leadership, and athletic dominance across all 11 sports disciplines.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Quick Sitemap</h5>
            <ul className="space-y-1.5">
              {['home', 'about', 'values', 'sports', 'governance', 'executive', 'events', 'achievements'].map((sec) => (
                <li key={sec}>
                  <button
                    onClick={() => {
                      setActiveSection(sec);
                      document.getElementById(sec)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 capitalize transition"
                  >
                    {sec} Section
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Rules */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Governance & Rules</h5>
            <ul className="space-y-1.5">
              {['membership', 'gallery', 'rules', 'contact', 'admin'].map((sec) => (
                <li key={sec}>
                  <button
                    onClick={() => {
                      setActiveSection(sec);
                      document.getElementById(sec)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 capitalize transition"
                  >
                    {sec === 'rules' ? 'Constitution Rulebook' : sec === 'admin' ? 'Admin Portal' : sec}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institute Details */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Institute Address</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              KKR & KSR Institute of Technology & Sciences<br />
              Vinjanampadu, Guntur, AP - 522017<br />
              Email: sports@kkrksr.ac.in
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-semibold">
              🏆 Affiliated to JNTU Kakinada Sports Board
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 KKR & KSR Sports Club. All Rights Reserved. Designed for Sporting Excellence.</p>
          
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
            title="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
