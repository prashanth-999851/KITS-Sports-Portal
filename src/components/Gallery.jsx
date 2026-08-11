import React, { useState } from 'react';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../data/mockData';
import { Image, Maximize2, X, Sparkles } from 'lucide-react';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);

  const filteredItems = activeCategory === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="py-20 bg-slate-900/40 dark:bg-slate-950/90 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Image className="w-3.5 h-3.5" />
            <span>Visual Memories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            CAMPUS <span className="gold-gradient-text">SPORTS GALLERY</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            High-definition moments capturing victories, intense training, award ceremonies, and sports day celebrations.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Image Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item)}
              className="break-inside-avoid relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 shadow-2xl group cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">
                  {item.category}
                </span>
                <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-white transition border border-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={lightboxImage.image}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase">{lightboxImage.category}</span>
              <h3 className="text-2xl font-bold text-white">{lightboxImage.title}</h3>
              <p className="text-sm text-slate-300">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
