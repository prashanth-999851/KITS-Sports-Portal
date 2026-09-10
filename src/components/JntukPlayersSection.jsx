import React, { useState, useMemo } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { CardSkeleton } from './LoadingSkeleton';
import EmptyState from './EmptyState';
import JntukPlayerCrestCard from './JntukPlayerCrestCard';
import { 
  Award, Trophy, Calendar, Search, MapPin, ShieldCheck, 
  X, Sparkles
} from 'lucide-react';
import { 
  consolidateJntukPlayers, 
  filterConsolidatedAthletes, 
  computeJntukPlayerCounts 
} from '../utils/jntukPlayerUtils';

export default function JntukPlayersSection({ isEmbedded = false, maxDisplay = null }) {
  const { jntukPlayers = [], isLoading } = useConvexState();

  const [activeYear, setActiveYear] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  // Compute unique athlete counts (both overall unique and per-year unique)
  const counts = useMemo(() => {
    return computeJntukPlayerCounts(jntukPlayers);
  }, [jntukPlayers]);

  // Extract unique academic years dynamically from database records
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(jntukPlayers.map(p => p.academicYear).filter(Boolean)));
    years.sort().reverse();
    return ['All', ...years];
  }, [jntukPlayers]);

  // Extract unique sports dynamically from database records
  const availableSports = useMemo(() => {
    const sports = Array.from(new Set(jntukPlayers.map(p => p.sport).filter(Boolean)));
    sports.sort();
    return ['All', ...sports];
  }, [jntukPlayers]);

  // Extract unique departments dynamically from database records
  const availableDepts = useMemo(() => {
    const depts = Array.from(new Set(jntukPlayers.map(p => p.department).filter(Boolean)));
    depts.sort();
    return ['All', ...depts];
  }, [jntukPlayers]);

  // Consolidate multi-year player representations into unified athlete profiles
  const consolidatedAthletes = useMemo(() => {
    return consolidateJntukPlayers(jntukPlayers, activeYear);
  }, [jntukPlayers, activeYear]);

  // Filter consolidated athletes dynamically by search query, sport, and department
  const filteredAthletes = useMemo(() => {
    return filterConsolidatedAthletes(consolidatedAthletes, {
      searchQuery,
      selectedSport,
      selectedDept,
    });
  }, [consolidatedAthletes, searchQuery, selectedSport, selectedDept]);

  const displayList = maxDisplay ? filteredAthletes.slice(0, maxDisplay) : filteredAthletes;

  return (
    <section id="jntuk-players" className={`${isEmbedded ? 'py-6' : 'py-12 sm:py-16'} bg-slate-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        {!isEmbedded && (
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0b2e5b] text-xs font-bold uppercase tracking-widest shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#0b2e5b]" />
              <span>Inter-University Athletic Honors</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2e5b] tracking-tight">
              Represented <span className="text-amber-500">JNTUK Players</span>
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
              Honoring our student-athletes who represent Jawaharlal Nehru Technological University Kakinada (JNTUK) and KKR & KSR Institute at South Zone & All-India Inter-University Championships.
            </p>
          </div>
        )}

        {/* Academic Year Navigation & Filters (shown if records exist or loading) */}
        {(jntukPlayers.length > 0 || isLoading) && (
          <div className="flex flex-col items-center gap-5">
            
            {/* Year Buttons Bar */}
            {availableYears.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                {availableYears.map((year) => {
                  // Show unique athlete count for "All" and for specific years
                  const count = year === 'All' 
                    ? counts.uniqueAthletesCount 
                    : (counts.yearUniqueCounts[year] || 0);
                  
                  const isSelected = activeYear === year;

                  return (
                    <button
                      key={year}
                      onClick={() => setActiveYear(year)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b2e5b] text-white shadow-sm scale-100'
                          : 'text-slate-600 hover:text-[#0b2e5b] hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{year === 'All' ? 'All Academic Years' : `AY ${year}`}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filters & Search Toolbar */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              
              {/* Sport Discipline Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
                {availableSports.map((sp) => {
                  const isSelected = selectedSport === sp;
                  return (
                    <button
                      key={sp}
                      onClick={() => setSelectedSport(sp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {sp}
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: Department & Search */}
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                
                {/* Department Dropdown */}
                {availableDepts.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b2e5b] cursor-pointer"
                    >
                      <option value="All">All Departments</option>
                      {availableDepts.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d}>Dept: {d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search athlete, roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b2e5b] focus:bg-white"
                  />
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Dynamic Players Showcase Grid with the Crest Badge Cards */}
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : jntukPlayers.length === 0 ? (
          <EmptyState
            title="No JNTUK Represented Players Added Yet"
            description="The physical education department updates student representation records after every university athletic championship."
            icon={Award}
          />
        ) : displayList.length === 0 ? (
          <EmptyState
            title="No Athletes Match Filter Criteria"
            description="Try changing the sport filter, academic year tab, or resetting your search term."
            icon={Award}
          />
        ) : (
          <div className="flex flex-wrap justify-center items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16 max-w-6xl mx-auto pt-2 stagger-children">
            {displayList.map((player) => (
              <JntukPlayerCrestCard
                key={player.athleteKey || player.id || player._id || player.rollNumber}
                player={player}
                onClick={(p) => setSelectedPlayerModal(p)}
              />
            ))}
          </div>
        )}

        {/* Enterprise Modal for Athlete Information & Representation Timeline */}
        {selectedPlayerModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedPlayerModal(null)}
          >
            <div 
              className="relative w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPlayerModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header Profile */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-5">
                
                {/* Left: Diamond Avatar */}
                <div className="shrink-0">
                  <JntukPlayerCrestCard 
                    player={selectedPlayerModal} 
                    showBadge={false}
                  />
                </div>

                {/* Right: Athlete Core Information */}
                <div className="flex-1 space-y-3 text-center sm:text-left pt-1 w-full">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#0b2e5b]">
                        {selectedPlayerModal.studentName}
                      </h3>
                      {selectedPlayerModal.isMultiYear && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          {selectedPlayerModal.representationCount}x Varsity Athlete
                        </span>
                      )}
                    </div>
                    {selectedPlayerModal.rollNumber && (
                      <p className="text-xs text-slate-500 font-mono font-medium">
                        Registration No: <span className="text-slate-800 font-bold">{selectedPlayerModal.rollNumber}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Discipline</span>
                      <span className="font-bold text-slate-800">{selectedPlayerModal.sport || 'Sports'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Department</span>
                      <span className="font-bold text-slate-800">{selectedPlayerModal.department || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Academic Years Active</span>
                      <span className="font-bold text-[#0b2e5b]">{selectedPlayerModal.yearsLabel || `AY ${selectedPlayerModal.academicYear}`}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Varsity Representation History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-extrabold text-[#0b2e5b] uppercase tracking-wider">
                    {selectedPlayerModal.allRepresentations?.length > 1 
                      ? `University Representation History (${selectedPlayerModal.allRepresentations.length} Championships)` 
                      : 'University Championship Representation'}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {(selectedPlayerModal.allRepresentations || [selectedPlayerModal]).map((rep, idx) => (
                    <div 
                      key={rep.id || rep._id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#0b2e5b] text-white">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          AY {rep.academicYear}
                        </span>
                        {idx === 0 && selectedPlayerModal.allRepresentations?.length > 1 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            Most Recent
                          </span>
                        )}
                        {rep.sport && rep.sport !== selectedPlayerModal.sport && (
                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Sport: {rep.sport}
                          </span>
                        )}
                      </div>

                      {rep.tournamentName && (
                        <div className="text-xs font-bold text-slate-900 pt-0.5">
                          {rep.tournamentName}
                        </div>
                      )}

                      {rep.venueHost && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Venue: {rep.venueHost}</span>
                        </div>
                      )}

                      {rep.achievementDetails && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">Achievement: </span>
                          {rep.achievementDetails}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
