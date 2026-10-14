import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { tw } from '@/constants';

export default function Footer({ setActiveSection }) {
  const eventsEnabled = useQuery(api.events.isEventsEnabled);

  const navItems = [
    { id: 'home', label: 'Home', url: '/' },
    { id: 'about', label: 'About', url: '/about' },
    ...(eventsEnabled ? [{ id: 'events', label: 'Events', url: '/events' }] : []),
    { id: 'sports', label: 'Sports', url: '/#sports' },
    { id: 'executive', label: 'Executive Body', url: '/#executive' },
    { id: 'achievements', label: 'Achievements', url: '/#achievements' }
  ];

  return (
    <footer className={`bg-[#041428] text-slate-400 ${tw`text-caption`} py-14`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/kits_logo.png?v=2" 
                alt="KiTS Sports Club Logo" 
                className="h-10 w-10 object-contain bg-white rounded-full p-0.5" 
              />
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">K<span className="text-red-500">i</span>TS Sports Club</h4>
                <p className="text-[10px] text-slate-500">Official Sports Portal</p>
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
              {navItems.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={sec.url}
                    onClick={(e) => {
                      if (sec.url.startsWith('/#')) {
                        e.preventDefault();
                        setActiveSection(sec.id);
                        document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-blue-400 capitalize transition-colors text-slate-500 hover:translate-x-0.5 inline-block"
                  >
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] mb-3">Resources</h5>
            <ul className="space-y-2">
              {[
                { id: 'elite-players', label: 'Elite Players', url: '/elite-players' },
                { id: 'sports-members', label: 'Sports Members', url: '/sports-members' },
                { id: 'registration', label: 'Sports Registration', url: '/register' },
                { id: 'gallery', label: 'Gallery', url: '/#gallery' },
                { id: 'rules', label: 'Constitution', url: '/rules' },
                { id: 'contact', label: 'Contact Us', url: '/contact' }
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    onClick={(e) => {
                      if (item.url.startsWith('/#')) {
                        e.preventDefault();
                        setActiveSection(item.id);
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-blue-400 transition-colors text-slate-500 hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Institute */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em] mb-3">Institute</h5>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              KKR & KSR Institute of Technology & Sciences<br />
              Vinjanampadu, Guntur, AP - 522017
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 KiTS Sports Club. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}
