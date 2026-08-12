import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Image as ImageIcon, Plus, Trash2, X, Upload, Loader2 } from 'lucide-react';

export default function GalleryAdminPage() {
  const { gallery, addGalleryItem, deleteGalleryItem, isLoading } = useConvexState();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Sports Day',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    caption: ''
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addGalleryItem(formData);
      setShowModal(false);
      setFormData({ title: '', category: 'Sports Day', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', caption: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Media Gallery Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Upload images/videos from device or web URL across Matches, Achievements, Events, and Facilities categories.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Media</span>
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : gallery.length === 0 ? (
        <EmptyState
          title="No Media in Gallery"
          description="Click 'Upload Media' above to publish match photos, training videos, and event highlights."
          icon={ImageIcon}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden space-y-3 p-3 card-hover relative group">
            <div className="relative h-44 rounded-lg overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"; }} />
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">
                {item.category}
              </span>
              <button
                onClick={() => deleteGalleryItem(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 hover:bg-red-700 transition-all shadow-md"
                title="Delete Media"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">{item.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Upload Media to Gallery</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                  <option value="Sports Day">Sports Day</option>
                  <option value="Inter-College Competitions">Inter-College Competitions</option>
                  <option value="Training Sessions">Training Sessions</option>
                  <option value="Tournaments">Tournaments</option>
                  <option value="Award Ceremonies">Award Ceremonies</option>
                </select>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2 border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card-subtle)]">
                <label className="block text-[var(--text-secondary)] font-semibold">Media Image / Banner *</label>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Upload File from Computer:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>


                {formData.image && (
                  <div className="h-32 rounded overflow-hidden border border-[var(--border-color)] mt-2">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Caption *</label>
                <textarea required rows={2} value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing Media...</span></> : 'Publish to Gallery'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
