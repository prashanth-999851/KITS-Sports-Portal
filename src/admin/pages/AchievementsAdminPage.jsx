import React, { useState, useMemo, useEffect } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { AdminGridPageSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { 
  Award, Medal, Trophy, Crown, Plus, X, Trash2, Edit, 
  Search, Download, UploadCloud, Eye, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import ImageUploadWithCropper from '../components/ImageUploadWithCropper';
import AchievementExcelImportModal from '../components/AchievementExcelImportModal';
import { downloadAchievementExcelTemplate } from '../../utils/achievementUtils';

export default function AchievementsAdminPage() {
  const { 
    achievements, 
    achievementRecords = [], 
    addAchievement, 
    updateAchievement,
    deleteAchievement, 
    importAchievements,
    updateSettings, 
    isLoading, 
    isLoadingAchievements 
  } = useConvexState();
  const { showToast } = useToast();

  // Active top-level Tab: 'records' | 'awards'
  const [activeTab, setActiveTab] = useState('records');

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
  const [showAwardModal, setShowAwardModal] = useState(false);
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

  // Legacy Award Form state
  const [awardForm, setAwardForm] = useState({
    title: '',
    recipient: '',
    category: 'Individual Excellence',
    achievement: '',
    medalType: 'Gold',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'
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
  const handleOpenAddRecord = () => {
    setEditingRecord(null);
    setRecordForm({
      tournament: '',
      sport: '',
      year: new Date().getFullYear().toString(),
      achievementType: 'Trophy',
      winner: 'KKR & KSR Institute of Technology & Sciences (KITS)',
      runnerUp: '',
      details: '',
    });
    setShowRecordModal(true);
  };

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

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await updateAchievement(editingRecord.id, recordForm);
        showToast('Achievement updated successfully!', 'success');
      } else {
        await addAchievement(recordForm);
        showToast('Achievement added successfully!', 'success');
      }
      setShowRecordModal(false);
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

  // Legacy Wall of Fame Award Handlers
  const handleSubmitAward = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAchievement(awardForm);
      showToast('Wall of Fame honor published successfully!', 'success');
      setShowAwardModal(false);
      setAwardForm({
        title: '',
        recipient: '',
        category: 'Individual Excellence',
        achievement: '',
        medalType: 'Gold',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to add award.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAward = async (award) => {
    if (!window.confirm(`Are you sure you want to delete the award "${award.title}"?`)) return;
    try {
      await deleteAchievement(award.id);
      showToast(`Award "${award.title}" removed successfully.`, 'info');
    } catch (err) {
      showToast('Failed to delete award: ' + (err.message || err), 'error');
    }
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

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  if (isLoading || isLoadingAchievements) {
    return (
      <AdminGridPageSkeleton 
        title="Achievements & Wall of Fame Manager" 
        subtitle="Loading institutional medal tallies and sports achievements..." 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Achievements, Trophies & Laurels Manager</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage tournament achievements, batch import Excel files, and maintain live public medal tallies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={downloadAchievementExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-colors cursor-pointer"
            title="Download blank sample Excel template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Template</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>

          {/* Add Record */}
          <button
            onClick={handleOpenAddRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Live Medal Tallies Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1 relative group hover:border-[#0b2e5b] transition-colors">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{achievements.tallies.trophies}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">🏆 Overall Trophies</span>
          {achievements.tallies.isDynamic && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live from DB
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1 hover:border-yellow-500 transition-colors">
          <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
          <p className="text-2xl font-bold text-yellow-500">{achievements.tallies.gold}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">🥇 Gold Medals</span>
          {achievements.tallies.isDynamic && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live from DB
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1 hover:border-slate-400 transition-colors">
          <Award className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-2xl font-bold text-slate-400">{achievements.tallies.silver}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">🥈 Silver Medals</span>
          {achievements.tallies.isDynamic && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live from DB
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-1 hover:border-amber-700 transition-colors">
          <Medal className="w-6 h-6 text-amber-700 mx-auto" />
          <p className="text-2xl font-bold text-amber-700">{achievements.tallies.bronze}</p>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">🥉 Bronze Medals</span>
          {achievements.tallies.isDynamic && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live from DB
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'records'
                ? 'text-[#0b2e5b] dark:text-blue-400 border-b-2 border-[#0b2e5b] dark:border-blue-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Tournament Roster & Medals ({achievementRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('awards')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'awards'
                ? 'text-[#0b2e5b] dark:text-blue-400 border-b-2 border-[#0b2e5b] dark:border-blue-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Wall of Fame Honors ({achievements.awards.length})</span>
          </button>
        </div>

        {/* Override Tallies Option */}
        <button
          onClick={() => setShowTallyModal(true)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 font-semibold pb-2"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Manual Tally Override</span>
        </button>
      </div>

      {/* TAB 1: TOURNAMENT ACHIEVEMENTS TABLE */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search tournament, game, winner, runner-up..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
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
                className="px-2.5 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Sports ({uniqueSports.length})</option>
                {uniqueSports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
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
                  className="px-2.5 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          {achievementRecords.length === 0 ? (
            <EmptyState
              title="No Achievement Records Found"
              description="Click 'Import Excel' to upload your existing sports achievement sheet, or 'Add Achievement' to create records manually."
              icon={Trophy}
            />
          ) : (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3.5 w-14 text-center">S.No</th>
                      <th className="py-3 px-4">Tournament / Competition</th>
                      <th className="py-3 px-4 w-36">Game / Sport</th>
                      <th className="py-3 px-3 text-center w-20">Year</th>
                      <th className="py-3 px-3 text-center w-28">Type</th>
                      <th className="py-3 px-4">Winner</th>
                      <th className="py-3 px-4">Runner-up</th>
                      <th className="py-3 px-4 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[var(--text-muted)] font-semibold">
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
                          ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20'
                          : isSilver
                          ? 'bg-slate-400/10 text-slate-700 dark:text-slate-300 border border-slate-400/20'
                          : isBronze
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';

                        return (
                          <tr key={r.id} className="hover:bg-[var(--bg-card-subtle)]/70 transition-colors">
                            <td className="py-3 px-3.5 text-center font-bold text-[var(--text-muted)]">
                              {sNo}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              <span className="text-[var(--text-primary)]">{r.tournament}</span>
                              {r.details && (
                                <p className="text-[10px] text-[var(--text-muted)] font-normal truncate max-w-xs">
                                  {r.details}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {r.sport}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-[var(--text-secondary)]">
                              {r.year || '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${typePillClass}`}>
                                {isTrophy && '🏆'}
                                {isGold && '🥇'}
                                {isSilver && '🥈'}
                                {isBronze && '🥉'}
                                <span>{r.achievementType}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {r.winner ? (
                                <span className={r.winner?.includes('KKR') || r.winner?.includes('KITS') || r.winner?.toUpperCase() === 'WINNER'
                                  ? 'inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-[11px]'
                                  : 'text-[var(--text-secondary)]'}>
                                  {r.winner?.toUpperCase() === 'WINNER' ? '🏆 KKR & KSR Institute (KITS)' : r.winner}
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {r.runnerUp ? (
                                <span className={r.runnerUp?.includes('KKR') || r.runnerUp?.includes('KITS') || r.runnerUp?.toUpperCase() === 'RUNNER'
                                  ? 'inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 text-[11px]'
                                  : 'text-[var(--text-secondary)]'}>
                                  {r.runnerUp?.toUpperCase() === 'RUNNER' ? '🥈 KKR & KSR Institute (KITS)' : r.runnerUp}
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setViewingRecord(r)}
                                  className="p-1.5 rounded text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditRecord(r)}
                                  className="p-1.5 rounded text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                                  title="Edit achievement"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(r)}
                                  className="p-1.5 rounded text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                  title="Delete achievement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
              <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-secondary)]">
                    Showing <span className="font-bold text-[var(--text-primary)]">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-bold text-[var(--text-primary)]">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of{' '}
                    <span className="font-bold text-[var(--text-primary)]">{filteredRecords.length}</span> records
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold"
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
                      className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-semibold text-[var(--text-primary)]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: WALL OF FAME ANNUAL EXCELLENCE AWARDS */}
      {activeTab === 'awards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Wall of Fame Award Honors</h3>
            <button
              onClick={() => setShowAwardModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0d3a73] text-white hover:bg-[#104a8e]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Wall of Fame Award</span>
            </button>
          </div>

          {achievements.awards.length === 0 ? (
            <EmptyState
              title="No Wall of Fame Honors Added Yet"
              description="Click 'Add Wall of Fame Award' above to publish individual awards and certificates."
              icon={Award}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {achievements.awards.map((award, i) => (
                <div key={award.id || i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col sm:flex-row gap-4 card-hover relative group">
                  <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)]">
                    <img 
                      src={award.image} 
                      alt={award.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600"; 
                      }} 
                    />
                  </div>
                  <div className="space-y-1.5 text-xs flex-1 pr-8">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      {award.category}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{award.title}</h4>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold">Awarded to: {award.recipient}</p>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{award.achievement}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAward(award)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete Award"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: EXCEL IMPORT MODAL */}
      <AchievementExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingRecords={achievementRecords}
        onImportComplete={handleExcelImport}
      />

      {/* MODAL 2: ADD / EDIT TOURNAMENT ACHIEVEMENT RECORD */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-2xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingRecord ? 'Edit Achievement Record' : 'Add Tournament Achievement'}
              </h3>
              <button 
                onClick={() => setShowRecordModal(false)} 
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#0d3a73] hover:bg-[#104a8e] text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                  ) : (
                    <span>{editingRecord ? 'Save Changes' : 'Create Record'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW RECORD DETAILS MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Achievement Details</span>
              </h3>
              <button 
                onClick={() => setViewingRecord(null)} 
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tournament</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{viewingRecord.tournament}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Sport</span>
                  <p className="font-bold text-[var(--text-primary)]">{viewingRecord.sport}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Year</span>
                  <p className="font-bold text-[var(--text-primary)]">{viewingRecord.year}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Achievement Type</span>
                <p className="font-bold text-amber-600 dark:text-amber-400">{viewingRecord.achievementType}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Winner</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{viewingRecord.winner || '—'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Runner-up</span>
                <p className="font-bold text-amber-600 dark:text-amber-400">{viewingRecord.runnerUp || '—'}</p>
              </div>

              {viewingRecord.details && (
                <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Details</span>
                  <p className="text-[var(--text-secondary)]">{viewingRecord.details}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-semibold text-[var(--text-primary)] text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MANUAL TALLY OVERRIDE MODAL */}
      {showTallyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Manual Medal Tallies Override</h3>
              <button onClick={() => setShowTallyModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              Note: When tournament records exist in the database, counts are derived live from actual records. Use this form to set baseline settings if no records exist.
            </p>

            <form onSubmit={handleTallySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Overall Trophies</label>
                <input type="number" min="0" required value={tallyData.trophies} onChange={(e) => setTallyData({ ...tallyData, trophies: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Gold Medals</label>
                <input type="number" min="0" required value={tallyData.gold} onChange={(e) => setTallyData({ ...tallyData, gold: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Silver Medals</label>
                <input type="number" min="0" required value={tallyData.silver} onChange={(e) => setTallyData({ ...tallyData, silver: Number(e.target.value) })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Bronze Medals</label>
                <input type="number" min="0" required value={tallyData.bronze} onChange={(e) => setTallyData({ ...tallyData, bronze: Number(e.target.value) })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Tallies...</span></> : 'Save Override Counts'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD WALL OF FAME AWARD MODAL */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Wall of Fame Honor</h3>
              <button onClick={() => setShowAwardModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmitAward} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Award Title *</label>
                <input type="text" required value={awardForm.title} onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Recipient Athlete / Team *</label>
                <input type="text" required value={awardForm.recipient} onChange={(e) => setAwardForm({ ...awardForm, recipient: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Medal Type *</label>
                <select value={awardForm.medalType} onChange={(e) => setAwardForm({ ...awardForm, medalType: e.target.value })} className={inputClass}>
                  <option value="Gold">Gold Medal</option>
                  <option value="Silver">Silver Medal</option>
                  <option value="Bronze">Bronze Medal</option>
                  <option value="Trophy">Trophy</option>
                </select>
              </div>

              <ImageUploadWithCropper
                label="Award Image / Medal Photo"
                value={awardForm.image}
                onChange={(url) => setAwardForm(prev => ({ ...prev, image: url }))}
                aspectRatio="16:9"
                helpText="Crop and position achievement trophy or medal photo"
              />

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Achievement Narrative *</label>
                <textarea required rows={3} value={awardForm.achievement} onChange={(e) => setAwardForm({ ...awardForm, achievement: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing Honor...</span></> : 'Publish Honor to Wall of Fame'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
