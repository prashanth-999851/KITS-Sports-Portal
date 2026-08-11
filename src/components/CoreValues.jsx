import React, { useState } from 'react';
import { CORE_VALUES } from '../data/mockData';
import { Users, ShieldCheck, Award, Crown, Trophy, HeartHandshake, Activity, CheckCircle2, X, Sparkles } from 'lucide-react';

const iconMap = {
  Users,
  ShieldCheck,
  Award,
  Crown,
  Trophy,
  HeartHandshake,
  Activity,
  CheckCircle2
};

export default function CoreValues() {
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <section id="values" className="py-20 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors">
      {/* Background Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guiding Principles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold">
            OUR CORE <span className="gold-gradient-text">VALUES</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            The foundation of KKR & KSR Sports Club is built on eight unshakeable ethical principles that define our athletic character and campus spirit.
          </p>
        </div>

        {/* Core Values 8 Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const IconComponent = iconMap[val.icon] || Trophy;
            return (
              <div
                key={idx}
                onClick={() => setSelectedValue(val)}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${val.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {val.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {val.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Ethos</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modal Detail View for Selected Value */}
      {selectedValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedValue(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {(() => {
                const IconComp = iconMap[selectedValue.icon] || Trophy;
                return (
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedValue.color} text-white shadow-xl`}>
                    <IconComp className="w-8 h-8" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{selectedValue.title}</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase">Institutional Core Value</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedValue.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-extrabold text-amber-600 dark:text-amber-400 uppercase">Field Application</span>
              <p>In all university matches, practice sessions, and campus interactions, every KKR & KSR athlete embodies {selectedValue.title} as their top priority.</p>
            </div>

            <button
              onClick={() => setSelectedValue(null)}
              className="w-full py-3 rounded-xl font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 transition shadow-lg"
            >
              Close Value View
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
