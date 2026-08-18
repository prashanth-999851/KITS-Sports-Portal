import React, { useState, useEffect } from 'react';
import { useConvexState } from '../context/ConvexStateContext';

// Dynamically import all images from Slideshow2 / SlideShow2 folder
const slideshow2Modules = import.meta.glob(
  [
    '/assets/images/Slideshow2/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/images/SlideShow2/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}'
  ],
  { eager: true, import: 'default' }
);

const SLIDESHOW_IMAGES = Object.entries(slideshow2Modules).map(([path, src]) => {
  const filename = path.split('/').pop().replace(/\.[^/.]+$/, '');
  return {
    src,
    title: filename,
  };
});

const FALLBACK_SLIDE = {
  src: '/assets/images/Slideshow/volleyball-hd.jpg',
  title: 'KKR & KSR Athletics',
};

const CORE_VALUES = [
  {
    title: 'Discipline',
    description: 'Commitment to consistent practice, focus, and physical preparation.',
  },
  {
    title: 'Teamwork',
    description: 'Achieving victory together through trust, unity, and shared effort.',
  },
  {
    title: 'Integrity',
    description: 'Competing with honesty, fair play, and respect for all opponents.',
  },
  {
    title: 'Resilience',
    description: 'Overcoming setbacks with grit, composure, and determination.',
  },
  {
    title: 'Excellence',
    description: 'Striving for peak athletic and academic standards in every event.',
  },
  {
    title: 'Leadership',
    description: 'Setting high standards and inspiring others on and off the field.',
  },
];

export default function CoreValues() {
  const { coreValues: rawValues } = useConvexState();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const displayValues = (rawValues && rawValues.length === 6) ? rawValues : CORE_VALUES;
  const activeSlides = SLIDESHOW_IMAGES.length > 0 ? SLIDESHOW_IMAGES : [FALLBACK_SLIDE];

  // Auto-advance slideshow smoothly
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  return (
    <section id="values" className="py-8 sm:py-12 bg-[var(--bg-main)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2-Column Compact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Slideshow (Left on desktop, below text on mobile) */}
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6">
            <div className="relative rounded-none overflow-hidden shadow-lg border border-[var(--border-color)] group w-full aspect-[16/9] bg-slate-900 select-none">
              {activeSlides.map((slide, index) => {
                const isActive = index === currentSlideIndex;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.src}
                      alt={slide.title || 'KKR & KSR Athletics'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Values Text & Points (Right on desktop, above slideshow on mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 lg:pl-4 xl:pl-8 space-y-4">
            
            {/* Header Right */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
                Guiding Principles
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Our Core <span className="accent-text">Values</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-lg leading-relaxed">
                The fundamental principles that define our athletic character and team spirit.
              </p>
            </div>

            {/* 6 Minimal One-Line Bullet Points */}
            <ul className="space-y-2.5 pt-0.5">
              {displayValues.slice(0, 6).map((val, idx) => (
                <li
                  key={idx}
                  className="group flex items-center gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] transition-all duration-200 hover:translate-x-1.5 cursor-default"
                >
                  {/* Clean Bullet Dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] dark:bg-blue-400 shrink-0 group-hover:scale-125 transition-transform duration-200" />

                  {/* Minimal One-Line Text */}
                  <p className="leading-tight">
                    <strong className="font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] dark:group-hover:text-blue-400 transition-colors mr-1.5">
                      {val.title}:
                    </strong>
                    <span>{val.description}</span>
                  </p>
                </li>
              ))}
            </ul>

          </div>

        </div>

      </div>
    </section>
  );
}
