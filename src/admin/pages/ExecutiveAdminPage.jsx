import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { compressImage } from '../../utils/imageCompressor';
import { 
  Users, Plus, Edit, Trash2, X, Mail, Phone, Building, UserCheck, Shield, Loader2
} from 'lucide-react';

export default function ExecutiveAdminPage() {
  const { 
    executiveBody = [], 
    addExecutiveMember, 
    updateExecutiveMember, 
    deleteExecutiveMember, 
    isLoading 
  } = useConvexState();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Executive Body' | 'Student Officer'
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: 'CSE',
    email: '',
    phone: '',
    photo: '',
    memberType: 'Student Officer',
    displayOrder: 1,
  });

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      position: member.position || '',
      department: member.department || 'CSE',
      email: member.email || '',
      phone: member.phone || '',
      photo: member.photo || '',
      memberType: member.memberType || 'Student Officer',
      displayOrder: member.displayOrder || 1,
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      department: 'CSE',
      email: '',
      phone: '',
      photo: '',
      memberType: 'Student Officer',
      displayOrder: executiveBody.length + 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      showToast('Please provide member name and position/designation.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMember) {
        await updateExecutiveMember(editingMember.id, formData);
        showToast(`Updated profile for ${formData.name}`, 'success');
      } else {
        await addExecutiveMember(formData);
        showToast(`Added ${formData.name} to Leadership Roster`, 'success');
      }
      setShowModal(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save member: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the leadership roster?`)) {
      try {
        await deleteExecutiveMember(id);
        showToast(`Removed ${name} from leadership roster`, 'info');
      } catch (err) {
        showToast('Failed to remove member: ' + err.message, 'error');
      }
    }
  };

  const filteredMembers = executiveBody.filter(member => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      member.name.toLowerCase().includes(term) ||
      member.position.toLowerCase().includes(term) ||
      member.department.toLowerCase().includes(term);
    const matchesTab = activeTab === 'All' || member.memberType === activeTab;
    return matchesSearch && matchesTab;
  });

  const executiveCount = executiveBody.filter(m => m.memberType === 'Executive Body').length;
  const studentOfficerCount = executiveBody.filter(m => m.memberType === 'Student Officer').length;

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Executive Body & Student Officers</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage faculty executive directors, HODs, and student office bearers (President, Vice President, Secretaries, Coordinators).</p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Officer / Member</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Total Leadership Roster</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)]">{executiveBody.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Executive Body (Faculty/Patrons)</span>
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{executiveCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Student Officers & Secretaries</span>
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{studentOfficerCount}</p>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex border-b border-[var(--border-color)]">
          {['All', 'Executive Body', 'Student Officer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'All' ? `All Members (${executiveBody.length})` : tab === 'Executive Body' ? `Executive Body (${executiveCount})` : `Student Officers (${studentOfficerCount})`}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search officer name, designation, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Roster Cards Grid */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          title="No Leadership Members Found"
          description="There are currently no office bearers or executive members matching your filter."
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div key={member.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 space-y-4 card-hover flex flex-col justify-between">
              <div className="space-y-3">
                {/* Type Badge & Actions */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    member.memberType === 'Executive Body' 
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {member.memberType || 'Executive Body'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Edit Member"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-color)] shrink-0 bg-[var(--bg-card-subtle)]">
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; 
                      }} 
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{member.name}</h3>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{member.position}</p>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-medium">
                  <Building className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span>{member.department}</span>
                </div>

                {/* Contact info */}
                {(member.email || member.phone) && (
                  <div className="space-y-1 text-xs text-[var(--text-muted)] pt-1">
                    {member.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </p>
                    )}
                    {member.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                        <span>{member.phone}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] flex justify-between items-center">
                <span>Display Order: #{member.displayOrder || 1}</span>
                <span className="font-mono">{member.id ? member.id.substring(0, 8) : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingMember ? 'Edit Leadership Member' : 'Add New Officer / Member'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingMember(null); }} 
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category / Role Type *</label>
                  <select 
                    value={formData.memberType} 
                    onChange={(e) => setFormData({ ...formData, memberType: e.target.value })} 
                    className={inputClass}
                  >
                    <option value="Student Officer">Student Officer</option>
                    <option value="Executive Body">Executive Body (Faculty/Patron)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Display Priority Order</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.displayOrder} 
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter full name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className={inputClass} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Designation / Position *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter designation / position" 
                    value={formData.position} 
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
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
                    <option value="Physical Education">Physical Education</option>
                    <option value="Management">Management</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="CAI">CAI</option>
                    <option value="CSM">CSM</option>
                    <option value="CSD">CSD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              </div>

              {/* Upload Member Photo Section */}
              <div className="space-y-2 border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card-subtle)]">
                <label className="block text-[var(--text-secondary)] font-semibold">Officer / Member Photo *</label>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Upload File from Device:</label>
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
                  editingMember ? 'Save Changes' : 'Add Member to Roster'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
