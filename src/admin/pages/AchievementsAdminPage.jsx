import React, { useState, useMemo, useEffect } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { AdminGridPageSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { 
  Award, Medal, Trophy, Crown, X, Trash2, Edit, 
  Search, Download, UploadCloud, Eye, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import AchievementExcelImportModal from '../components/AchievementExcelImportModal';
import { downloadAchievementExcelTemplate } from '../../utils/achievementUtils';

export default function AchievementsAdminPage() {
  const { 
    achievements, 
    achievementRecords = [], 
    updateAchievement,
    deleteAchievement, 
    importAchievements,
    updateSettings, 
    isLoading, 
    isLoadingAchievements 
  } = useConvexState();
  const { showToast } = useToast();

  // Search & Filters for Records Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('yearDesc'); // 'yearDesc' | 'yearAsc' | 'tournament' | 'sport'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [showTallyModal, setShowTallyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Tallies from context
  const tallyGold = achievements?.tallies?.gold ?? 0;
  const tallySilver = achievements?.tallies?.silver ?? 0;
  const tallyBronze = achievements?.tallies?.bronze ?? 0;
  const tallyTrophies = achievements?.tallies?.trophies ?? 0;

  const [tallyData, setTallyData] = useState({
    gold: tallyGold,
    silver: tallySilver,
    bronze: tallyBronze,
    trophies: tallyTrophies
  });

  useEffect(() => {
    setTallyData({
      gold: tallyGold,
      silver: tallySilver,
      bronze: tallyBronze,
      trophies: tallyTrophies
    });
  }, [tallyGold, tallySilver, tallyBronze, tallyTrophies]);

  // Record Form state
  const [recordForm, setRecordForm] = useState({
    tournament: '',
    sport: '',
    year: '',
    achievementType: 'Trophy',
    winner: 'KKR & KSR Institute of Technology & Sciences (KITS)',
    runnerUp: '',
    details: '',
  });



  // Unique lists for dropdown filters
  const uniqueSports = useMemo(() => {
    const set = new Set();
    achievementRecords.forEach(r => { if (r.sport) set.add(r.sport); });
    return Array.from(set).sort();
  }, [achievementRecords]);

  const uniqueYears = useMemo(() => {
    const set = new Set();
    achievementRecords.forEach(r => { if (r.year) set.add(r.year); });
    return Array.from(set).sort((a, b) => {
      const yA = parseInt(String(a).replace(/\D/g, '')) || 0;
      const yB = parseInt(String(b).replace(/\D/g, '')) || 0;
      return yB - yA;
    });
  }, [achievementRecords]);

  // Filtered & Sorted Achievement Records
  const filteredRecords = useMemo(() => {
    return achievementRecords
      .filter((r) => {
        if (selectedType !== 'All') {
          const type = (r.achievementType || '').toLowerCase();
          if (type !== selectedType.toLowerCase()) return false;
        }
        if (selectedSport !== 'All' && r.sport !== selectedSport) {
          return false;
        }
        if (selectedYear !== 'All' && r.year !== selectedYear) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          const tourn = (r.tournament || '').toLowerCase();
          const sport = (r.sport || '').toLowerCase();
          const win = (r.winner || '').toLowerCase();
          const run = (r.runnerUp || '').toLowerCase();
          const yr = (r.year || '').toLowerCase();
          const det = (r.details || '').toLowerCase();
          return tourn.includes(q) || sport.includes(q) || win.includes(q) || run.includes(q) || yr.includes(q) || det.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'yearDesc') {
          const yA = parseInt(String(a.year || '0').replace(/\D/g, '')) || 0;
          const yB = parseInt(String(b.year || '0').replace(/\D/g, '')) || 0;
          return yB - yA;
        }
        if (sortBy === 'yearAsc') {
          const yA = parseInt(String(a.year || '0').replace(/\D/g, '')) || 0;
          const yB = parseInt(String(b.year || '0').replace(/\D/g, '')) || 0;
          return yA - yB;
        }
        if (sortBy === 'tournament') {
          return (a.tournament || '').localeCompare(b.tournament || '');
        }
        if (sortBy === 'sport') {
          return (a.sport || '').localeCompare(b.sport || '');
        }
        return 0;
      });
  }, [achievementRecords, selectedType, selectedSport, selectedYear, searchTerm, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedSport, selectedYear, pageSize]);

  // Handlers for Record CRUD
  const handleOpenEditRecord = (record) => {
    setEditingRecord(record);
    setRecordForm({
      tournament: record.tournament || '',
      sport: record.sport || '',
      year: record.year || '',
      achievementType: record.achievementType || 'Trophy',
      winner: record.winner || '',
      runnerUp: record.runnerUp || '',
      details: record.details || '',
    });
    setShowRecordModal(true);
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!recordForm.tournament.trim() || !recordForm.sport.trim() || !recordForm.year.trim()) {
      showToast('Please fill in all required fields (Tournament, Sport, Year).', 'error');
      return;
    }
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      await updateAchievement(editingRecord.id, recordForm);
      showToast('Achievement updated successfully!', 'success');
      setShowRecordModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save achievement: ' + (err.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Are you sure you want to delete the achievement for "${record.tournament}" (${record.sport} - ${record.year})?`)) {
      return;
    }
    try {
      await deleteAchievement(record.id);
      showToast('Achievement deleted successfully.', 'info');
    } catch (err) {
      showToast('Failed to delete achievement: ' + (err.message || err), 'error');
    }
  };

  // Handler for Excel Import Completion
  const handleExcelImport = async (recordsToImport, updateExisting) => {
    const res = await importAchievements(recordsToImport, updateExisting);
    showToast(`Excel import complete! ${res.imported} new records added, ${res.updated} updated.`, 'success');
    return res;
  };



  const handleTallySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({
        tally_gold: tallyData.gold,
        tally_silver: tallyData.silver,
        tally_bronze: tallyData.bronze,
        tally_trophies: tallyData.trophies
      });
      showToast('Medal tallies updated successfully!', 'success');
      setShowTallyModal(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to update medal tallies.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none shadow-2xs transition-colors";

  if (isLoading || isLoadingAchievements) {
    return (
      <AdminGridPageSkeleton 
        title="Achievements Manager" 
        subtitle="Loading institutional medal tallies and sports achievements..." 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Achievements, Trophies & Laurels Manager</h2>
          <p className="text-xs text-slate-500">
            Manage tournament achievements, batch import Excel files, and maintain live public medal tallies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={downloadAchievementExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            title="Download blank sample Excel template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Template</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* Institutional Medal Tallies Metric Cards — Styled consistently with public achievements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{tallyTrophies}</p>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trophies Won</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{tallyGold}</p>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gold Medals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{tallySilver}</p>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Silver Medals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
            <Medal className="w-5 h-5" />
          </div>
          <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{tallyBronze}</p>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bronze Medals</span>
        </div>
      </div>

      {/* Table Section Header & Manage Tallies */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-[#0b2e5b]">
          Tournament Roster & Medals ({achievementRecords.length})
        </h3>

        {/* Manage Tallies Option */}
        <button
          onClick={() => setShowTallyModal(true)}
          className="text-xs text-[#0b2e5b] hover:text-[#0d3a73] hover:bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Medal Tallies</span>
        </button>
      </div>

      {/* TOURNAMENT ACHIEVEMENTS TABLE */}
        <div className="space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tournament, game, winner, runner-up..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#0b2e5b] focus:outline-none cursor-pointer shadow-2xs transition-all"
              >
                <option value="All">All Types</option>
                <option value="Trophy">🏆 Trophies</option>
                <option value="Gold">🥇 Gold</option>
                <option value="Silver">🥈 Silver</option>
                <option value="Bronze">🥉 Bronze</option>
              </select>

              {/* Sport Filter */}
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#0b2e5b] focus:outline-none cursor-pointer shadow-2xs transition-all"
              >
                <option value="All">All Sports ({uniqueSports.length})</option>
                {uniqueSports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#0b2e5b] focus:outline-none cursor-pointer shadow-2xs transition-all"
              >
                <option value="All">All Years</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#0b2e5b] focus:outline-none cursor-pointer shadow-2xs transition-all"
              >
                <option value="yearDesc">Year (Newest First)</option>
                <option value="yearAsc">Year (Oldest First)</option>
                <option value="tournament">Tournament (A-Z)</option>
                <option value="sport">Sport (A-Z)</option>
              </select>

              {(searchTerm || selectedType !== 'All' || selectedSport !== 'All' || selectedYear !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('All');
                    setSelectedSport('All');
                    setSelectedYear('All');
                  }}
                  className="px-3 py-2 rounded-xl text-[#0b2e5b] hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table Container — Styled identically to Sports Members and Public Achievements Table */}
          {achievementRecords.length === 0 ? (
            <EmptyState
              title="No Achievement Records Found"
              description="Click 'Import Excel' to upload your sports achievement sheet into the database."
              icon={Trophy}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0b2e5b] text-white">
                      <th className="py-3.5 px-4 w-16 text-center text-[11px] font-bold uppercase tracking-wider">S.No</th>
                      <th className="py-3.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider">Tournament / Competition</th>
                      <th className="py-3.5 px-4 w-36 text-left text-[11px] font-bold uppercase tracking-wider">Game / Sport</th>
                      <th className="py-3.5 px-3 text-center w-24 text-[11px] font-bold uppercase tracking-wider">Year</th>
                      <th className="py-3.5 px-3 text-center w-28 text-[11px] font-bold uppercase tracking-wider">Type</th>
                      <th className="py-3.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider">Winner</th>
                      <th className="py-3.5 px-4 text-left text-[11px] font-bold uppercase tracking-wider">Runner-up</th>
                      <th className="py-3.5 px-4 text-center w-28 text-[11px] font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 font-semibold">
                          No achievement records match your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((r, idx) => {
                        const sNo = (currentPage - 1) * pageSize + idx + 1;
                        const isGold = (r.achievementType || '').toLowerCase() === 'gold';
                        const isSilver = (r.achievementType || '').toLowerCase() === 'silver';
                        const isBronze = (r.achievementType || '').toLowerCase() === 'bronze';
                        const isTrophy = (r.achievementType || '').toLowerCase() === 'trophy';

                        const typePillClass = isGold
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : isSilver
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : isBronze
                          ? 'bg-orange-50 text-orange-800 border border-orange-200'
                          : 'bg-blue-50 text-[#0b2e5b] border border-blue-200';

                        return (
                          <tr 
                            key={r.id || idx} 
                            className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                              {sNo}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800 text-xs block">{r.tournament}</span>
                              {r.details && (
                                <p className="text-[11px] text-slate-500 font-normal truncate max-w-xs mt-0.5">
                                  {r.details}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0b2e5b] border border-blue-200 inline-block">
                                {r.sport}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold text-slate-600 text-xs">
                              {r.year || '—'}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typePillClass}`}>
                                {isTrophy && '🏆'}
                                {isGold && '🥇'}
                                {isSilver && '🥈'}
                                {isBronze && '🥉'}
                                <span>{r.achievementType}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              {r.winner ? (
                                <span className={r.winner?.includes('KKR') || r.winner?.includes('KITS') || r.winner?.toUpperCase() === 'WINNER'
                                  ? 'font-bold text-[#0b2e5b]'
                                  : 'text-slate-700 font-medium'}>
                                  {r.winner?.toUpperCase() === 'WINNER' ? 'KKR & KSR Institute (KITS)' : r.winner}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              {r.runnerUp ? (
                                <span className={r.runnerUp?.includes('KKR') || r.runnerUp?.includes('KITS') || r.runnerUp?.toUpperCase() === 'RUNNER'
                                  ? 'font-bold text-[#0b2e5b]'
                                  : 'text-slate-700 font-medium'}>
                                  {r.runnerUp?.toUpperCase() === 'RUNNER' ? 'KKR & KSR Institute (KITS)' : r.runnerUp}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setViewingRecord(r)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0b2e5b] hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditRecord(r)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Edit achievement"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(r)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete achievement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <span className="font-bold text-slate-900">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of{' '}
                    <span className="font-bold text-slate-900">{filteredRecords.length}</span> records
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-semibold text-slate-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      {/* MODAL 1: EXCEL IMPORT MODAL */}
      <AchievementExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingRecords={achievementRecords}
        onImportComplete={handleExcelImport}
      />

      {/* MODAL 2: EDIT TOURNAMENT ACHIEVEMENT RECORD */}
      {showRecordModal && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0b2e5b]">
                Edit Achievement Record
              </h3>
              <button 
                onClick={() => { setShowRecordModal(false); setEditingRecord(null); }} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Tournament / Competition Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. JNTUK Inter-Collegiate Tournaments, Vignan Mahotsav"
                  value={recordForm.tournament} 
                  onChange={(e) => setRecordForm({ ...recordForm, tournament: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    Game / Sport <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Cricket, Throwball, Kabaddi"
                    value={recordForm.sport} 
                    onChange={(e) => setRecordForm({ ...recordForm, sport: e.target.value })} 
                    className={inputClass} 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 2026, 2024-2025"
                    value={recordForm.year} 
                    onChange={(e) => setRecordForm({ ...recordForm, year: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Achievement Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={recordForm.achievementType} 
                  onChange={(e) => setRecordForm({ ...recordForm, achievementType: e.target.value })} 
                  className={inputClass}
                >
                  <option value="Trophy">🏆 Trophy (Championship / Team Cup)</option>
                  <option value="Gold">🥇 Gold Medal (1st Place / Winner)</option>
                  <option value="Silver">🥈 Silver Medal (2nd Place / Runner-up)</option>
                  <option value="Bronze">🥉 Bronze Medal (3rd Place / Bronze)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Winner (College / Team Name)
                </label>
                <input 
                  type="text" 
                  value={recordForm.winner} 
                  onChange={(e) => setRecordForm({ ...recordForm, winner: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Runner-up (College / Team Name)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. RVR & JC College of Engineering"
                  value={recordForm.runnerUp} 
                  onChange={(e) => setRecordForm({ ...recordForm, runnerUp: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Details / Notes (Optional)
                </label>
                <textarea 
                  rows={2} 
                  placeholder="e.g. State-level sports festival, D-Zone tournament"
                  value={recordForm.details} 
                  onChange={(e) => setRecordForm({ ...recordForm, details: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowRecordModal(false); setEditingRecord(null); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0b2e5b] hover:bg-[#0d3a73] text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW RECORD DETAILS MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0b2e5b] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#0b2e5b]" />
                <span>Achievement Details</span>
              </h3>
              <button 
                onClick={() => setViewingRecord(null)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Tournament</span>
                <p className="text-sm font-bold text-slate-900">{viewingRecord.tournament}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Sport</span>
                  <p className="font-bold text-[#0b2e5b]">{viewingRecord.sport}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Year</span>
                  <p className="font-bold text-slate-800">{viewingRecord.year}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Achievement Type</span>
                <p className="font-bold text-[#0b2e5b]">{viewingRecord.achievementType}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Winner</span>
                <p className="font-bold text-[#0b2e5b]">{viewingRecord.winner || '—'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Runner-up</span>
                <p className="font-bold text-slate-700">{viewingRecord.runnerUp || '—'}</p>
              </div>

              {viewingRecord.details && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Details</span>
                  <p className="text-slate-600">{viewingRecord.details}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT MEDAL TALLIES MODAL */}
      {showTallyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0b2e5b]">Edit Medal Tallies</h3>
              <button 
                onClick={() => setShowTallyModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Update the official institutional tally counts displayed across the sports portal.
            </p>

            <form onSubmit={handleTallySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Overall Trophies</label>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  value={tallyData.trophies} 
                  onChange={(e) => setTallyData({ ...tallyData, trophies: Number(e.target.value) })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Gold Medals</label>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  value={tallyData.gold} 
                  onChange={(e) => setTallyData({ ...tallyData, gold: Number(e.target.value) })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Silver Medals</label>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  value={tallyData.silver} 
                  onChange={(e) => setTallyData({ ...tallyData, silver: Number(e.target.value) })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Bronze Medals</label>
                <input 
                  type="number" 
                  min="0" 
                  required 
                  value={tallyData.bronze} 
                  onChange={(e) => setTallyData({ ...tallyData, bronze: Number(e.target.value) })} 
                  className={inputClass} 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-2.5 rounded-xl font-bold bg-[#0b2e5b] text-white hover:bg-[#0d3a73] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Tallies...</span></> : 'Save Medal Tallies'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
