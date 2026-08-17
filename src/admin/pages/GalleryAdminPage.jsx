import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Image as ImageIcon, Plus, Pencil, Trash2, X, Link as LinkIcon, Loader2, Search, Filter } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

export default function GalleryAdminPage() {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, isLoading } = useConvexState();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const defaultForm = {
    title: '',
    category: 'Sports Day',
    mediaType: 'Image',
    image: '',
    caption: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  const CATEGORIES = [
    'Sports Day',
    'Inter-College Competitions',
    'Training Sessions',
    'Tournaments',
    'Award Ceremonies',
    'Facilities & Grounds'
  ];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Sports Day',
      mediaType: item.mediaType || 'Image',
      image: item.image || '',
      caption: item.caption || ''
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, image: compressed }));
      } catch (err) {
        alert("Failed to process image: " + err.message);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateGalleryItem(editingItem.id, formData);
      } else {
        await addGalleryItem(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData(defaultForm);
    } catch (err) {
      console.error("Failed to save gallery media:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title || 'this media item'}"?`)) {
      await deleteGalleryItem(id);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none";

  // Filter gallery items
  const filteredGallery = gallery.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Media Gallery Management</h2>
          <p className="text-xs text-[var(--text-muted)]">Upload, edit, and organize sports gallery images and video media across campus sports events.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search media by title, caption, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Categories ({gallery.length})</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({gallery.filter(i => i.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredGallery.length === 0 ? (
        <EmptyState
          title={searchQuery || selectedCategory !== 'All' ? "No Matching Media Found" : "No Media in Gallery"}
          description={
            searchQuery || selectedCategory !== 'All' 
              ? "Try adjusting your search terms or filter selection." 
              : "Click 'Upload Media' above to publish match photos, training videos, and event highlights."
          }
          icon={ImageIcon}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((item) => (
            <div key={item.id} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden space-y-3 p-3 card-hover relative group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative h-48 rounded-lg overflow-hidden bg-black/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white shadow-sm">
                      {item.category}
                    </span>
                    {item.mediaType && item.mediaType !== 'Image' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white shadow-sm">
                        {item.mediaType}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons: Edit and Delete */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-blue-600/90 text-white hover:bg-blue-600 hover:scale-105 transition-all shadow-md"
                      title="Edit Media"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 hover:scale-105 transition-all shadow-md"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{item.caption || "No description provided."}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Category: <strong className="text-[var(--text-primary)]">{item.category}</strong></span>
                <span>Type: <strong className="text-[var(--text-primary)]">{item.mediaType || 'Image'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 rounded-xl glass-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-blue-500/20 dark:text-blue-400">
                  {editingItem ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {editingItem ? 'Edit Media Item' : 'Upload Media to Gallery'}
                </h3>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingItem(null); }}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter media title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Media Type *</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Image">Image / Photo</option>
                    <option value="Video">Video Highlight</option>
                  </select>
                </div>
              </div>

              {/* Upload or Image URL Section */}
              <div className="space-y-2.5 border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card-subtle)]">
                <label className="block text-[var(--text-secondary)] font-semibold">Media Image / Banner *</label>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Option 1: Upload from Computer</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/10 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">Option 2: Web Image URL</label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="url"
                      placeholder="Enter image URL (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                {formData.image && (
                  <div className="space-y-1 mt-2">
                    <span className="text-[11px] text-[var(--text-muted)]">Image Preview:</span>
                    <div className="h-32 rounded-lg overflow-hidden border border-[var(--border-color)] bg-black/10">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Caption / Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter caption or event details..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingItem(null); }}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg font-bold bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{editingItem ? 'Saving Changes...' : 'Publishing Media...'}</span>
                    </>
                  ) : (
                    editingItem ? 'Save Changes' : 'Publish to Gallery'
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
