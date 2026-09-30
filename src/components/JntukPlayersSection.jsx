import React, { useState, useMemo, useEffect } from 'react';
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
  computeJntukPlayerCounts,
  normalizeSportName,
  normalizeDepartment,
  normalizeAcademicYear
} from '../utils/jntukPlayerUtils';

export default function JntukPlayersSection({ isEmbedded = false, maxDisplay = null }) {
  const { jntukPlayers = [], isLoading } = useConvexState();

  // Category selection: 'JNTUK' or 'District'
  const [activeCategory, setActiveCategory] = useState('JNTUK');
  const [activeYear, setActiveYear] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  // Compute unique athlete counts (both overall and broken down by JNTUK vs District)
  const counts = useMemo(() => {
    return computeJntukPlayerCounts(jntukPlayers, activeCategory);
  }, [jntukPlayers, activeCategory]);

  // Players belonging to the currently active category
  const categoryPlayers = useMemo(() => {
    return jntukPlayers.filter(p => (p.level === 'District' ? 'District' : 'JNTUK') === activeCategory);
  }, [jntukPlayers, activeCategory]);

  // Extract unique academic years dynamically from active category records (normalized)
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(categoryPlayers.map(p => normalizeAcademicYear(p.academicYear)).filter(Boolean)));
    years.sort().reverse();
    return ['All', ...years];
  }, [categoryPlayers]);

  // Extract unique sports dynamically from active category records (normalized)
  const availableSports = useMemo(() => {
    const sports = Array.from(new Set(categoryPlayers.map(p => normalizeSportName(p.sport)).filter(Boolean)));
    sports.sort((a, b) => a.localeCompare(b));
    return ['All', ...sports];
  }, [categoryPlayers]);

  // Extract unique departments dynamically from active category records (normalized)
  const availableDepts = useMemo(() => {
    const depts = Array.from(new Set(categoryPlayers.map(p => normalizeDepartment(p.department)).filter(Boolean)));
    depts.sort((a, b) => a.localeCompare(b));
    return ['All', ...depts];
  }, [categoryPlayers]);

  // Auto-reset filters if current selection is no longer present
  useEffect(() => {
    if (selectedSport !== 'All' && !availableSports.includes(selectedSport)) {
      setSelectedSport('All');
    }
  }, [availableSports, selectedSport]);

  useEffect(() => {
    if (selectedDept !== 'All' && !availableDepts.includes(selectedDept)) {
      setSelectedDept('All');
    }
  }, [availableDepts, selectedDept]);

  useEffect(() => {
    if (activeYear !== 'All' && !availableYears.includes(activeYear)) {
      setActiveYear('All');
    }
  }, [availableYears, activeYear]);

  // Lock body scroll when athlete modal is open
  useEffect(() => {
    if (selectedPlayerModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedPlayerModal]);

  // Consolidate multi-year player representations into unified athlete profiles for the active category
  const consolidatedAthletes = useMemo(() => {
    return consolidateJntukPlayers(jntukPlayers, activeYear, activeCategory);
  }, [jntukPlayers, activeYear, activeCategory]);

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
    <section id="elite-players" className={`${isEmbedded ? 'py-6' : 'pt-12 sm:pt-14 lg:pt-16 pb-12 sm:pb-16'} bg-slate-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        {!isEmbedded && (
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0b2e5b] text-xs font-bold uppercase tracking-widest shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#0b2e5b]" />
              <span>Elite Athletic Honors</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2e5b] tracking-tight">
              Elite <span className="text-amber-500">Players</span>
            </h2>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
              {activeCategory === 'District'
                ? 'Celebrating our student-athletes representing Guntur and regional districts at Andhra Pradesh State & Inter-District Championships.'
                : 'Honoring our varsity student-athletes representing Jawaharlal Nehru Technological University Kakinada (JNTUK) at South Zone & All-India Inter-University Championships.'}
            </p>
          </div>
        )}

        {/* Sliding Segmented Category Navigation: JNTUK vs District */}
        <div className="flex justify-center w-full px-2 sm:px-4">
          <div className="relative grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm w-full max-w-md sm:max-w-lg select-none">
            {/* Smooth Sliding Pill Indicator */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#0b2e5b] rounded-xl shadow-md transition-all duration-300 ease-out pointer-events-none ${
                activeCategory === 'JNTUK' ? 'left-1.5' : 'left-[calc(50%+3px)]'
              }`} 
            />

            <button
              type="button"
              onClick={() => {
                setActiveCategory('JNTUK');
                setSelectedSport('All');
                setActiveYear('All');
              }}
              className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeCategory === 'JNTUK'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-[#0b2e5b]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 ${activeCategory === 'JNTUK' ? 'text-blue-300' : 'text-slate-400'}`} />
              <span className="truncate">JNTUK Represented</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors shrink-0 ${
                activeCategory === 'JNTUK' ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {counts.jntukCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('District');
                setSelectedSport('All');
                setActiveYear('All');
              }}
              className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeCategory === 'District'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-[#0b2e5b]'
              }`}
            >
              <Trophy className={`w-4 h-4 shrink-0 ${activeCategory === 'District' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="truncate">District Represented</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors shrink-0 ${
                activeCategory === 'District' ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {counts.districtCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar (shown if records exist or loading) */}
        {(categoryPlayers.length > 0 || isLoading) && (
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

            {/* Right Controls: Academic Year, Department & Search */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              
              {/* Academic Year Dropdown */}
              {availableYears.length > 1 && (
                <div className="relative">
                  <select
                    value={activeYear}
                    onChange={(e) => setActiveYear(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b2e5b] cursor-pointer"
                  >
                    {availableYears.map((yr) => {
                      const count = yr === 'All' 
                        ? counts.uniqueAthletesCount 
                        : (counts.yearUniqueCounts[yr] || 0);
                      return (
                        <option key={yr} value={yr}>
                          {yr === 'All' ? `All Years (${count})` : `AY ${yr} (${count})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

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
              <div className="relative flex-1 md:w-56 min-w-[180px]">
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
        )}

        {/* Dynamic Players Showcase Grid with the Crest Badge Cards */}
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : categoryPlayers.length === 0 ? (
          <EmptyState
            title={`No ${activeCategory === 'District' ? 'District' : 'JNTUK'} players available yet.`}
            description={`Official student representation records will be displayed once ${activeCategory === 'District' ? 'district' : 'inter-university'} championship meets are uploaded.`}
            icon={Award}
          />
        ) : displayList.length === 0 ? (
          <EmptyState
            title="No athletes match the selected filter criteria."
            description="Try changing the sport discipline, academic year dropdown, or resetting your search term."
            icon={Award}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center w-full max-w-7xl mx-auto pt-2 px-2 sm:px-4 stagger-children">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-hidden animate-fadeIn"
            onClick={() => setSelectedPlayerModal(null)}
          >
            {/* Modal Dialog: Pinned Header, Scrollable Content, Pinned Footer */}
            <div 
              className="relative w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. Pinned Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0b2e5b]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#0b2e5b]">
                    {selectedPlayerModal.level === 'District' ? 'District Athlete Profile' : 'JNTUK Varsity Athlete Profile'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPlayerModal(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-7 space-y-5">
                
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
                  <div className="flex-1 space-y-3 text-center sm:text-left pt-1 w-full min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#0b2e5b]">
                          {selectedPlayerModal.studentName}
                        </h3>
                        {selectedPlayerModal.isMultiYear && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedPlayerModal.level === 'District' 
                              ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            <Trophy className={`w-3 h-3 ${selectedPlayerModal.level === 'District' ? 'text-purple-600' : 'text-amber-600'}`} />
                            {selectedPlayerModal.representationCount}x {selectedPlayerModal.level === 'District' ? 'District Athlete' : 'Varsity Athlete'}
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
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Category / Level</span>
                        <span className="font-bold text-[#0b2e5b]">
                          {selectedPlayerModal.level === 'District' ? 'District Representation' : 'JNTUK Varsity'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Discipline</span>
                        <span className="font-bold text-slate-800">{selectedPlayerModal.sport || 'Sports'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Department</span>
                        <span className="font-bold text-slate-800">{selectedPlayerModal.department || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Academic Years</span>
                        <span className="font-bold text-[#0b2e5b]">{selectedPlayerModal.yearsLabel || `AY ${selectedPlayerModal.academicYear}`}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Representation History Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-extrabold text-[#0b2e5b] uppercase tracking-wider">
                      {selectedPlayerModal.level === 'District' 
                        ? 'District Championship Representation History' 
                        : 'Inter-University Representation History'}
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

              {/* 3. Pinned Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPlayerModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0b2e5b] text-white hover:bg-[#0d3a73] transition-colors cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
