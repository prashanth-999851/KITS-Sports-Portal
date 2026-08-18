import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { CardSkeleton } from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { Award, Trophy, Calendar, Search, MapPin, ShieldCheck } from 'lucide-react';

export default function JntukPlayersSection() {
  const { jntukPlayers = [], isLoading } = useConvexState();

  const [activeYear, setActiveYear] = useState('2025-2026');
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique academic years & sports
  const availableYears = Array.from(new Set(['2025-2026', '2024-2025', '2023-2024', '2022-2023', ...jntukPlayers.map(p => p.academicYear)]));
  const availableSports = Array.from(new Set(['All', 'Cricket', 'Volleyball', 'Basketball', 'Football', 'Athletics', 'Kabaddi', 'Chess', 'Badminton', ...jntukPlayers.map(p => p.sport)]));

  const filteredPlayers = jntukPlayers.filter(player => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      player.studentName.toLowerCase().includes(query) ||
      player.rollNumber.toLowerCase().includes(query) ||
      player.department.toLowerCase().includes(query) ||
      player.sport.toLowerCase().includes(query);

    const matchesYear = activeYear === 'All' || player.academicYear === activeYear;
    const matchesSport = selectedSport === 'All' || player.sport === selectedSport;

    return matchesSearch && matchesYear && matchesSport;
  });

  return (
    <section id="jntuk-players" className="py-12 sm:py-16 bg-[var(--bg-card-subtle)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Inter-University Honors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Represented <span className="accent-text">JNTUK Players</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Honoring student athletes who proudly represented KKR & KSR Institute at Jawaharlal Nehru Technological University Kakinada (JNTUK) Inter-University meets, South Zone, and All-India Championships.
          </p>
        </div>

        {/* Academic Year Navigation Tabs */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <button
              onClick={() => setActiveYear('All')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeYear === 'All'
                  ? 'bg-[#0d3a73] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
              }`}
            >
              All Academic Years ({jntukPlayers.length})
            </button>
            {availableYears.map((year) => {
              const count = jntukPlayers.filter(p => p.academicYear === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeYear === year
                      ? 'bg-[#0d3a73] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>AY {year}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeYear === year ? 'bg-amber-400 text-slate-950' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sport Filter Pills & Search */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Sport Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              {availableSports.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSport(sp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedSport === sp
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search athlete or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none shadow-sm"
              />
            </div>

          </div>
        </div>

        {/* Players Showcase Grid */}
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : filteredPlayers.length === 0 ? (
          <EmptyState
            title={`No JNTUK Athletes Registered for AY ${activeYear}`}
            description="Our physical education department updates student representation records after every university meet."
            icon={Award}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4 flex flex-col justify-between card-hover shadow-sm"
              >
                <div className="space-y-4">
                  
                  {/* Top Badge Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-[#0d3a73] text-white tracking-wider">
                      AY {player.academicYear}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      {player.sport}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card-subtle)] shrink-0">
                      <img
                        src={player.photoUrl}
                        alt={player.studentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {player.studentName}
                      </h3>
                      <p className="text-xs font-mono text-[var(--text-muted)] font-medium">
                        {player.rollNumber}
                      </p>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        Dept of {player.department}
                      </span>
                    </div>
                  </div>

                  {/* Tournament Narrative Box */}
                  <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1 text-xs">
                    <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{player.tournamentName}</span>
                    </p>
                    {player.venueHost && (
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{player.venueHost}</span>
                      </p>
                    )}
                    {player.achievementDetails && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                        ⭐ {player.achievementDetails}
                      </p>
                    )}
                  </div>

                </div>

                {/* Footer Tag */}
                <div className="pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-medium flex justify-between items-center">
                  <span>JNTUK Representation</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Official Varsity Athlete</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
