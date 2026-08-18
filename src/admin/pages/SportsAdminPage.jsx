import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Trophy, Plus, Edit, Trash2, MapPin, X, Upload, Loader2 } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';
import ImageUploadWithCropper from '../components/ImageUploadWithCropper';

export default function SportsAdminPage() {
  const { sports, addSport, updateSport, deleteSport, isLoading } = useConvexState();
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [editingImageSport, setEditingImageSport] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Outdoor',
    description: '',
    coordinator: 'K. Venkata Rao',
    assistantCoordinator: 'M. Surya Prakash Rao',
    menCaptain: '',
    womenCaptain: '',
    asstFacultyCoordinator: 'M. Surya Prakash Rao',
    schedule: 'Mon - Fri (04:30 PM - 06:30 PM)',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
  });

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        callback(compressed);
      } catch (err) {
        alert("Failed to process image: " + err.message);
      }
    }
  };

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      category: sport.category,
      description: sport.description,
      coordinator: sport.coordinator || 'Dr. P. Suresh',
      asstFacultyCoordinator: sport.asstFacultyCoordinator || 'M. Surya Prakash Rao',
      assistantCoordinator: sport.assistantCoordinator || '',
      menCaptain: sport.teamDetails?.menCaptain || '',
      womenCaptain: sport.teamDetails?.womenCaptain || '',
      venue: sport.teamDetails?.venue || 'KKR and KSR Sports Ground',
      schedule: sport.schedule || 'Mon - Fri (04:30 PM - 06:30 PM)',
      image: sport.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'
    });
    setShowModal(true);
  };

  const handleOpenEditImage = (sport) => {
    setEditingImageSport(sport);
    setNewImageUrl(sport.image || '');
    setShowImageModal(true);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingImageSport) {
        await updateSport(editingImageSport.id, { image: newImageUrl });
      }
      setShowImageModal(false);
      setEditingImageSport(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        coordinator: formData.coordinator,
        assistantCoordinator: formData.assistantCoordinator,
        asstFacultyCoordinator: formData.asstFacultyCoordinator,
        teamDetails: {
          menCaptain: formData.menCaptain,
          womenCaptain: formData.womenCaptain,
          venue: formData.venue
        },
        schedule: formData.schedule,
        image: formData.image
      };

      if (editingSport) {
        await updateSport(editingSport.id, payload);
      } else {
        await addSport(payload);
      }
      setShowModal(false);
      setEditingSport(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Sports Discipline Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage 11 sports panels, assigned coordinators, team captains, venues, schedules, and uploaded banner images.</p>
        </div>
        <button
          onClick={() => { setEditingSport(null); setFormData({ name: '', category: 'Outdoor', description: '', coordinator: 'K. Venkata Rao', assistantCoordinator: 'M. Surya Prakash Rao', menCaptain: '', womenCaptain: '', venue: 'KKR and KSR Sports Ground', schedule: 'Mon - Fri (04:30 PM - 06:30 PM)', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800' }); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0d3a73] text-white hover:bg-[#104a8e]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Sport</span>
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : sports.length === 0 ? (
        <EmptyState
          title="No Sports Panels Yet"
          description="Click 'Add New Sport' above to create a new active sports discipline panel."
          icon={Trophy}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sports.map((s) => (
          <div key={s.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between card-hover min-h-[440px] shadow-sm hover:shadow-md transition-all duration-300">
            <div>
              <div className="relative h-48 sm:h-52 group overflow-hidden bg-slate-900">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#0d3a73] text-white shadow-md">
                  {s.category}
                </span>

                <div className="absolute bottom-2.5 left-3.5 right-3.5">
                  <h3 className="text-base font-bold text-white drop-shadow-md">{s.name}</h3>
                </div>

                {/* Edit Image Quick Action Overlay */}
                <button
                  onClick={() => handleOpenEditImage(s)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-md"
                  title="Upload / Change Image"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px]">Change Image</span>
                </button>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{s.description}</p>
                <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Faculty Coordinator:</span>
                    <strong className="text-[var(--text-primary)]">{s.coordinator}</strong>
                  </div>
                  {s.asstFacultyCoordinator && (
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-1">
                      <span className="text-[var(--text-muted)]">Asst. Faculty Coordinator:</span>
                      <strong className="text-[var(--text-primary)]">{s.asstFacultyCoordinator}</strong>
                    </div>
                  )}
                  {s.teamDetails?.menCaptain && (
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-1">
                      <span className="text-[var(--text-muted)]">Men Captain:</span>
                      <strong className="text-[var(--text-primary)]">{s.teamDetails.menCaptain}</strong>
                    </div>
                  )}
                  {s.teamDetails?.womenCaptain && (
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-1">
                      <span className="text-[var(--text-muted)]">Women Captain:</span>
                      <strong className="text-[var(--text-primary)]">{s.teamDetails.womenCaptain}</strong>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-color)]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{s.teamDetails?.venue || 'Campus Ground'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
              <button
                onClick={() => deleteSport(s.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition-colors"
                title="Delete Sport"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Upload/Edit Image Modal */}
      {showImageModal && editingImageSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-xl glass-modal space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Upload / Change Image: {editingImageSport.name}</h3>
              <button onClick={() => setShowImageModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleImageSubmit} className="space-y-4 text-xs">
              <ImageUploadWithCropper
                label="Sport Banner Image"
                value={newImageUrl}
                onChange={setNewImageUrl}
                aspectRatio="16:9"
                helpText="Crop and position 16:9 widescreen sport banner"
              />

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Image...</span></> : 'Save Image'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sport Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{editingSport ? 'Edit Sport Panel' : 'Add Sport Discipline'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Sport Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="Mind Sport">Mind Sport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Faculty Coordinator *</label>
                  <input type="text" required value={formData.coordinator} onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Asst. Faculty Coordinator *</label>
                  <input type="text" required value={formData.asstFacultyCoordinator} onChange={(e) => setFormData({ ...formData, asstFacultyCoordinator: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Upload Image Section with Instagram-style Cropper */}
              <ImageUploadWithCropper
                label="Sport Banner Image *"
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                aspectRatio="16:9"
                helpText="Crop and position 16:9 widescreen sport banner"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Men Captain</label>
                  <input type="text" value={formData.menCaptain} onChange={(e) => setFormData({ ...formData, menCaptain: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Women Captain</label>
                  <input type="text" value={formData.womenCaptain} onChange={(e) => setFormData({ ...formData, womenCaptain: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Description *</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#0d3a73] text-white hover:bg-[#104a8e] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Performing Action...</span></> : (editingSport ? 'Save Changes' : 'Create Sport Panel')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
