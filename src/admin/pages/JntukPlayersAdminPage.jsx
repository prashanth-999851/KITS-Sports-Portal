import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Award, Plus, Edit, Trash2, X, Search, Calendar, MapPin, Trophy, ShieldCheck, User, Loader2 } from 'lucide-react';

export default function JntukPlayersAdminPage() {
  const { 
    jntukPlayers = [], 
    addJntukPlayer, 
    updateJntukPlayer, 
    deleteJntukPlayer, 
    isLoading 
  } = useConvexState();
  const { showToast } = useToast();

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
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
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      player.studentName.toLowerCase().includes(term) ||
      player.rollNumber.toLowerCase().includes(term) ||
      player.sport.toLowerCase().includes(term) ||
      player.department.toLowerCase().includes(term);

    const matchesYear = selectedYear === 'All' || player.academicYear === selectedYear;
    const matchesSport = selectedSport === 'All' || player.sport === selectedSport;

    return matchesSearch && matchesYear && matchesSport;
  });

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">JNTUK Represented Players Roster</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage student athletes representing KKR & KSR at JNTUK Inter-University and National tournaments by academic year.</p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add JNTUK Athlete</span>
        </button>
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
            <span className="text-xs font-semibold">Sports Disciplines</span>
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{availableSports.length}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Academic Year Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="All">All Academic Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Sport Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Sport Discipline</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="All">All Sports Disciplines</option>
              {availableSports.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search athlete, roll no, sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Players Cards Grid */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title="No JNTUK Represented Players Found"
          description="Click 'Add JNTUK Athlete' above to register player representations for the selected academic year."
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
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Edit Athlete Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id, player.studentName)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Delete Athlete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Athlete Details */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-color)] shrink-0 bg-[var(--bg-card-subtle)]">
                    <img 
                      src={player.photoUrl} 
                      alt={player.studentName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; 
                      }} 
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{player.studentName}</h3>
                    <p className="text-xs font-mono text-[var(--text-muted)]">{player.rollNumber}</p>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{player.sport} • {player.department}</span>
                  </div>
                </div>

                {/* Tournament Info */}
                <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1 text-xs text-[var(--text-secondary)]">
                  <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{player.tournamentName}</span>
                  </p>
                  {player.venueHost && (
                    <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{player.venueHost}</span>
                    </p>
                  )}
                  {player.achievementDetails && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                      ⭐ {player.achievementDetails}
                    </p>
                  )}
                </div>

              </div>

              <div className="pt-3 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] flex justify-between items-center">
                <span>JNTUK Inter-University Athlete</span>
                <span className="font-mono">{player.id ? player.id.substring(0, 8) : ''}</span>
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
                {editingPlayer ? 'Edit JNTUK Represented Athlete' : 'Add JNTUK Represented Athlete'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingPlayer(null); }} 
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Student Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. M. Bharath Kumar" 
                    value={formData.studentName} 
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Roll Number *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 22211A1205" 
                    value={formData.rollNumber} 
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
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

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Department *</label>
                  <select 
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                    className={inputClass}
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="CAI">CAI</option>
                    <option value="CSM">CSM</option>
                    <option value="CSD">CSD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Sport *</label>
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
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Tournament / Championship Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. South Zone Inter-University Cricket Tournament" 
                  value={formData.tournamentName} 
                  onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Host University / Venue</label>
                <input 
                  type="text" 
                  placeholder="e.g. SRM University, Chennai" 
                  value={formData.venueHost} 
                  onChange={(e) => setFormData({ ...formData, venueHost: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Achievement / Representation Details</label>
                <input 
                  type="text" 
                  placeholder="e.g. Team Captain / South Zone Quarter Finalist" 
                  value={formData.achievementDetails} 
                  onChange={(e) => setFormData({ ...formData, achievementDetails: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              {/* Upload Photo File */}
              <div className="space-y-2 border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card-subtle)]">
                <label className="block text-[var(--text-secondary)] font-semibold">Athlete Photo Image *</label>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Upload File from Device:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, photo: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                {formData.photo && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shrink-0">
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }} />
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Photo Selected & Ready</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Performing Action...</span>
                  </>
                ) : (
                  editingPlayer ? 'Save Changes' : 'Add JNTUK Athlete to Roster'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
