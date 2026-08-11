import React from 'react';
import { ACHIEVEMENTS_DATA } from '../data/mockData';
import { Trophy, Medal, Award, Star, Sparkles, ShieldCheck } from 'lucide-react';

export default function Achievements() {
  const { tallies, awards } = ACHIEVEMENTS_DATA;

  return (
    <section id="achievements" className="py-20 bg-slate-900/50 dark:bg-slate-950/80 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>Wall of Fame</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            SPORTS <span className="gold-gradient-text">ACHIEVEMENTS</span> & LAURELS
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Celebrating the champions, record breakers, best teams, and national representatives who bring honor to KKR & KSR Institute.
          </p>
        </div>

        {/* Medal Tally Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-2">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-4xl font-extrabold text-white gold-gradient-text">{tallies.trophies}</h3>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Overall Trophies</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-yellow-500/30 text-center space-y-2">
            <Medal className="w-8 h-8 text-yellow-400 mx-auto" />
            <h3 className="text-4xl font-extrabold text-yellow-400">{tallies.gold}</h3>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gold Medals</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-400/30 text-center space-y-2">
            <Medal className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-4xl font-extrabold text-slate-200">{tallies.silver}</h3>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Silver Medals</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-700/30 text-center space-y-2">
            <Medal className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-4xl font-extrabold text-amber-600">{tallies.bronze}</h3>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Bronze Medals</p>
          </div>
        </div>

        {/* Category Awards Grid */}
        <div className="space-y-8">
          <h3 className="text-2xl font-extrabold text-white border-b border-slate-800 pb-3">
            Annual Excellence Awards 2025-26
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awards.map((award, i) => (
              <div key={i} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row gap-6 hover:border-amber-500/50 transition">
                <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden shrink-0 border border-amber-500/30">
                  <img
                    src={award.image}
                    alt={award.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {award.category}
                  </span>

                  <h4 className="text-xl font-bold text-white">{award.title}</h4>
                  <p className="text-xs font-semibold text-amber-400">Awarded to: {award.recipient}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{award.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State & National Representation Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-extrabold text-white">National & State Representation</h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            14 Athletes from KKR & KSR Sports Club were selected for South Zone Inter-University tournaments and AP State teams in Cricket, Kabaddi, Athletics, and Chess during the 2025-2026 season.
          </p>
        </div>

      </div>
    </section>
  );
}
