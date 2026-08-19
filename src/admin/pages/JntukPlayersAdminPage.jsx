import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ImageUploadWithCropper from '../components/ImageUploadWithCropper';
import JntukPlayerCrestCard from '../../components/JntukPlayerCrestCard';
import { 
  Award, Plus, Edit, Trash2, X, Search, Calendar, MapPin, 
  Trophy, ShieldCheck, Loader2, FileSpreadsheet, RotateCcw, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

const OFFICIAL_DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'CAI', 'CSM', 'CSD'];

export default function JntukPlayersAdminPage() {
  const { 
    jntukPlayers = [], 
    addJntukPlayer, 
    updateJntukPlayer, 
    deleteJntukPlayer, 
    isLoading 
  } = useConvexState();
  const { showToast } = useToast();

  // Enterprise Filter States
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: 'CSE',
    sport: 'Cricket',
    academicYear: '2024-2025',
    tournamentName: 'South Zone Inter-University Championship',
    venueHost: '',
    photo: '',
    achievementDetails: 'Represented JNTUK University Team',
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedYear('All');
    setSelectedDept('All');
    setSelectedSport('All');
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      studentName: player.studentName || '',
      rollNumber: player.rollNumber || '',
      department: player.department || 'CSE',
      sport: player.sport || 'Cricket',
      academicYear: player.academicYear || '2024-2025',
      tournamentName: player.tournamentName || '',
      venueHost: player.venueHost || '',
      photo: player.photoUrl || '',
      achievementDetails: player.achievementDetails || '',
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingPlayer(null);
    setFormData({
      studentName: '',
      rollNumber: '',
      department: 'CSE',
      sport: 'Cricket',
      academicYear: '2024-2025',
      tournamentName: 'South Zone Inter-University Championship',
      venueHost: '',
      photo: '',
      achievementDetails: 'Represented JNTUK University Team',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.rollNumber.trim() || !formData.academicYear.trim()) {
      showToast('Please fill out student name, roll number, and academic year.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await updateJntukPlayer(editingPlayer.id, {
          ...formData,
          photoUrl: formData.photo,
        });
        showToast(`Updated record for ${formData.studentName}`, 'success');
      } else {
        await addJntukPlayer({
          ...formData,
          photoUrl: formData.photo,
        });
        showToast(`Added ${formData.studentName} to JNTUK Roster`, 'success');
      }
      setShowModal(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save record: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from JNTUK Represented Players roster?`)) {
      try {
        await deleteJntukPlayer(id);
        showToast(`Removed ${name} from roster`, 'info');
      } catch (err) {
        showToast('Failed to remove player: ' + err.message, 'error');
      }
    }
  };

  // Unique Academic Years & Sports dynamically derived from database
  const availableYears = Array.from(new Set(['2025-2026', '2024-2025', '2023-2024', '2022-2023', ...jntukPlayers.map(p => p.academicYear).filter(Boolean)]));
  const availableSports = Array.from(new Set(['Cricket', 'Volleyball', 'Basketball', 'Football', 'Athletics', 'Kabaddi', 'Chess', 'Badminton', ...jntukPlayers.map(p => p.sport).filter(Boolean)]));

  const filteredPlayers = jntukPlayers.filter(player => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (player.studentName && player.studentName.toLowerCase().includes(term)) ||
      (player.rollNumber && player.rollNumber.toLowerCase().includes(term)) ||
      (player.sport && player.sport.toLowerCase().includes(term)) ||
      (player.department && player.department.toLowerCase().includes(term)) ||
      (player.tournamentName && player.tournamentName.toLowerCase().includes(term)) ||
      (player.venueHost && player.venueHost.toLowerCase().includes(term));

    const matchesYear = selectedYear === 'All' || player.academicYear === selectedYear;
    const matchesDept = selectedDept === 'All' || player.department === selectedDept;
    const matchesSport = selectedSport === 'All' || player.sport === selectedSport;

    return matchesSearch && matchesYear && matchesDept && matchesSport;
  });

  const activeFilterCount = (selectedYear !== 'All' ? 1 : 0) + 
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
      { wch: 20 }, // Sport Discipline
      { wch: 16 }, // Academic Year
      { wch: 40 }, // Tournament Name
      { wch: 30 }, // Venue / Host
      { wch: 45 }, // Achievement Details
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "JNTUK Representation");

    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = `JNTUK_Represented_Athletes_${dateTag}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showToast(`Exported ${filteredPlayers.length} athlete records to Excel!`, 'success');
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">JNTUK Represented Players Roster</h2>
          <p className="text-xs text-[var(--text-muted)]">Enterprise management to add, edit, remove, and export official JNTUK Varsity athletes.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Add Athlete Button */}
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add JNTUK Athlete</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportToExcel}
            disabled={isLoading || filteredPlayers.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export ({filteredPlayers.length}) to Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Total JNTUK Athletes</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">{jntukPlayers.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Academic Years</span>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{availableYears.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Active Filtered</span>
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{filteredPlayers.length} <span className="text-xs text-[var(--text-muted)] font-normal">/ {jntukPlayers.length}</span></p>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search athlete name, roll number, department, sport, tournament, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Reset Filters & Active Badge */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/30">
                {activeFilterCount} Active {activeFilterCount === 1 ? 'Filter' : 'Filters'}
              </span>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
            >
              <option value="All">All Academic Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
            >
              <option value="All">All Departments</option>
              {OFFICIAL_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sport Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Sport Discipline</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
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
          title="No JNTUK Represented Players Found"
          description={activeFilterCount > 0 ? "No student athletes match the active filter criteria. Try resetting your filters." : "Click 'Add JNTUK Athlete' above to register player representations."}
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col justify-between shadow-sm card-hover">
              
              {/* Card Action Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] mb-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-[#0b2e5b] text-white">
                  AY {player.academicYear}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(player)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                    title="Edit Athlete Record"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id, player.studentName)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
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
          ))}
        </div>
      )}

      {/* Add / Edit Athlete Modal with Live Crest Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0b2e5b]">
                  {editingPlayer ? 'Edit JNTUK Athlete Representation' : 'Add JNTUK Athlete Representation'}
                </h3>
                <p className="text-xs text-slate-500">Live preview updates instantly as you input details and upload photo.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left: Input Form (7 cols) */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Student Athlete Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. M. BHARATH KUMAR" 
                    value={formData.studentName} 
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Registration / Roll No *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 23JR1A12A8" 
                      value={formData.rollNumber} 
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Department *</label>
                    <select 
                      value={formData.department} 
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none"
                    >
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
                      placeholder="e.g. CRICKET, VOLLEYBALL"
                      value={formData.sport} 
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold uppercase focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Academic Year *</label>
                    <select 
                      value={formData.academicYear} 
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2022-2023">2022-2023</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Tournament / Championship Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. South Zone Inter-University Championship" 
                    value={formData.tournamentName} 
                    onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Venue / Host University</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SRM University, Chennai" 
                    value={formData.venueHost} 
                    onChange={(e) => setFormData({ ...formData, venueHost: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Achievement & Selection Laurels</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Selected for JNTUK University Varsity Squad • Gold Medalist" 
                    value={formData.achievementDetails} 
                    onChange={(e) => setFormData({ ...formData, achievementDetails: e.target.value })} 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#0b2e5b] focus:outline-none" 
                  />
                </div>

                {/* Upload Athlete Photo with Cropper */}
                <ImageUploadWithCropper
                  label="Athlete Portrait Photo"
                  value={formData.photo}
                  onChange={(croppedUrl) => setFormData(prev => ({ ...prev, photo: croppedUrl }))}
                  aspectRatio="1:1"
                  circularPreview={true}
                  helpText="Crop portrait photo to fit the circular athletic badge"
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#0b2e5b] text-white hover:bg-[#0d3a73] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingPlayer ? 'Save Changes' : 'Add to JNTUK Roster'}</span>
                    )}
                  </button>
                </div>

              </form>

              {/* Right: Live Crest Badge Preview (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#0b2e5b]" />
                    Live Card Preview
                  </span>
                  <span className="text-[10px] text-emerald-600">Dynamic</span>
                </div>

                <div className="w-full max-w-[260px]">
                  <JntukPlayerCrestCard 
                    player={{
                      studentName: formData.studentName || 'M. BHARATH KUMAR',
                      rollNumber: formData.rollNumber || '23JR1A12A8',
                      sport: formData.sport || 'CRICKET',
                      department: formData.department || 'CSE',
                      academicYear: formData.academicYear || '2024-2025',
                      tournamentName: formData.tournamentName || 'South Zone Inter-University Championship',
                      venueHost: formData.venueHost || 'SRM University, Chennai',
                      photoUrl: formData.photo || '',
                      achievementDetails: formData.achievementDetails,
                    }}
                    showBadge={true}
                  />
                </div>
                
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  This card badge will be displayed dynamically on the public site once saved.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
