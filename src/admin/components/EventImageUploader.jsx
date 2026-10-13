import React, { useState } from 'react';
import {
  Upload, Trash2, Crop as CropIcon, Image as ImageIcon,
  ArrowLeftRight, Loader2, Link2, Eye, X, CheckCircle2,
  Sparkles
} from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';

export default function EventImageUploader({
  images = [],
  imageStorageIds = [],
  onChange,
  disabled = false,
}) {
  const { uploadEventImage } = useConvexState();
  const { showToast } = useToast();

  const [uploadingSlot, setUploadingSlot] = useState(null); // null | 0 | 1
  const [cropperSlot, setCropperSlot] = useState(null); // null | 0 | 1
  const [rawCropSrc, setRawCropSrc] = useState(null);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [showUrlInputSlot, setShowUrlInputSlot] = useState(null); // null | 0 | 1
  const [urlDraft, setUrlDraft] = useState('');
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // Normalize images array to up to 2 items
  const currentImages = Array.isArray(images) ? images.slice(0, 2) : [];
  const currentStorageIds = Array.isArray(imageStorageIds) ? imageStorageIds.slice(0, 2) : [];

  const handleFileUpload = async (slotIndex, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast('Image size exceeds 12MB. Please select a smaller photo.', 'warning');
      return;
    }

    setUploadingSlot(slotIndex);
    try {
      const { storageId, url } = await uploadEventImage(file);
      const finalUrl = url || URL.createObjectURL(file);

      const nextImages = [...currentImages];
      const nextStorageIds = [...currentStorageIds];

      nextImages[slotIndex] = finalUrl;
      if (storageId) {
        nextStorageIds[slotIndex] = storageId;
      }

      // Compact empty entries if any
      const cleanedImages = nextImages.filter(Boolean).slice(0, 2);
      const cleanedStorageIds = nextStorageIds.filter(Boolean).slice(0, 2);

      onChange({
        images: cleanedImages,
        imageStorageIds: cleanedStorageIds,
        imageUrl: cleanedImages[0] || '',
      });

      showToast(`Image ${slotIndex + 1} uploaded successfully!`, 'success');
    } catch (err) {
      console.error('Failed to upload event image:', err);
      showToast('Failed to upload image: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleUrlSubmit = (slotIndex) => {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      setShowUrlInputSlot(null);
      setUrlDraft('');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      showToast('Please enter a valid HTTP or HTTPS image URL.', 'error');
      return;
    }

    const nextImages = [...currentImages];
    const nextStorageIds = [...currentStorageIds];

    nextImages[slotIndex] = trimmed;
    // URL input doesn't have a storageId
    if (nextStorageIds[slotIndex]) {
      nextStorageIds.splice(slotIndex, 1);
    }

    const cleanedImages = nextImages.filter(Boolean).slice(0, 2);
    const cleanedStorageIds = nextStorageIds.filter(Boolean).slice(0, 2);

    onChange({
      images: cleanedImages,
      imageStorageIds: cleanedStorageIds,
      imageUrl: cleanedImages[0] || '',
    });

    setShowUrlInputSlot(null);
    setUrlDraft('');
    showToast(`Image ${slotIndex + 1} URL set!`, 'success');
  };

  const handleRemove = (slotIndex) => {
    const nextImages = currentImages.filter((_, idx) => idx !== slotIndex);
    const nextStorageIds = currentStorageIds.filter((_, idx) => idx !== slotIndex);

    onChange({
      images: nextImages,
      imageStorageIds: nextStorageIds,
      imageUrl: nextImages[0] || '',
    });
    showToast(`Removed Image ${slotIndex + 1}.`, 'info');
  };

  const handleSwap = () => {
    if (currentImages.length < 2) return;

    const swappedImages = [currentImages[1], currentImages[0]];
    const swappedStorageIds = [
      currentStorageIds[1] || '',
      currentStorageIds[0] || '',
    ].filter(Boolean);

    onChange({
      images: swappedImages,
      imageStorageIds: swappedStorageIds,
      imageUrl: swappedImages[0] || '',
    });
    showToast('Swapped Primary Cover with Secondary Image!', 'success');
  };

  const startCropper = (slotIndex) => {
    const currentSrc = currentImages[slotIndex];
    if (currentSrc) {
      setRawCropSrc(currentSrc);
      setCropperSlot(slotIndex);
    }
  };

  const handleCropperSave = async (croppedBase64) => {
    const targetSlot = cropperSlot;
    setCropperSlot(null);
    setRawCropSrc(null);

    if (targetSlot === null || targetSlot === undefined) return;

    setUploadingSlot(targetSlot);
    try {
      const { storageId, url } = await uploadEventImage(croppedBase64);
      const finalUrl = url || croppedBase64;

      const nextImages = [...currentImages];
      const nextStorageIds = [...currentStorageIds];

      nextImages[targetSlot] = finalUrl;
      if (storageId) {
        nextStorageIds[targetSlot] = storageId;
      }

      const cleanedImages = nextImages.filter(Boolean).slice(0, 2);
      const cleanedStorageIds = nextStorageIds.filter(Boolean).slice(0, 2);

      onChange({
        images: cleanedImages,
        imageStorageIds: cleanedStorageIds,
        imageUrl: cleanedImages[0] || '',
      });

      showToast('Cropped photo uploaded and saved!', 'success');
    } catch (err) {
      console.error('Failed to upload cropped image:', err);
      // Fallback: use data URL directly
      const nextImages = [...currentImages];
      nextImages[targetSlot] = croppedBase64;
      onChange({
        images: nextImages.filter(Boolean).slice(0, 2),
        imageStorageIds: currentStorageIds,
        imageUrl: nextImages[0] || '',
      });
      showToast('Cropped image applied locally.', 'info');
    } finally {
      setUploadingSlot(null);
    }
  };

  const slots = [
    {
      index: 0,
      title: 'Slot 1: Primary Cover Poster',
      description: 'Used for event listings, main card preview, and hero section.',
      badge: 'Primary Cover',
      badgeClass: 'bg-[#0b2e5b] text-white',
      imgSrc: currentImages[0] || null,
    },
    {
      index: 1,
      title: 'Slot 2: Secondary / Schedule Poster',
      description: 'Optional schedule bracket, tournament fixture, or trophy image.',
      badge: 'Secondary Photo',
      badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      imgSrc: currentImages[1] || null,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>Event Images & Posters</span>
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)]">
              {currentImages.length} / 2 uploaded
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            You can upload up to 2 high-res posters from your device or supply external URLs.
          </p>
        </div>

        {/* Swap button if 2 images exist */}
        {currentImages.length === 2 && !disabled && (
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-[#0b2e5b] dark:text-blue-400 transition-colors cursor-pointer border border-blue-200 dark:border-blue-500/20 shadow-2xs"
            title="Swap primary cover and secondary image"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Slots (Change Cover)</span>
          </button>
        )}
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => {
          const isSlotUploading = uploadingSlot === slot.index;
          const isDragOver = dragOverSlot === slot.index;
          const hasImage = Boolean(slot.imgSrc);
          const isUrlInputOpen = showUrlInputSlot === slot.index;

          return (
            <div
              key={slot.index}
              className={`relative rounded-xl border p-3.5 transition-all bg-[var(--bg-card)] ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                  : hasImage
                  ? 'border-[var(--border-color)] shadow-2xs'
                  : 'border-dashed border-slate-300 dark:border-slate-700 bg-[var(--bg-card-subtle)]'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setDragOverSlot(slot.index);
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSlot(null);
                if (disabled) return;
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(slot.index, file);
              }}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${slot.badgeClass}`}>
                    {slot.badge}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {slot.index === 0 ? 'Cover Poster' : 'Schedule / Additional'}
                  </span>
                </div>

                {hasImage && (
                  <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready</span>
                  </span>
                )}
              </div>

              {/* Slot Body: Empty State vs Uploading vs Image Preview */}
              {isSlotUploading ? (
                <div className="h-44 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col items-center justify-center gap-2 text-center p-4">
                  <Loader2 className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Uploading image to cloud storage...
                  </p>
                  <p className="text-[10.5px] text-[var(--text-muted)]">
                    Optimizing file & generating permanent URL
                  </p>
                </div>
              ) : hasImage ? (
                <div className="space-y-2.5">
                  {/* Image Preview Box */}
                  <div className="relative group/preview rounded-lg overflow-hidden border border-[var(--border-color)] bg-slate-950 aspect-video flex items-center justify-center">
                    <img
                      src={slot.imgSrc}
                      alt={slot.title}
                      className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('p-4');
                      }}
                    />

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(slot.imgSrc)}
                        className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 transition-colors shadow-sm cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startCropper(slot.index)}
                        disabled={disabled}
                        className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm cursor-pointer"
                        title="Crop & Adjust Banner"
                      >
                        <CropIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(slot.index)}
                        disabled={disabled}
                        className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-medium pointer-events-none">
                      {slot.index === 0 ? 'Primary 16:9 Banner' : 'Secondary Media'}
                    </div>
                  </div>

                  {/* Quick Action Buttons below preview */}
                  {!disabled && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startCropper(slot.index)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <CropIcon className="w-3 h-3" />
                          <span>Crop / Adjust</span>
                        </button>

                        <label className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>Replace</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={disabled}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(slot.index, f);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(slot.index)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : isUrlInputOpen ? (
                /* URL input mode */
                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Paste Public Image URL</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUrlInputSlot(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUrlInputSlot(null)}
                      className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUrlSubmit(slot.index)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#0b2e5b] text-white hover:bg-[#0d3a73] cursor-pointer"
                    >
                      Apply URL
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone */
                <div className="h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-[var(--bg-card)] transition-colors flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {slot.index === 0 ? 'Upload Main Cover Poster' : 'Upload Secondary / Fixture Image'}
                    </p>
                    <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                      Click to browse or drag & drop (JPEG, PNG, WebP)
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      disabled={disabled}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot.index, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  {!disabled && (
                    <div className="mt-2 pt-2 border-t border-[var(--border-color)] w-full flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUrlDraft('');
                          setShowUrlInputSlot(slot.index);
                        }}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Or enter image URL</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Helpful footer label */}
              <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
                {slot.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Helpful Tips Banner */}
      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/15 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-[var(--text-secondary)] space-y-0.5">
          <p className="font-semibold text-[var(--text-primary)]">
            Multi-Image Display Guide:
          </p>
          <p>
            • <strong>Image 1 (Cover):</strong> Featured prominently on event cards, social banners, and the top of the event details page.
          </p>
          <p>
            • <strong>Image 2 (Secondary):</strong> Displayed in the event details interactive gallery tab. Ideal for match fixtures, brackets, timing schedules, or past tournament trophy photos.
          </p>
        </div>
      </div>

      {/* Full-size preview modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-white">
              <span className="text-xs font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Full Resolution Preview</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={previewModalUrl}
                alt="Full preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Instagram-style Cropper Modal */}
      {cropperSlot !== null && rawCropSrc && (
        <ImageCropperModal
          imageSrc={rawCropSrc}
          initialAspect="16:9"
          title={`Crop & Position ${cropperSlot === 0 ? 'Primary Cover Banner (16:9)' : 'Secondary Poster'}`}
          onClose={() => {
            setCropperSlot(null);
            setRawCropSrc(null);
          }}
          onSave={handleCropperSave}
        />
      )}
    </div>
  );
}
