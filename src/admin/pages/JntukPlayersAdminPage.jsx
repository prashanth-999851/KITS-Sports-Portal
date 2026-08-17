import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { compressImage } from '../../utils/imageCompressor';
import { Award, Plus, Edit, Trash2, X, Search, Calendar, MapPin, Trophy, ShieldCheck, Loader2, FileSpreadsheet, RotateCcw } from 'lucide-react';
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
    academicYear: '2025-2026',
    tournamentName: 'South Zone Inter-University Championship',
    venueHost: 'SRM University, Chennai',
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
      academicYear: player.academicYear || '2025-2026',
      tournamentName: player.tournamentName || 'South Zone Inter-University Championship',
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
      academicYear: '2025-2026',
      tournamentName: 'South Zone Inter-University Championship',
      venueHost: 'SRM University, Chennai',
      photo: '',
      achievementDetails: 'Represented JNTUK University Team',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.rollNumber || !formData.academicYear) {
      showToast('Please fill out student name, roll number, and academic year.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await updateJntukPlayer(editingPlayer.id, formData);
        showToast(`Updated record for ${formData.studentName}`, 'success');
      } else {
        await addJntukPlayer(formData);
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

  // Unique Academic Years & Sports
  const availableYears = Array.from(new Set(['2025-2026', '2024-2025', '2023-2024', '2022-2023', ...jntukPlayers.map(p => p.academicYear)]));
  const availableSports = Array.from(new Set(['Cricket', 'Volleyball', 'Basketball', 'Football', 'Athletics', 'Kabaddi', 'Chess', 'Ball Badminton', 'Badminton', ...jntukPlayers.map(p => p.sport)]));

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

  // Enterprise Export to Excel
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
          <p className="text-xs text-[var(--text-muted)]">Enterprise portal to add, review, filter, edit, delete, and export student athletes representing KKR & KSR at JNTUK Inter-University tournaments.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Add Athlete Button */}
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
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
            <span className="text-xs font-semibold">Academic Years Tracked</span>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{availableYears.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Filtered Output</span>
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{filteredPlayers.length} <span className="text-xs text-[var(--text-muted)] font-normal">/ {jntukPlayers.length}</span></p>
        </div>
      </div>

      {/* Enterprise Multi-Filter Toolbar */}
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

      {/* Players Cards Grid */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title="No JNTUK Represented Players Found"
          description={activeFilterCount > 0 ? "No student athletes match the active filter criteria. Try resetting your filters." : "Click 'Add JNTUK Athlete' above to register player representations."}
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 space-y-4 card-hover flex flex-col justify-between">
              <div className="space-y-3">
                
                {/* Year & Actions Bar */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#1E3A8A] text-white">
                    {player.academicYear}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(player)}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                      title="Edit Athlete Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id, player.studentName)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Athlete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Athlete Info Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-card-subtle)] border border-[var(--border-color)] shrink-0">
                    <img 
                      src={player.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"} 
                      alt={player.studentName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"; }}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{player.studentName}</h3>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{player.rollNumber}</span>
                  </div>
                </div>

                {/* Event & Sport Badges */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{player.sport} • {player.department}</span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
                    <h4 className="font-bold text-[var(--text-primary)] line-clamp-1">{player.tournamentName}</h4>
                    {player.venueHost && (
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{player.venueHost}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-color)] italic line-clamp-2">
                      "{player.achievementDetails}"
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Athlete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingPlayer ? 'Edit JNTUK Athlete Representation' : 'Add JNTUK Athlete Representation'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Student Athlete Full Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter athlete full name" 
                  value={formData.studentName} 
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Roll Number *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter roll number" 
                    value={formData.rollNumber} 
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Department *</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                    className={inputClass}
                  >
                    {OFFICIAL_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Sport Discipline *</label>
                  <select 
                    value={formData.sport} 
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })} 
                    className={inputClass}
                  >
                    {availableSports.map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Academic Year *</label>
                  <select 
                    value={formData.academicYear} 
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
                    className={inputClass}
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Tournament / Championship Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter tournament name" 
                  value={formData.tournamentName} 
                  onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Venue / Host University *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter host university / venue" 
                  value={formData.venueHost} 
                  onChange={(e) => setFormData({ ...formData, venueHost: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Achievement & Selection Details</label>
                <textarea 
                  rows={2}
                  placeholder="Enter achievement / representation details" 
                  value={formData.achievementDetails} 
                  onChange={(e) => setFormData({ ...formData, achievementDetails: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              {/* Upload Photo */}
              <div className="space-y-1">
                <label className="block text-[var(--text-secondary)] font-semibold">Athlete Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImage(file);
                        setFormData(prev => ({ ...prev, photo: compressed }));
                      } catch (err) {
                        alert("Failed to process image: " + err.message);
                      }
                    }
                  }}
                  className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPlayer ? 'Save Changes' : 'Add Athlete'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
