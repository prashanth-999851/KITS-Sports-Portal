import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Image, Plus, Trash2, X } from 'lucide-react';

export default function GalleryAdminPage() {
  const { gallery, addGalleryItem } = useConvexState();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Sports Day',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    caption: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addGalleryItem(formData);
    setShowModal(false);
    setFormData({ title: '', category: 'Sports Day', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', caption: '' });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Media Gallery Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Upload images/videos across Matches, Achievements, Events, and Facilities categories.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Media</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden space-y-3 p-3 card-hover">
            <div className="relative h-44 rounded-lg overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">
                {item.category}
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">{item.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4">
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

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Image / Video URL *</label>
                <input type="url" required value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Caption *</label>
                <textarea required rows={2} value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} className={inputClass} />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF]">
                Publish to Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
