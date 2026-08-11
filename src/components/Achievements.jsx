import React from 'react';
import { ACHIEVEMENTS_DATA } from '../data/mockData';
import { Trophy, Medal, ShieldCheck } from 'lucide-react';

export default function Achievements() {
  const { tallies, awards } = ACHIEVEMENTS_DATA;

  return (
    <section id="achievements" className="py-20 bg-[var(--bg-main)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Wall of Fame</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Sports <span className="accent-text">Achievements</span> & Laurels
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Celebrating the champions, record breakers, best teams, and national representatives who bring honor to KKR & KSR Institute.
          </p>
        </div>

        {/* Medal Tally */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2 card-hover">
            <Trophy className="w-7 h-7 text-blue-700 dark:text-blue-400 mx-auto" />
            <h3 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{tallies.trophies}</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Trophies</p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2 card-hover">
            <Medal className="w-7 h-7 text-amber-500 mx-auto" />
            <h3 className="text-3xl font-extrabold text-amber-500">{tallies.gold}</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Gold Medals</p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2 card-hover">
            <Medal className="w-7 h-7 text-slate-400 mx-auto" />
            <h3 className="text-3xl font-extrabold text-slate-400">{tallies.silver}</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Silver Medals</p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2 card-hover">
            <Medal className="w-7 h-7 text-amber-700 mx-auto" />
            <h3 className="text-3xl font-extrabold text-amber-700">{tallies.bronze}</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Bronze Medals</p>
          </div>
        </div>

        {/* Awards */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            Annual Excellence Awards 2025-26
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, i) => (
              <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 flex flex-col sm:flex-row gap-5 card-hover">
                <div className="w-full sm:w-36 h-36 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)]">
                  <img
                    src={award.image}
                    alt={award.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                    {award.category}
                  </span>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{award.title}</h4>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Awarded to: {award.recipient}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{award.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* National Representation */}
        <div className="p-7 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-blue-700 dark:text-blue-400 mx-auto" />
          <h3 className="text-xl font-bold text-[var(--text-primary)]">National & State Representation</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl mx-auto">
            14 Athletes from KKR & KSR Sports Club were selected for South Zone Inter-University tournaments and AP State teams in Cricket, Kabaddi, Athletics, and Chess during the 2025-2026 season.
          </p>
        </div>

      </div>
    </section>
  );
}
