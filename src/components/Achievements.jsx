import React from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Trophy, Medal, ShieldCheck } from 'lucide-react';

function MedalTallySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-3 animate-slideUp">
          <div className="w-10 h-10 rounded-full skeleton-shimmer mx-auto" />
          <div className="h-8 w-16 skeleton-shimmer mx-auto" />
          <div className="h-3 w-20 skeleton-shimmer mx-auto" />
        </div>
      ))}
    </div>
  );
}

const medalCardStyles = [
  { border: 'border-blue-200 dark:border-blue-500/30', bg: 'bg-blue-50/50 dark:bg-blue-500/5', iconColor: 'text-blue-600 dark:text-blue-400', textColor: 'text-blue-700 dark:text-blue-400' },
  { border: 'border-amber-200 dark:border-amber-500/30', bg: 'bg-amber-50/50 dark:bg-amber-500/5', iconColor: 'text-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { border: 'border-slate-200 dark:border-slate-500/30', bg: 'bg-slate-50/50 dark:bg-slate-500/5', iconColor: 'text-slate-400', textColor: 'text-slate-500 dark:text-slate-300' },
  { border: 'border-orange-200 dark:border-orange-500/30', bg: 'bg-orange-50/50 dark:bg-orange-500/5', iconColor: 'text-orange-600 dark:text-orange-400', textColor: 'text-orange-700 dark:text-orange-400' },
];

export default function Achievements() {
  const { achievements, isLoading } = useConvexState();
  const { tallies, awards } = achievements;

  const isTallyLoading = isLoading || !tallies?.isLoaded;

  const medalData = tallies ? [
    { icon: Trophy, value: (tallies.trophies !== undefined && tallies.trophies !== null) ? tallies.trophies : '75+', label: 'Trophies' },
    { icon: Medal, value: (tallies.gold !== undefined && tallies.gold !== null) ? tallies.gold : '18+', label: 'Gold Medals' },
    { icon: Medal, value: (tallies.silver !== undefined && tallies.silver !== null) ? tallies.silver : '14+', label: 'Silver Medals' },
    { icon: Medal, value: (tallies.bronze !== undefined && tallies.bronze !== null) ? tallies.bronze : '22+', label: 'Bronze Medals' },
  ] : [];

  return (
    <section id="achievements" className="py-12 sm:py-16 bg-[var(--bg-main)] transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
            Wall of Fame
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Sports <span className="accent-text">Achievements</span> & Laurels
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            Celebrating the champions, record breakers, best teams, and national representatives who bring honor to KKR & KSR Institute.
          </p>
        </div>

        {/* Medal Tally */}
        {isTallyLoading ? (
          <MedalTallySkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
            {medalData.map((medal, idx) => {
              const style = medalCardStyles[idx];
              const Icon = medal.icon;
              return (
                <div key={idx} className={`p-6 rounded-xl ${style.bg} border ${style.border} text-center space-y-2 card-hover animate-slideUp`}>
                  <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center mx-auto`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} />
                  </div>
                  <h3 className={`text-3xl font-extrabold ${style.textColor}`}>{medal.value}</h3>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{medal.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Awards - Only displayed if awards exist */}
        {awards && awards.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
              Annual Excellence Awards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              {awards.map((award, i) => (
                <div key={i} className="group rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col sm:flex-row card-hover animate-slideUp">
                  <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 overflow-hidden bg-[var(--bg-card-subtle)] img-zoom">
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2 flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[var(--secondary)] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 uppercase tracking-wider">
                      {award.category}
                    </span>
                    <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] dark:group-hover:text-blue-400 transition-colors">{award.title}</h4>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Awarded to: {award.recipient}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{award.achievement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
