import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { GALLERY_CATEGORIES } from '../data/mockData';
import { Maximize2, X } from 'lucide-react';

export default function Gallery() {
  const { gallery } = useConvexState();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);

  const filteredItems = activeCategory === "All"
    ? gallery
    : gallery.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="py-20 bg-[var(--bg-main)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Visual Memories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Campus <span className="accent-text">Sports Gallery</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Moments capturing victories, intense training, award ceremonies, and sports day celebrations.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item)}
              className="break-inside-avoid relative rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] group cursor-pointer card-hover"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white uppercase">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
                <p className="text-xs text-slate-200 line-clamp-1">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-4xl w-full glass-modal rounded-xl overflow-hidden">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={lightboxImage.image}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 space-y-1.5">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">{lightboxImage.category}</span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{lightboxImage.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
