import React, { useState } from 'react';
import { EVENTS_DATA, FIXTURES_DATA } from '../data/mockData';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';

export default function EventsTournaments({ onRegisterEvent }) {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bracketSport, setBracketSport] = useState("Cricket");

  const filteredEvents = EVENTS_DATA.filter(e => e.category === activeTab);

  return (
    <section id="events" className="py-20 bg-[#0F172A] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tournaments & Schedules</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Events & <span className="text-amber-400">Tournaments</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Track live scores, upcoming annual meets, match fixtures, and past championship outcomes.
          </p>
        </div>

        {/* Live Scoreboard */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-700 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <h3 className="text-lg font-bold text-white">Live Tournament Scoreboard</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium px-3 py-1 rounded-md bg-slate-800 border border-slate-700">
              Campus Main Oval Grounds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FIXTURES_DATA.map((fix) => (
              <div key={fix.id} className="p-4 rounded-lg bg-[#0F172A] border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[180px]">{fix.tournament}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    fix.status === 'LIVE' 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {fix.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-white">{fix.team1}</span>
                    <span className="font-bold text-amber-400 text-xs">{fix.score1}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-400">{fix.team2}</span>
                    <span className="text-slate-500 text-xs">{fix.score2}</span>
                  </div>
                </div>

                <div className="text-xs font-medium text-amber-400 pt-2 border-t border-slate-700 flex justify-between">
                  <span>{fix.result}</span>
                  <span className="text-slate-500 text-[10px]">{fix.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Tabs */}
        <div className="space-y-8">
          <div className="flex justify-center border-b border-slate-700">
            {["Upcoming", "Ongoing", "Past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab} ({EVENTS_DATA.filter(e => e.category === tab).length})
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="rounded-xl bg-slate-900/50 border border-slate-700 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#1E3A8A] text-white">
                      {evt.sport}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h4 className="text-lg font-bold text-white">{evt.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => onRegisterEvent(evt.title)}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Register / Nominate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Bracket */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-700 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Tournament Bracket</h3>
              <p className="text-xs text-slate-400">Visual elimination bracket for inter-departmental championships.</p>
            </div>
            <div className="flex gap-2">
              {["Cricket", "Football", "Basketball"].map((s) => (
                <button
                  key={s}
                  onClick={() => setBracketSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    bracketSport === s ? 'bg-[#1E3A8A] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs">
            {/* Semi Finals */}
            <div className="space-y-3">
              <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Semi Finals</span>
              <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-700 space-y-1">
                <div className="flex justify-between font-semibold text-white">
                  <span>CSE Warriors</span>
                  <span className="text-amber-400">W</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ECE Titans</span>
                  <span>L</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-700 space-y-1">
                <div className="flex justify-between font-semibold text-white">
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
            <div className="space-y-3">
              <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Grand Final</span>
              <div className="p-4 rounded-lg bg-[#0F172A] border-2 border-amber-500/50 space-y-1.5">
                <div className="flex justify-between font-bold text-white text-sm">
                  <span>CSE Warriors</span>
                  <span className="text-amber-400">🏆</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Mech Strikers</span>
                  <span>Runner Up</span>
                </div>
              </div>
            </div>

            {/* Champion */}
            <div className="p-5 rounded-lg bg-blue-900/20 border border-blue-500/30 text-center space-y-2">
              <Trophy className="w-9 h-9 text-amber-400 mx-auto" />
              <h4 className="text-base font-bold text-white">2026 CHAMPION</h4>
              <p className="text-xs font-bold text-amber-400">CSE WARRIORS</p>
              <p className="text-[11px] text-slate-400">Awarded rolling trophy & ₹25,000 cash prize</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
