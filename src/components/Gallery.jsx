import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Maximize2, X, Image as ImageIcon } from 'lucide-react';

function GallerySkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="break-inside-avoid rounded-xl overflow-hidden">
          <div className={`skeleton-shimmer ${idx % 3 === 0 ? 'h-64' : idx % 3 === 1 ? 'h-48' : 'h-56'}`} />
        </div>
      ))}
    </div>
  );
}

export default function Gallery() {
  const { gallery, isLoading } = useConvexState();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);

  // Derive categories dynamically from gallery data
  const GALLERY_CATEGORIES = ["All", ...new Set(gallery.map(item => item.category).filter(Boolean))];
  const filteredItems = activeCategory === "All"
    ? gallery
    : gallery.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="py-12 sm:py-16 bg-[var(--bg-main)] transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
            Visual Memories
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Campus <span className="accent-text">Sports Gallery</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            Moments capturing victories, intense training, award ceremonies, and sports day celebrations.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading || gallery.length === 0 ? (
          <GallerySkeleton />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="break-inside-avoid relative rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] group cursor-pointer card-hover"
              >
                <div className="img-zoom">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-sm pointer-events-none">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 pointer-events-none">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1E3A8A] text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5 drop-shadow-sm">{item.title}</h4>
                  {item.caption && (
                    <p className="text-xs text-slate-200 line-clamp-2 sm:line-clamp-1 mt-0.5 drop-shadow-sm">{item.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && gallery.length > 0 && filteredItems.length === 0 && (
          <div className="py-12 text-center space-y-3">
            <ImageIcon className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">No media in this category</p>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full glass-modal rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-color)] shadow-sm"
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
              <span className="text-xs font-bold text-[var(--secondary)] dark:text-blue-400 uppercase tracking-wider">{lightboxImage.category}</span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{lightboxImage.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
