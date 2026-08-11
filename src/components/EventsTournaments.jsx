import React, { useState } from 'react';
import { EVENTS_DATA, FIXTURES_DATA } from '../data/mockData';
import { Calendar, MapPin, Trophy, Flame, PlayCircle, CheckCircle, ArrowRight, Activity } from 'lucide-react';

export default function EventsTournaments({ onRegisterEvent }) {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bracketSport, setBracketSport] = useState("Cricket");

  const filteredEvents = EVENTS_DATA.filter(e => e.category === activeTab);

  return (
    <section id="events" className="py-20 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Flame className="w-3.5 h-3.5" />
            <span>Tournaments & Schedules</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold">
            EVENTS & <span className="gold-gradient-text">TOURNAMENTS</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Track live scores, upcoming annual meets, interactive match fixtures, and past championship outcomes.
          </p>
        </div>

        {/* Live Fixtures & Score Ticker Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <h3 className="text-xl font-extrabold text-white">Live Tournament Scoreboard</h3>
            </div>
            <span className="text-xs text-amber-400 font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
              Campus Main Oval Grounds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FIXTURES_DATA.map((fix) => (
              <div key={fix.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[180px]">{fix.tournament}</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${fix.status === 'LIVE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {fix.status}
                  </span>
                </div>

                <div className="space-y-1 py-1">
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span>{fix.team1}</span>
                    <span className="text-amber-400">{fix.score1}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                    <span>{fix.team2}</span>
                    <span className="text-slate-400">{fix.score2}</span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800 flex justify-between">
                  <span>{fix.result}</span>
                  <span className="text-slate-400 text-[10px]">{fix.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Category Tabs */}
        <div className="space-y-8">
          <div className="flex justify-center border-b border-slate-800">
            {["Upcoming", "Ongoing", "Past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab} Events ({EVENTS_DATA.filter(e => e.category === tab).length})
              </button>
            ))}
          </div>

          {/* Events List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition">
                <div>
                  <div className="relative h-48">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/30">
                      {evt.sport}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <h4 className="text-2xl font-bold text-white">{evt.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onRegisterEvent(evt.title)}
                    className="w-full py-3 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Register / Nominate for Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tournament Bracket Visualization */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-2xl font-extrabold text-white">Tournament Bracket & Fixture Tree</h3>
              <p className="text-xs text-slate-400">Visual elimination bracket for inter-departmental championships.</p>
            </div>

            <div className="flex gap-2">
              {["Cricket", "Football", "Basketball"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBracketSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bracketSport === s ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bracket Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs">
            {/* Semi Finals */}
            <div className="space-y-4">
              <span className="font-bold text-amber-400 uppercase tracking-wider block">Semi Finals</span>
              
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>CSE Warriors</span>
                  <span className="text-amber-400">W</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ECE Titans</span>
                  <span>L</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Mech Strikers</span>
                  <span className="text-amber-400">W</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Civil Kings</span>
                  <span>L</span>
                </div>
              </div>
            </div>

            {/* Finals */}
            <div className="space-y-4">
              <span className="font-bold text-amber-400 uppercase tracking-wider block">Grand Final</span>

              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-400/80 shadow-lg space-y-2">
                <div className="flex justify-between font-extrabold text-white text-sm">
                  <span>CSE Warriors</span>
                  <span className="text-amber-400">🏆 CHAMPIONS</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Mech Strikers</span>
                  <span>Runner Up</span>
                </div>
              </div>
            </div>

            {/* Champion Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-center space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-extrabold text-white">2026 CHAMPION</h4>
              <p className="text-xs font-bold text-amber-400">CSE WARRIORS DEPT.</p>
              <p className="text-[11px] text-slate-400">Awarded rolling trophy & ₹25,000 cash prize</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
