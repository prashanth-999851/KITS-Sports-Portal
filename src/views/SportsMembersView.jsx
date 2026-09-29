import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useConvexState } from '../context/ConvexStateContext';
import { Search, Users, ChevronRight } from 'lucide-react';

const DEFAULT_SPORTS_ORDER = [
  'Cricket',
  'Volleyball',
  'Basketball',
  'Badminton',
  'Kabaddi',
  'Kho-Kho',
  'Netball',
  'Ball-Badminton',
  'Athletics',
];


function SportsMembersPageSkeleton() {
  return (
    <div className="py-8 sm:py-10 bg-slate-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Simple Header Skeleton */}
        <div className="border-b border-slate-200 pb-4">
          <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
        </div>

        {/* Master-Detail Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-28 mb-3 animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Right Content Skeleton */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="h-6 bg-slate-200 rounded w-36 animate-pulse" />
              <div className="h-9 bg-slate-200 rounded-xl w-52 animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-4 bg-slate-200 rounded" />
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="flex-1 h-4 bg-slate-200 rounded" />
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SportsMembersView() {
  const navigate = useNavigate();
  const { approvedMembers = [], isLoadingApprovedMembers } = useConvexState();
  const [selectedSport, setSelectedSport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compute all sports that have at least 1 approved member
  const sportsWithMembers = useMemo(() => {
    const map = new Map();

    approvedMembers.forEach(member => {
      const list = Array.isArray(member.preferredSports)
        ? member.preferredSports
        : (member.preferredSports ? [member.preferredSports] : []);

      list.forEach(s => {
        if (s && typeof s === 'string') {
          const trimmed = s.trim();
          if (!map.has(trimmed)) {
            map.set(trimmed, []);
          }
          map.get(trimmed).push(member);
        }
      });
    });

    // Sort sports according to standard club order, then others alphabetically
    const sortedSportNames = Array.from(map.keys()).sort((a, b) => {
      const idxA = DEFAULT_SPORTS_ORDER.indexOf(a);
      const idxB = DEFAULT_SPORTS_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedSportNames
      .map(sport => ({
        sport,
        members: map.get(sport) || [],
        count: (map.get(sport) || []).length,
      }))
      .filter(item => item.count >= 1); // Only sports with at least 1 approved member
  }, [approvedMembers]);

  // Automatically select the first available sport when data loads
  useEffect(() => {
    if (sportsWithMembers.length > 0) {
      if (!selectedSport || !sportsWithMembers.some(s => s.sport === selectedSport)) {
        setSelectedSport(sportsWithMembers[0].sport);
      }
    } else {
      setSelectedSport(null);
    }
  }, [sportsWithMembers, selectedSport]);

  // Current sport's members
  const currentSportData = useMemo(() => {
    if (!selectedSport) return null;
    return sportsWithMembers.find(s => s.sport === selectedSport) || null;
  }, [sportsWithMembers, selectedSport]);

  // Filter members of the selected sport by search query
  const filteredSportMembers = useMemo(() => {
    if (!currentSportData) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentSportData.members;

    return currentSportData.members.filter(m =>
      m.studentName?.toLowerCase().includes(q) ||
      m.rollNumber?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      m.year?.toLowerCase().includes(q)
    );
  }, [currentSportData, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <Navbar
        activeSection="sports-members"
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Content */}
      <main className="flex-1 pt-16 sm:pt-16 lg:pt-16">
        {isLoadingApprovedMembers ? (
          <SportsMembersPageSkeleton />
        ) : (
          <div className="pt-12 sm:pt-10 pb-8 sm:pb-10 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

              {/* Simple Heading */}
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2e5b] tracking-tight">
                  Sports Members
                </h1>
              </div>

              {sportsWithMembers.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-600">No Approved Members</h3>
                  <p className="text-xs text-slate-400">
                    No approved sports members are available at this time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* Left Sidebar: Sports Selector */}
                  <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
                      Sports Disciplines
                    </p>

                    <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                      {sportsWithMembers.map(({ sport, count }) => {
                        const isSelected = selectedSport === sport;
                        return (
                          <button
                            key={sport}
                            onClick={() => {
                              setSelectedSport(sport);
                              setSearchQuery('');
                            }}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 lg:shrink lg:w-full ${
                              isSelected
                                ? 'bg-blue-50 text-[#0b2e5b] border border-blue-200 shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0b2e5b] border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  isSelected ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                              />
                              <span className="text-sm font-semibold">{sport}</span>
                            </span>

                            <div className="flex items-center gap-1.5 ml-3">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                  isSelected
                                    ? 'bg-blue-100 text-[#0b2e5b] border border-blue-200'
                                    : 'bg-slate-100 text-slate-500 border border-transparent'
                                }`}
                              >
                                {count}
                              </span>
                              <ChevronRight
                                className={`hidden lg:block w-3.5 h-3.5 transition-transform ${
                                  isSelected ? 'text-[#0b2e5b]' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Content: Active Sport Member Table */}
                  <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

                    {/* Table Header & Search */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg sm:text-xl font-bold text-[#0b2e5b]">
                          {selectedSport}
                        </h2>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0b2e5b] border border-blue-200">
                          {currentSportData?.count || 0} {(currentSportData?.count === 1) ? 'Member' : 'Members'}
                        </span>
                      </div>

                      {/* Search in Selected Sport */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`Search ${selectedSport || 'members'}...`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0b2e5b] shadow-2xs transition-colors"
                        />
                      </div>
                    </div>

                    {/* Member Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#0b2e5b] text-white">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-16">S.No</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Regd No</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Year / Dept</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSportMembers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-10 text-xs text-slate-400">
                                {searchQuery
                                  ? `No members found matching "${searchQuery}" in ${selectedSport}.`
                                  : `No approved members found for ${selectedSport}.`}
                              </td>
                            </tr>
                          ) : (
                            filteredSportMembers.map((member, idx) => (
                              <tr
                                key={member.id || member._id || idx}
                                className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${
                                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                                }`}
                              >
                                <td className="px-4 py-3 text-xs font-bold text-slate-500">{idx + 1}</td>
                                <td className="px-4 py-3 text-xs font-semibold text-[#0b2e5b] font-mono tracking-wide">
                                  {member.rollNumber}
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                  {member.studentName}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600">
                                  <span className="font-semibold">{member.year}</span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span>{member.department}</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer count indicator */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Showing {filteredSportMembers.length} of {currentSportData?.count || 0} members</span>
                      <span className="font-semibold text-slate-500">{selectedSport}</span>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveSection={() => navigate('/')} />
    </div>
  );
}
