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
    iconColor: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    heroGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    accentBorder: 'border-amber-500/30',
  },
  gold: {
    title: 'Gold Medal Laurels & Winner Honors',
    subtitle: 'First-place tournament victories and gold medals secured by collegiate sports teams and athletes',
    icon: Crown,
    iconColor: 'text-yellow-500',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    heroGradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    accentBorder: 'border-yellow-500/30',
  },
  silver: {
    title: 'Silver Medal Laurels & Runner-up Honors',
    subtitle: 'Second-place tournament laurels and silver medals earned in competitive university tournaments',
    icon: Award,
    iconColor: 'text-slate-400',
    badgeClass: 'bg-slate-400/10 text-slate-600 dark:text-slate-300 border border-slate-400/20',
    heroGradient: 'from-slate-400/20 via-slate-300/10 to-transparent',
    accentBorder: 'border-slate-400/30',
  },
  bronze: {
    title: 'Bronze Medal Laurels & 3rd Place Honors',
    subtitle: 'Third-place tournament laurels and bronze medal finishes in collegiate athletic championships',
    icon: Medal,
    iconColor: 'text-amber-700 dark:text-amber-600',
    badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20',
    heroGradient: 'from-orange-600/20 via-amber-700/10 to-transparent',
    accentBorder: 'border-orange-500/30',
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
        // Trophies include explicit "Trophy" or records marked as trophy
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
      // Sport filter
      if (selectedSport !== 'All' && r.sport !== selectedSport) {
        return false;
      }
      // Year filter
      if (selectedYear !== 'All' && r.year !== selectedYear) {
        return false;
      }
      // Search term
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

    // Auto focus search input after animation
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
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-slideUp"
      >
        {/* Decorative Top Accent Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          normalizedType === 'gold' ? 'from-yellow-400 via-amber-500 to-yellow-600' :
          normalizedType === 'silver' ? 'from-slate-300 via-slate-400 to-slate-500' :
          normalizedType === 'bronze' ? 'from-amber-600 via-orange-600 to-amber-800' :
          'from-blue-600 via-amber-500 to-blue-700'
        }`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-[var(--bg-card-subtle)]">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${config.badgeClass} shadow-sm`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="achievement-modal-title" className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {config.title}
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
                  {typeRecords.length} {typeRecords.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Dynamic Filters */}
        <div className="p-4 sm:px-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by tournament, sport, winner, runner-up..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sport Filter */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Sports ({availableSports.length})</option>
                {availableSports.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Active filter count / clear */}
            {(searchTerm || selectedSport !== 'All' || selectedYear !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('All');
                  setSelectedYear('All');
                }}
                className="px-2.5 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Records Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-[var(--bg-card-subtle)] animate-pulse" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                {typeRecords.length === 0 
                  ? `No ${config.title} Found` 
                  : 'No Records Match Your Filters'}
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                {typeRecords.length === 0
                  ? `Official ${normalizedType} records will appear here as soon as they are added by the sports directorate.`
                  : 'Try adjusting your search keywords or clearing active filters to see all results.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table (Visible on sm screens and up) */}
              <div className="hidden sm:block overflow-hidden rounded-xl border border-[var(--border-color)] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5 w-14 text-center">S.No</th>
                        <th className="py-3 px-4">Tournament / Competition</th>
                        <th className="py-3 px-4 w-36">Game / Sport</th>
                        <th className="py-3 px-3.5 w-24 text-center">Year</th>
                        <th className="py-3 px-4">Winner</th>
                        <th className="py-3 px-4">Runner-up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                      {paginatedRecords.map((record, index) => {
                        const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        // Robust outcome resolution
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
                            className="hover:bg-[var(--bg-card-subtle)]/70 transition-colors"
                          >
                            <td className="py-3 px-3.5 text-center font-bold text-[var(--text-muted)]">
                              {serialNumber}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span>{record.tournament}</span>
                                {isRaw3rd && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                    🥉 3rd Place
                                  </span>
                                )}
                              </div>
                              {record.details && (
                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-normal">
                                  {record.details}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {record.sport}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center font-bold text-[var(--text-secondary)]">
                              {record.year || '—'}
                            </td>
                            <td className="py-3 px-4">
                              {isKitsWinner ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-[11px]">
                                  🏆 {winnerText}
                                </span>
                              ) : (
                                <span className="text-[var(--text-secondary)]">{winnerText || '—'}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isKitsRunner ? (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 text-[11px]">
                                  🥈 {runnerText}
                                </span>
                              ) : (
                                <span className="text-[var(--text-secondary)]">{runnerText || '—'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Responsive Cards (Visible on screens < sm) */}
              <div className="sm:hidden space-y-3">
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
                      className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[var(--border-color)] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[10px] text-[var(--text-muted)]">
                            {serialNumber}
                          </span>
                          <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {record.sport}
                          </span>
                        </div>
                        <span className="font-extrabold text-[11px] text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                          {record.year}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                        <span>{record.tournament}</span>
                        {isRaw3rd && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                            🥉 3rd Place
                          </span>
                        )}
                      </div>

                      {record.details && (
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {record.details}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border-color)] text-[11px]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Winner</span>
                          {isKitsWinner ? (
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                              🏆 {winnerText}
                            </span>
                          ) : (
                            <span className="text-[var(--text-secondary)]">{winnerText || '—'}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Runner-up</span>
                          {isKitsRunner ? (
                            <span className="font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                              🥈 {runnerText}
                            </span>
                          ) : (
                            <span className="text-[var(--text-secondary)]">{runnerText || '—'}</span>
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
        <div className="p-3.5 sm:px-6 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[var(--text-secondary)] text-center sm:text-left">
            Showing <span className="font-bold text-[var(--text-primary)]">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-[var(--text-primary)]">{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</span> of{' '}
            <span className="font-bold text-[var(--text-primary)]">{filteredRecords.length}</span> records
            {filteredRecords.length !== typeRecords.length && (
              <span className="text-[var(--text-muted)] ml-1">
                (filtered from {typeRecords.length} total)
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-[var(--text-primary)]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
