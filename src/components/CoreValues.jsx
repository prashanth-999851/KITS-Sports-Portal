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

const iconColors = [
  'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
];

function CoreValuesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4 animate-slideUp">
          <div className="w-12 h-12 rounded-lg skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-2/3 skeleton-shimmer" />
            <div className="h-3 w-full skeleton-shimmer" />
            <div className="h-3 w-4/5 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoreValues() {
  const { coreValues: CORE_VALUES, isLoading } = useConvexState();
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <section id="values" className="py-12 sm:py-16 bg-[var(--bg-card-subtle)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
            Guiding Principles
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Our Core <span className="accent-text">Values</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            The foundation of KKR & KSR Sports Club is built on eight unshakeable ethical principles that define our athletic character and campus spirit.
          </p>
        </div>

        {/* Cards Grid */}
        {isLoading || !CORE_VALUES || CORE_VALUES.length === 0 ? (
          <CoreValuesSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {CORE_VALUES.map((val, idx) => {
              const IconComponent = iconMap[val.icon] || Trophy;
              const colorClass = iconColors[idx % iconColors.length];
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedValue(val)}
                  className="group p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--secondary)] dark:hover:border-blue-500/40 transition-all duration-300 cursor-pointer card-hover animate-slideUp"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--secondary)] dark:group-hover:text-blue-400 transition-colors">
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
        )}

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
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <IconComp className="w-7 h-7" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedValue.title}</h3>
                <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Institutional Core Value</span>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {selectedValue.description}
            </p>

            <div className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--secondary)] dark:text-blue-400 uppercase text-[10px] tracking-wider">Field Application</span>
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
