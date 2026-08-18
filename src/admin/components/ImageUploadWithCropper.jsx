import React, { useState } from 'react';
import { Upload, Crop as CropIcon, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

export default function ImageUploadWithCropper({
  label = "Upload Photo",
  value,
  onChange,
  aspectRatio = '1:1',
  circularPreview = false,
  helpText = "Upload image from device. You can crop, zoom, and adjust like Instagram."
}) {
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawImage(event.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      // Reset input value so the same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleRecrop = () => {
    if (value) {
      setRawImage(value);
      setShowCropper(true);
    }
  };

  const handleRemove = () => {
    onChange('');
    setRawImage(null);
  };

  return (
    <div className="space-y-2 border border-[var(--border-color)] p-3.5 rounded-xl bg-[var(--bg-card-subtle)]">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[var(--text-primary)]">
          {label}
        </label>
        {value && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Cropped & Ready</span>
          </span>
        )}
      </div>

      {/* Upload Zone & Preview */}
      {!value ? (
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[var(--bg-card)] transition-colors group">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Click to select and crop photo
            </p>
            <p className="text-[10.5px] text-[var(--text-muted)]">
              Supports JPEG, PNG, WebP
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)]">
          {/* Image Preview Box */}
          <div className={`overflow-hidden border border-[var(--border-color)] bg-slate-100 dark:bg-slate-800 shrink-0 ${
            circularPreview ? 'w-14 h-14 rounded-full' : 'w-20 h-14 rounded-lg'
          }`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRecrop}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <CropIcon className="w-3 h-3" />
                <span>Adjust / Re-Crop</span>
              </button>

              <label className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors cursor-pointer inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {helpText}
            </p>
          </div>
        </div>
      )}

      {/* Instagram-style Cropper Modal */}
      {showCropper && rawImage && (
        <ImageCropperModal
          imageSrc={rawImage}
          initialAspect={aspectRatio}
          circularPreview={circularPreview}
          onClose={() => setShowCropper(false)}
          onSave={(croppedBase64) => {
            onChange(croppedBase64);
            setShowCropper(false);
          }}
        />
      )}
    </div>
  );
}
