import React, { useState, useMemo, useEffect } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton, MetricCardSkeleton, AdminGridPageSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ImageUploadWithCropper from '../components/ImageUploadWithCropper';
import JntukPlayerCrestCard from '../../components/JntukPlayerCrestCard';
import { 
  Award, Plus, Edit, Trash2, X, Search, Calendar, 
  Trophy, Loader2, FileSpreadsheet, RotateCcw,
  Users, Eye, Sparkles, ShieldCheck, ChevronUp, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  computeJntukPlayerCounts, 
  getPlayerKey,
  normalizeSportName,
  normalizeDepartment,
  normalizeAcademicYear,
  normalizeRollNumber
} from '../../utils/jntukPlayerUtils';

const OFFICIAL_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'];

const getInitialFormData = (targetLevel = 'JNTUK', targetYear = '', defaultOrder = '') => ({
  studentName: '',
  rollNumber: '',
  department: '',
  sport: '',
  academicYear: targetYear || '',
  tournamentName: '',
  venueHost: '',
  photo: '',
  achievementDetails: '',
  level: targetLevel || 'JNTUK',
  displayOrder: defaultOrder || '',
});

export default function JntukPlayersAdminPage() {
  const { 
    jntukPlayers = [], 
    addJntukPlayer, 
    updateJntukPlayer, 
    deleteJntukPlayer, 
    reorderJntukPlayer,
    migrateJntukOrders,
    normalizeAllJntukPlayers,
    isLoading,
    isLoadingJntukPlayers 
  } = useConvexState();
  const { showToast } = useToast();
  const [isNormalizing, setIsNormalizing] = useState(false);

  // Enterprise Filter States
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' | 'JNTUK' | 'District'
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(getInitialFormData('JNTUK'));

  // Lock body scroll when modal is open to prevent duplicate/detached scrollbar
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showModal]);

  // Safe one-time backfill migration for existing records without displayOrder
  useEffect(() => {
    if (isLoading || isLoadingJntukPlayers || jntukPlayers.length === 0) return;
    const hasUnordered = jntukPlayers.some(p => p.displayOrder === null || p.displayOrder === undefined);
    if (hasUnordered && migrateJntukOrders) {
      migrateJntukOrders().then(res => {
        if (res?.updated > 0) {
          console.log(`Auto-backfilled display orders for ${res.updated} athletes.`);
        }
      }).catch(err => {
        console.error('Error auto-backfilling display orders:', err);
      });
    }
  }, [isLoading, isLoadingJntukPlayers, jntukPlayers, migrateJntukOrders]);

  // Compute maximum display order per (level, academicYear) group for quick reorder boundaries
  const groupMaxOrders = useMemo(() => {
    const map = new Map();
    for (const p of jntukPlayers) {
      const key = `${p.level === 'District' ? 'District' : 'JNTUK'}___${normalizeAcademicYear(p.academicYear)}`;
      const currentMax = map.get(key) || 0;
      const pOrder = typeof p.displayOrder === 'number' ? p.displayOrder : 0;
      if (pOrder > currentMax) {
        map.set(key, pOrder);
      }
    }
    return map;
  }, [jntukPlayers]);

  const handleQuickReorder = async (player, direction) => {
    const currentOrder = typeof player.displayOrder === 'number' ? player.displayOrder : 1;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    if (newOrder < 1) return;

    try {
      await reorderJntukPlayer(player.id, newOrder);
      showToast('Display order updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Unable to update display order. Please try again.', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setSelectedDept('All');
    setSelectedSport('All');
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      studentName: player.studentName || '',
      rollNumber: player.rollNumber || '',
      department: player.department || '',
      sport: player.sport || '',
      academicYear: player.academicYear || '',
      tournamentName: player.tournamentName || '',
      venueHost: player.venueHost || '',
      photo: player.photoUrl || '',
      achievementDetails: player.achievementDetails || '',
      level: player.level === 'District' ? 'District' : 'JNTUK',
      displayOrder: typeof player.displayOrder === 'number' ? String(player.displayOrder) : '',
    });
    setShowModal(true);
  };

  const handleAddNew = (defaultCategory = null) => {
    setEditingPlayer(null);
    const targetLevel = (typeof defaultCategory === 'string' && defaultCategory !== 'All') 
      ? defaultCategory 
      : (selectedCategory !== 'All' ? selectedCategory : 'JNTUK');
    const targetYear = selectedYear !== 'All' ? selectedYear : '';

    // Calculate next display order for this group
    const groupCount = jntukPlayers.filter(
      p => (p.level === 'District' ? 'District' : 'JNTUK') === targetLevel &&
           (!targetYear || normalizeAcademicYear(p.academicYear) === normalizeAcademicYear(targetYear))
    ).length;

    setFormData(getInitialFormData(targetLevel, targetYear, String(groupCount + 1)));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.rollNumber.trim() || !formData.academicYear.trim()) {
      showToast('Please fill out student name, roll number, and academic year.', 'warning');
      return;
    }

    if (formData.displayOrder !== '' && (!Number.isInteger(Number(formData.displayOrder)) || Number(formData.displayOrder) < 1)) {
      showToast('Display Order must be a positive whole number (minimum 1).', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData = {
        ...formData,
        studentName: formData.studentName.trim(),
        rollNumber: normalizeRollNumber(formData.rollNumber),
        department: normalizeDepartment(formData.department),
        sport: normalizeSportName(formData.sport),
        academicYear: normalizeAcademicYear(formData.academicYear),
        tournamentName: formData.tournamentName.trim(),
        venueHost: formData.venueHost.trim(),
        photoUrl: formData.photo,
        achievementDetails: formData.achievementDetails.trim(),
        level: formData.level === 'District' ? 'District' : 'JNTUK',
        displayOrder: formData.displayOrder !== '' && !isNaN(Number(formData.displayOrder))
          ? Math.max(1, Math.floor(Number(formData.displayOrder)))
          : undefined,
      };

      if (editingPlayer) {
        await updateJntukPlayer(editingPlayer.id, cleanData);
        showToast(`Display order updated successfully. Updated record for ${cleanData.studentName}`, 'success');
      } else {
        await addJntukPlayer(cleanData);
        showToast(`Added ${cleanData.studentName} to ${cleanData.level} Roster`, 'success');
      }
      setShowModal(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error(err);
      showToast('Unable to update record: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from Elite Players roster?`)) {
      try {
        await deleteJntukPlayer(id);
        showToast(`Removed ${name} from roster. Remaining positions normalized.`, 'info');
      } catch (err) {
        showToast('Failed to remove player: ' + err.message, 'error');
      }
    }
  };

  // Unique Academic Years & Sports dynamically derived & normalized
  const availableYears = useMemo(() => {
    return Array.from(new Set([
      '2025-2026', '2024-2025', '2023-2024', '2022-2023',
      ...jntukPlayers.map(p => normalizeAcademicYear(p.academicYear)).filter(Boolean)
    ]));
  }, [jntukPlayers]);

  const availableSports = useMemo(() => {
    const COMMON_SPORTS = [
      'Cricket', 'Kho-Kho', 'Netball', 'Volleyball', 'Basketball', 
      'Football', 'Athletics', 'Kabaddi', 'Chess', 'Badminton', 
      'Fencing', 'Shooting', 'Ball-Badminton', 'Table Tennis'
    ];
    return Array.from(new Set([
      ...COMMON_SPORTS,
      ...jntukPlayers.map(p => normalizeSportName(p.sport)).filter(Boolean)
    ])).sort((a, b) => a.localeCompare(b));
  }, [jntukPlayers]);

  // Compute unique athlete counts and identify athletes with multi-year representation
  const athleteCounts = useMemo(() => {
    return computeJntukPlayerCounts(jntukPlayers, selectedCategory);
  }, [jntukPlayers, selectedCategory]);

  const multiYearPlayerKeys = useMemo(() => {
    const keyMap = new Map();
    for (const p of jntukPlayers) {
      const key = getPlayerKey(p);
      keyMap.set(key, (keyMap.get(key) || 0) + 1);
    }
    const multiKeys = new Set();
    for (const [key, cnt] of keyMap.entries()) {
      if (cnt > 1) multiKeys.add(key);
    }
    return multiKeys;
  }, [jntukPlayers]);

  const filteredPlayers = useMemo(() => {
    const list = jntukPlayers.filter(player => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        (player.studentName && player.studentName.toLowerCase().includes(term)) ||
        (player.rollNumber && player.rollNumber.toLowerCase().includes(term)) ||
        (player.sport && player.sport.toLowerCase().includes(term)) ||
        (player.department && player.department.toLowerCase().includes(term)) ||
        (player.tournamentName && player.tournamentName.toLowerCase().includes(term)) ||
        (player.venueHost && player.venueHost.toLowerCase().includes(term));

      const matchesCategory = selectedCategory === 'All' || (player.level === 'District' ? 'District' : 'JNTUK') === selectedCategory;
      const matchesYear = selectedYear === 'All' || normalizeAcademicYear(player.academicYear) === normalizeAcademicYear(selectedYear);
      const matchesDept = selectedDept === 'All' || normalizeDepartment(player.department) === normalizeDepartment(selectedDept);
      const matchesSport = selectedSport === 'All' || normalizeSportName(player.sport) === normalizeSportName(selectedSport);

      return matchesSearch && matchesCategory && matchesYear && matchesDept && matchesSport;
    });

    // Sort strictly by Academic Year desc, Category, Display Order ASC (nulls last), Fallback Name
    return list.sort((a, b) => {
      const yrA = normalizeAcademicYear(a.academicYear);
      const yrB = normalizeAcademicYear(b.academicYear);
      const yrDiff = yrB.localeCompare(yrA);
      if (yrDiff !== 0) return yrDiff;

      const lvlA = a.level === 'District' ? 'District' : 'JNTUK';
      const lvlB = b.level === 'District' ? 'District' : 'JNTUK';
      const lvlDiff = lvlA.localeCompare(lvlB);
      if (lvlDiff !== 0) return lvlDiff;

      const ordA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
      const ordB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
      if (ordA !== ordB) return ordA - ordB;

      return (a.studentName || '').localeCompare(b.studentName || '');
    });
  }, [jntukPlayers, searchTerm, selectedCategory, selectedYear, selectedDept, selectedSport]);

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) +
                            (selectedYear !== 'All' ? 1 : 0) + 
                            (selectedDept !== 'All' ? 1 : 0) + 
                            (selectedSport !== 'All' ? 1 : 0) + 
                            (searchTerm ? 1 : 0);

  // Export to Excel
  const handleExportToExcel = () => {
    if (filteredPlayers.length === 0) {
      showToast("No athlete records match the current filter criteria to export.", "warning");
      return;
    }

    const exportData = filteredPlayers.map(player => ({
      "Athlete Name": player.studentName || '',
      "Roll Number": player.rollNumber || '',
      "Department": player.department || '',
      "Representation Category": player.level === 'District' ? 'District Level' : 'JNTUK Varsity',
      "Sport Discipline": player.sport || '',
      "Academic Year": player.academicYear || '',
      "Tournament Name": player.tournamentName || '',
      "Venue / Host University": player.venueHost || '',
      "Achievement Details": player.achievementDetails || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet['!cols'] = [
      { wch: 25 }, // Athlete Name
      { wch: 16 }, // Roll Number
      { wch: 14 }, // Department
      { wch: 24 }, // Category
      { wch: 20 }, // Sport Discipline
      { wch: 16 }, // Academic Year
      { wch: 40 }, // Tournament Name
      { wch: 30 }, // Venue / Host
      { wch: 45 }, // Achievement Details
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Elite Players Roster");

    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = `Elite_Players_Roster_${dateTag}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showToast(`Exported ${filteredPlayers.length} athlete records to Excel!`, 'success');
  };

  if (isLoading || isLoadingJntukPlayers) {
    return (
      <AdminGridPageSkeleton 
        title="Elite Players Roster" 
        subtitle="Loading official JNTUK & District athletes roster..." 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Elite Players Roster</h2>
          <p className="text-xs text-slate-500">Enterprise management to add, edit, remove, and export official JNTUK Varsity and District represented athletes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Standardize Database Records */}
          <button
            onClick={async () => {
              if (window.confirm("Standardize all sports and athlete formatting in the database? This fixes duplicates like CRICKET vs Cricket, kho-kho vs KHO KHO.")) {
                try {
                  setIsNormalizing(true);
                  const res = await normalizeAllJntukPlayers();
                  showToast(`Successfully standardized ${res?.updated || 0} athlete records in database!`, 'success');
                } catch (err) {
                  showToast(`Standardization failed: ${err.message}`, 'error');
                } finally {
                  setIsNormalizing(false);
                }
              }
            }}
            disabled={isLoading || isNormalizing || jntukPlayers.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Clean and standardize all sport disciplines, departments, and academic years across database records"
          >
            {isNormalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#0b2e5b]" />}
            <span>Standardize Data</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportToExcel}
            disabled={isLoading || filteredPlayers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export ({filteredPlayers.length}) to Excel</span>
          </button>

          {/* Add Athlete Button */}
          <button
            onClick={() => handleAddNew()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>
              {selectedCategory === 'District' 
                ? 'Add District Athlete' 
                : selectedCategory === 'JNTUK' 
                ? 'Add JNTUK Athlete' 
                : 'Add Elite Athlete'}
            </span>
          </button>
        </div>
      </div>

      {/* Category Segmented Selector: All / JNTUK / District */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#0b2e5b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Elite Athletes ({jntukPlayers.length})
          </button>
          <button
            onClick={() => setSelectedCategory('JNTUK')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'JNTUK'
                ? 'bg-[#0b2e5b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>JNTUK Varsity ({athleteCounts.jntukTotalRecords || 0})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('District')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'District'
                ? 'bg-[#0b2e5b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-blue-200" />
            <span>District Level ({athleteCounts.districtTotalRecords || 0})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 px-2 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredPlayers.length}</span> of {jntukPlayers.length} athletes
        </div>
      </div>

      {/* KPI Cards — Consistent White and Blue Institutional Theme */}
      {isLoading ? (
        <MetricCardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{jntukPlayers.length}</p>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Entries</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{athleteCounts.uniqueAthletesCount}</p>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Unique Athletes</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{availableYears.length}</p>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Academic Years</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all text-center space-y-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b2e5b] mx-auto group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#0b2e5b] tracking-tight">{filteredPlayers.length}</p>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Filtered</span>
          </div>
        </div>
      )}

      {/* Multi-Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search athlete name, roll number, department, sport, tournament, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none transition-all shadow-2xs"
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

          {/* Reset Filters & Active Badge */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#0b2e5b] border border-blue-200 text-xs font-bold">
                {activeFilterCount} Active {activeFilterCount === 1 ? 'Filter' : 'Filters'}
              </span>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>
          )}

        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          
          {/* Academic Year Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#0b2e5b] focus:outline-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="All">All Academic Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#0b2e5b] focus:outline-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="All">All Departments</option>
              {OFFICIAL_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sport Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sport Discipline</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#0b2e5b] focus:outline-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="All">All Sports Disciplines</option>
              {availableSports.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Dynamic Athlete Grid with Crest Card Representation */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title={
            selectedCategory === 'District'
              ? 'No District Represented Players Found'
              : selectedCategory === 'JNTUK'
              ? 'No JNTUK Represented Players Found'
              : 'No Elite Players Found'
          }
          description={
            activeFilterCount > 0
              ? 'No student athletes match the active filter criteria. Try resetting your filters.'
              : `Click 'Add ${selectedCategory === 'District' ? 'District' : selectedCategory === 'JNTUK' ? 'JNTUK' : 'Elite'} Athlete' above to register player representations.`
          }
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
            const groupKey = `${player.level === 'District' ? 'District' : 'JNTUK'}___${normalizeAcademicYear(player.academicYear)}`;
            const maxOrder = groupMaxOrders.get(groupKey) || 1;
            const currentOrder = typeof player.displayOrder === 'number' ? player.displayOrder : 1;
            const canMoveUp = currentOrder > 1;
            const canMoveDown = currentOrder < maxOrder;

            return (
              <div key={player.id} className="relative rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all group">
                
                {/* Card Action Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Display Order Badge */}
                    <div 
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]"
                      title={`Public Display Order #${currentOrder} within ${player.level} ${player.academicYear}`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Order</span>
                      <span>#{currentOrder}</span>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#0b2e5b] border border-blue-200">
                      {player.level === 'District' ? 'District' : 'JNTUK'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                      AY {player.academicYear}
                    </span>
                    {multiYearPlayerKeys.has(getPlayerKey(player)) && (
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-[#0b2e5b] border border-blue-100">
                        Multi-Year
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Quick Reorder Up / Down Controls */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleQuickReorder(player, 'up')}
                        disabled={!canMoveUp}
                        className={`p-1 rounded text-slate-600 transition-colors ${
                          canMoveUp 
                            ? 'hover:bg-white hover:text-[#0b2e5b] cursor-pointer' 
                            : 'opacity-25 cursor-not-allowed'
                        }`}
                        title={canMoveUp ? `Move Up to position #${currentOrder - 1}` : 'Already at top position (#1)'}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReorder(player, 'down')}
                        disabled={!canMoveDown}
                        className={`p-1 rounded text-slate-600 transition-colors ${
                          canMoveDown 
                            ? 'hover:bg-white hover:text-[#0b2e5b] cursor-pointer' 
                            : 'opacity-25 cursor-not-allowed'
                        }`}
                        title={canMoveDown ? `Move Down to position #${currentOrder + 1}` : 'Already at bottom position'}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleEdit(player)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit Athlete Record"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id, player.studentName)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Athlete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exact Crest Card Component Render */}
                <JntukPlayerCrestCard 
                  player={player}
                  showBadge={false}
                />

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Athlete Modal with Live Crest Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-hidden animate-fadeIn">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          {/* Modal Container: Pinned Header, Scrollable Content, Pinned Footer */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* 1. Pinned Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0b2e5b]">
                  {editingPlayer ? 'Edit Elite Athlete Representation' : 'Add Elite Athlete Representation'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPlayer ? 'Update saved athlete details and photo.' : 'Enter athlete details below. Live card preview updates as you type.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Input Form (7 cols) */}
                <form id="elite-athlete-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 text-xs">
                  {/* Level / Category Selector */}
                  <div>
                    <label className="block text-slate-700 mb-1.5 font-bold">Representation Category / Level *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level: 'JNTUK' }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          formData.level !== 'District'
                            ? 'border-[#0b2e5b] bg-blue-50/70 text-[#0b2e5b] shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0b2e5b]" />
                        <span>JNTUK (University Level)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level: 'District' }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          formData.level === 'District'
                            ? 'border-[#0b2e5b] bg-blue-50/70 text-[#0b2e5b] shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Trophy className="w-4 h-4 text-[#0b2e5b]" />
                        <span>District Level</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter full name" 
                      value={formData.studentName} 
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Roll Number / Player ID *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter roll number" 
                        value={formData.rollNumber} 
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Department *</label>
                      <select 
                        value={formData.department} 
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-[#0b2e5b] focus:outline-none transition-colors" 
                      >
                        <option value="">Select department</option>
                        {OFFICIAL_DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Sport Discipline (Event) *</label>
                      <input 
                        type="text" 
                        required 
                        list="jntuk-sports-suggestions"
                        placeholder="Select or enter sport" 
                        value={formData.sport} 
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })} 
                        onBlur={(e) => {
                          const clean = normalizeSportName(e.target.value);
                          if (clean && clean !== e.target.value) {
                            setFormData(prev => ({ ...prev, sport: clean }));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                      />
                      <datalist id="jntuk-sports-suggestions">
                        {availableSports.map(sp => (
                          <option key={sp} value={sp} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Academic Year *</label>
                      <select 
                        value={formData.academicYear} 
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-[#0b2e5b] focus:outline-none transition-colors" 
                      >
                        <option value="">Select academic year</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                        <option value="2021-2022">2021-2022</option>
                      </select>
                    </div>
                  </div>

                  {/* Display Order Management Field */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[#0b2e5b] font-bold text-xs">
                        Display Order
                      </label>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                        Scope: {formData.level || 'JNTUK'} • {formData.academicYear || 'Academic Year'}
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1"
                        step="1"
                        placeholder="Enter display order (e.g. 1)" 
                        value={formData.displayOrder} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (/^\d+$/.test(val) && Number(val) >= 1)) {
                            setFormData({ ...formData, displayOrder: val });
                          }
                        }} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 shadow-2xs transition-colors" 
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Controls the player's position in the public player list for the selected category and academic year.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Tournament / Championship Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter tournament or championship name" 
                      value={formData.tournamentName} 
                      onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Venue / Host University / District</label>
                    <input 
                      type="text" 
                      placeholder="Enter venue, host institution, or district" 
                      value={formData.venueHost} 
                      onChange={(e) => setFormData({ ...formData, venueHost: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Achievement & Selection Laurels</label>
                    <textarea 
                      rows={2}
                      placeholder="Enter achievement details or honors" 
                      value={formData.achievementDetails} 
                      onChange={(e) => setFormData({ ...formData, achievementDetails: e.target.value })} 
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#0b2e5b] focus:ring-1 focus:ring-[#0b2e5b] focus:outline-none placeholder:text-slate-400 transition-colors" 
                    />
                  </div>

                  {/* Upload Athlete Photo with Cropper */}
                  <ImageUploadWithCropper
                    label="Athlete Portrait Photo"
                    value={formData.photo}
                    onChange={(croppedUrl) => setFormData(prev => ({ ...prev, photo: croppedUrl }))}
                    aspectRatio="1:1"
                    circularPreview={true}
                    helpText="Crop portrait photo to fit the athletic badge"
                  />
                </form>

                {/* Right: Live Crest Badge Preview (5 cols) */}
                <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                  <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#0b2e5b]" />
                      Live Card Preview
                    </span>
                    <span className="text-[10px] text-[#0b2e5b] bg-blue-50 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full">
                      Position #{formData.displayOrder || 'Auto'}
                    </span>
                  </div>

                  <div className="w-full max-w-[240px]">
                    <JntukPlayerCrestCard 
                      player={{
                        studentName: formData.studentName || '',
                        rollNumber: formData.rollNumber || '',
                        sport: formData.sport || '',
                        department: formData.department || '',
                        academicYear: formData.academicYear || '',
                        tournamentName: formData.tournamentName || '',
                        venueHost: formData.venueHost || '',
                        photoUrl: formData.photo || '',
                        achievementDetails: formData.achievementDetails || '',
                        level: formData.level,
                      }}
                      showBadge={true}
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    Card preview dynamically reflects saved athlete information.
                  </p>
                </div>

              </div>
            </div>

            {/* 3. Pinned Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="elite-athlete-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#0b2e5b] text-white hover:bg-[#0d3a73] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>
                    {editingPlayer ? 'Save Changes' : (formData.level === 'District' ? 'Add District Athlete' : 'Add JNTUK Athlete')}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
