import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Users, ShieldCheck, Award, Crown, Trophy, HeartHandshake, Activity, CheckCircle2, X } from 'lucide-react';

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
  const { coreValues: CORE_VALUES } = useConvexState();
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <section id="values" className="py-20 bg-[var(--bg-card-subtle)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Guiding Principles</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Our Core <span className="accent-text">Values</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            The foundation of KKR & KSR Sports Club is built on eight unshakeable ethical principles that define our athletic character and campus spirit.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CORE_VALUES.map((val, idx) => {
            const IconComponent = iconMap[val.icon] || Trophy;
            return (
              <div
                key={idx}
                onClick={() => setSelectedValue(val)}
                className="group p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-200 cursor-pointer card-hover"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">
                      {val.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      {val.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-7 rounded-xl glass-modal space-y-5">
            <button
              onClick={() => setSelectedValue(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              {(() => {
                const IconComp = iconMap[selectedValue.icon] || Trophy;
                return (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    <IconComp className="w-7 h-7" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedValue.title}</h3>
                <span className="text-xs text-[var(--text-muted)] font-semibold uppercase">Institutional Core Value</span>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {selectedValue.description}
            </p>

            <div className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px]">Field Application</span>
              <p>In all university matches, practice sessions, and campus interactions, every KKR & KSR athlete embodies {selectedValue.title} as their top priority.</p>
            </div>

            <button
              onClick={() => setSelectedValue(null)}
              className="w-full py-2.5 rounded-lg font-semibold text-sm bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
