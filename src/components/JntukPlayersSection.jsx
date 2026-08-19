import React, { useState, useMemo } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { CardSkeleton } from './LoadingSkeleton';
import EmptyState from './EmptyState';
import JntukPlayerCrestCard from './JntukPlayerCrestCard';
import { 
  Award, Trophy, Calendar, Search, MapPin, ShieldCheck, 
  X, Filter, Sparkles, Building2, UserCheck
} from 'lucide-react';

export default function JntukPlayersSection({ isEmbedded = false, maxDisplay = null }) {
  const { jntukPlayers = [], isLoading } = useConvexState();

  const [activeYear, setActiveYear] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

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

  // Filter players dynamically
  const filteredPlayers = useMemo(() => {
    return jntukPlayers.filter(player => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (player.studentName && player.studentName.toLowerCase().includes(query)) ||
        (player.rollNumber && player.rollNumber.toLowerCase().includes(query)) ||
        (player.department && player.department.toLowerCase().includes(query)) ||
        (player.sport && player.sport.toLowerCase().includes(query)) ||
        (player.tournamentName && player.tournamentName.toLowerCase().includes(query)) ||
        (player.venueHost && player.venueHost.toLowerCase().includes(query));

      const matchesYear = activeYear === 'All' || player.academicYear === activeYear;
      const matchesSport = selectedSport === 'All' || (player.sport && player.sport.toLowerCase() === selectedSport.toLowerCase());
      const matchesDept = selectedDept === 'All' || player.department === selectedDept;

      return matchesSearch && matchesYear && matchesSport && matchesDept;
    });
  }, [jntukPlayers, searchQuery, activeYear, selectedSport, selectedDept]);

  const displayList = maxDisplay ? filteredPlayers.slice(0, maxDisplay) : filteredPlayers;

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
                  const count = year === 'All' 
                    ? jntukPlayers.length 
                    : jntukPlayers.filter(p => p.academicYear === year).length;
                  
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
                key={player.id || player._id || player.rollNumber}
                player={player}
                onClick={(p) => setSelectedPlayerModal(p)}
              />
            ))}
          </div>
        )}

        {/* Clean Plain Modal for Athlete Information */}
        {selectedPlayerModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedPlayerModal(null)}
          >
            <div 
              className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPlayerModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                
                {/* Left: Diamond Avatar */}
                <div className="shrink-0">
                  <JntukPlayerCrestCard 
                    player={selectedPlayerModal} 
                  />
                </div>

                {/* Right: Plain Text Information */}
                <div className="flex-1 space-y-2 text-left text-xs sm:text-sm text-gray-700 pt-1 w-full">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      {selectedPlayerModal.studentName}
                    </h3>
                    {selectedPlayerModal.rollNumber && (
                      <p className="text-xs text-gray-500 font-mono">
                        Roll No: {selectedPlayerModal.rollNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 pt-2 border-t border-gray-100">
                    {selectedPlayerModal.sport && (
                      <p><span className="font-semibold text-gray-900">Sport:</span> {selectedPlayerModal.sport}</p>
                    )}
                    {selectedPlayerModal.department && (
                      <p><span className="font-semibold text-gray-900">Department:</span> {selectedPlayerModal.department}</p>
                    )}
                    {selectedPlayerModal.academicYear && (
                      <p><span className="font-semibold text-gray-900">Academic Year:</span> AY {selectedPlayerModal.academicYear}</p>
                    )}
                    {selectedPlayerModal.tournamentName && (
                      <p><span className="font-semibold text-gray-900">Tournament:</span> {selectedPlayerModal.tournamentName}</p>
                    )}
                    {selectedPlayerModal.venueHost && (
                      <p><span className="font-semibold text-gray-900">Venue:</span> {selectedPlayerModal.venueHost}</p>
                    )}
                    {selectedPlayerModal.achievementDetails && (
                      <p className="pt-1"><span className="font-semibold text-gray-900">Achievement:</span> {selectedPlayerModal.achievementDetails}</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
