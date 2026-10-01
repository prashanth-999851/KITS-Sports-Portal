import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Trophy, Medal, Award, Crown, X, Search, Filter, 
  Calendar, ChevronLeft, ChevronRight, Layers 
} from 'lucide-react';

const TYPE_CONFIG = {
  trophy: {
    title: 'Institutional Championship Trophies',
    subtitle: 'Championship and tournament trophies won by KKR & KSR Institute of Technology & Sciences',
    icon: Trophy,
  },
  gold: {
    title: 'Gold Medal Laurels & Winner Honors',
    subtitle: 'First-place tournament victories and gold medals secured by collegiate sports teams and athletes',
    icon: Crown,
  },
  silver: {
    title: 'Silver Medal Laurels & Runner-up Honors',
    subtitle: 'Second-place tournament laurels and silver medals earned in competitive university tournaments',
    icon: Award,
  },
  bronze: {
    title: 'Bronze Medal Laurels & 3rd Place Honors',
    subtitle: 'Third-place tournament laurels and bronze medal finishes in collegiate athletic championships',
    icon: Medal,
  },
};

export default function AchievementRecordsModal({
  isOpen,
  onClose,
  type = 'trophy',
  records = [],
  isLoading = false,
}) {
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedType = (type || 'trophy').toLowerCase();
  const config = TYPE_CONFIG[normalizedType] || TYPE_CONFIG.trophy;
  const IconComponent = config.icon;

  // Filter records specifically for this achievement type
  const typeRecords = useMemo(() => {
    return records.filter((r) => {
      const recType = (r.achievementType || r.medalType || '').trim().toLowerCase();
      if (normalizedType === 'trophy') {
        return recType === 'trophy' || r.isTrophy;
      }
      return recType === normalizedType;
    });
  }, [records, normalizedType]);

  // Extract unique sports and years for filter dropdowns
  const availableSports = useMemo(() => {
    const set = new Set();
    typeRecords.forEach((r) => {
      if (r.sport) set.add(r.sport);
    });
    return Array.from(set).sort();
  }, [typeRecords]);

  const availableYears = useMemo(() => {
    const set = new Set();
    typeRecords.forEach((r) => {
      if (r.year) set.add(r.year);
    });
    return Array.from(set).sort((a, b) => {
      const yA = parseInt(String(a).replace(/\D/g, '')) || 0;
      const yB = parseInt(String(b).replace(/\D/g, '')) || 0;
      return yB - yA;
    });
  }, [typeRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return typeRecords.filter((r) => {
      if (selectedSport !== 'All' && r.sport !== selectedSport) {
        return false;
      }
      if (selectedYear !== 'All' && r.year !== selectedYear) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const tournament = (r.tournament || '').toLowerCase();
        const sport = (r.sport || '').toLowerCase();
        const winner = (r.winner || '').toLowerCase();
        const runnerUp = (r.runnerUp || '').toLowerCase();
        const year = (r.year || '').toLowerCase();
        const details = (r.details || '').toLowerCase();
        return (
          tournament.includes(q) ||
          sport.includes(q) ||
          winner.includes(q) ||
          runnerUp.includes(q) ||
          year.includes(q) ||
          details.includes(q)
        );
      }
      return true;
    });
  }, [typeRecords, selectedSport, selectedYear, searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSport, selectedYear, normalizedType]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Lock body scroll and handle keyboard accessibility (Esc to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-slideUp"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b2e5b] border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <IconComponent className="w-5 h-5 text-[#0b2e5b]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="achievement-modal-title" className="text-lg sm:text-xl font-bold text-[#0b2e5b] tracking-tight">
                  {config.title}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0b2e5b] border border-blue-200">
                  {typeRecords.length} {typeRecords.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0b2e5b] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="p-3.5 sm:px-5 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by tournament, sport, winner, runner-up..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0b2e5b] shadow-2xs transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sport Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Sports ({availableSports.length})</option>
                {availableSports.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Active filter clear */}
            {(searchTerm || selectedSport !== 'All' || selectedYear !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('All');
                  setSelectedYear('All');
                }}
                className="px-2.5 py-1.5 rounded-xl text-[#0b2e5b] hover:bg-blue-50 font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Records Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#0b2e5b]">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {typeRecords.length === 0 
                  ? `No ${config.title} Found` 
                  : 'No Records Match Your Filters'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {typeRecords.length === 0
                  ? `Official ${normalizedType} records will appear here as soon as they are added by the sports directorate.`
                  : 'Try adjusting your search keywords or clearing active filters to see all results.'}
              </p>
            </div>
          ) : (
            <>
              {/* White and Blue Table — Styled identically to Sports Members table */}
              <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#0b2e5b] text-white">
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-16 text-center">S.No</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Tournament / Competition</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-36">Game / Sport</th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider w-24">Year</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Winner</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Runner-up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((record, index) => {
                        const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        const w = (record.winner || '').trim();
                        const r = (record.runnerUp || '').trim();
                        const d = (record.details || '').trim();
                        const t = (record.achievementType || '').trim().toLowerCase();

                        const isRawWinner = w.toUpperCase() === 'WINNER' || r.toUpperCase() === 'WINNER' || d.toUpperCase().includes('WINNER') || d.toUpperCase().includes('CHAMPION') || t === 'gold';
                        const isRawRunner = w.toUpperCase() === 'RUNNER' || r.toUpperCase() === 'RUNNER' || d.toUpperCase().includes('RUNNER') || t === 'silver';
                        const isRaw3rd = w.toUpperCase().includes('3RD') || r.toUpperCase().includes('3RD') || d.toUpperCase().includes('3RD') || t === 'bronze';

                        const isKitsWinner = isRawWinner || (w.includes('KITS') || w.includes('KKR'));
                        const isKitsRunner = !isKitsWinner && (isRawRunner || r.includes('KITS') || r.includes('KKR'));

                        let winnerText = w;
                        let runnerText = r;

                        if (isKitsWinner) {
                          winnerText = 'KKR & KSR Institute (KITS)';
                          runnerText = (r && !r.toUpperCase().includes('WINNER')) ? r : '—';
                        } else if (isKitsRunner) {
                          winnerText = (w && !w.toUpperCase().includes('RUNNER')) ? w : '—';
                          runnerText = 'KKR & KSR Institute (KITS)';
                        } else if (isRaw3rd) {
                          winnerText = (w && !w.toUpperCase().includes('3RD')) ? w : '—';
                          runnerText = (r && !r.toUpperCase().includes('3RD')) ? r : '—';
                        }

                        return (
                          <tr 
                            key={record.id || index}
                            className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            }`}
                          >
                            <td className="px-4 py-3 text-xs font-bold text-slate-500 text-center">
                              {serialNumber}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="font-bold text-slate-800">
                                {record.tournament}
                              </span>
                              {isRaw3rd && (
                                <span className="ml-2 text-[11px] font-semibold text-slate-500">
                                  (3rd Place)
                                </span>
                              )}
                              {record.details && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {record.details}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-[#0b2e5b]">
                              {record.sport}
                            </td>
                            <td className="px-4 py-3 text-xs text-center font-semibold text-slate-600">
                              {record.year || '—'}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold">
                              {isKitsWinner ? (
                                <span className="text-[#0b2e5b] font-bold">{winnerText}</span>
                              ) : (
                                <span className="text-slate-700">{winnerText || '—'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold">
                              {isKitsRunner ? (
                                <span className="text-[#0b2e5b] font-bold">{runnerText}</span>
                              ) : (
                                <span className="text-slate-700">{runnerText || '—'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View: Clean White & Blue Cards */}
              <div className="sm:hidden space-y-2.5">
                {paginatedRecords.map((record, index) => {
                  const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  const w = (record.winner || '').trim();
                  const r = (record.runnerUp || '').trim();
                  const d = (record.details || '').trim();
                  const t = (record.achievementType || '').trim().toLowerCase();

                  const isRawWinner = w.toUpperCase() === 'WINNER' || r.toUpperCase() === 'WINNER' || d.toUpperCase().includes('WINNER') || d.toUpperCase().includes('CHAMPION') || t === 'gold';
                  const isRawRunner = w.toUpperCase() === 'RUNNER' || r.toUpperCase() === 'RUNNER' || d.toUpperCase().includes('RUNNER') || t === 'silver';
                  const isRaw3rd = w.toUpperCase().includes('3RD') || r.toUpperCase().includes('3RD') || d.toUpperCase().includes('3RD') || t === 'bronze';

                  const isKitsWinner = isRawWinner || (w.includes('KITS') || w.includes('KKR'));
                  const isKitsRunner = !isKitsWinner && (isRawRunner || r.includes('KITS') || r.includes('KKR'));

                  let winnerText = w;
                  let runnerText = r;

                  if (isKitsWinner) {
                    winnerText = 'KKR & KSR Institute (KITS)';
                    runnerText = (r && !r.toUpperCase().includes('WINNER')) ? r : '—';
                  } else if (isKitsRunner) {
                    winnerText = (w && !w.toUpperCase().includes('RUNNER')) ? w : '—';
                    runnerText = 'KKR & KSR Institute (KITS)';
                  } else if (isRaw3rd) {
                    winnerText = (w && !w.toUpperCase().includes('3RD')) ? w : '—';
                    runnerText = (r && !r.toUpperCase().includes('3RD')) ? r : '—';
                  }

                  return (
                    <div 
                      key={record.id || index}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0b2e5b] border border-blue-200 flex items-center justify-center font-bold text-[10px]">
                            {serialNumber}
                          </span>
                          <span className="font-bold text-[#0b2e5b]">
                            {record.sport}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {record.year}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-slate-800">
                        {record.tournament}
                        {isRaw3rd && (
                          <span className="ml-1.5 text-xs font-semibold text-slate-500">
                            (3rd Place)
                          </span>
                        )}
                      </div>

                      {record.details && (
                        <p className="text-[11px] text-slate-500">
                          {record.details}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Winner</span>
                          {isKitsWinner ? (
                            <span className="font-bold text-[#0b2e5b]">{winnerText}</span>
                          ) : (
                            <span className="text-slate-700 font-semibold">{winnerText || '—'}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Runner-up</span>
                          {isKitsRunner ? (
                            <span className="font-bold text-[#0b2e5b]">{runnerText}</span>
                          ) : (
                            <span className="text-slate-700 font-semibold">{runnerText || '—'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer: Pagination Controls & Record Stats */}
        <div className="p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Showing <span className="font-bold text-[#0b2e5b]">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-[#0b2e5b]">{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</span> of{' '}
            <span className="font-bold text-[#0b2e5b]">{filteredRecords.length}</span> records
            {filteredRecords.length !== typeRecords.length && (
              <span className="text-slate-400 ml-1">
                (filtered from {typeRecords.length} total)
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#0b2e5b] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-[#0b2e5b]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#0b2e5b] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
