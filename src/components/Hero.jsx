import React, { useState, useEffect, useRef } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { tw } from '@/constants';

// Dynamically import all images from the Slideshow folder
const slideshowModules = import.meta.glob(
  [
    '/assets/images/Slideshow/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
    '/assets/Slideshow/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  ],
  { eager: true, import: 'default' }
);

// Sort images numerically so 1.jpg, 2.jpg, 3.png etc. play in exact sequential order
const SLIDESHOW_IMAGES = Object.entries(slideshowModules)
  .sort(([pathA], [pathB]) => {
    const filenameA = pathA.split('/').pop();
    const filenameB = pathB.split('/').pop();
    return filenameA.localeCompare(filenameB, undefined, { numeric: true, sensitivity: 'base' });
  })
  .map(([path, src]) => {
    const filename = path.split('/').pop().toLowerCase();
    let title = "KiTS Campus Athletics";
    if (filename.includes('jntuk')) title = "JNTUK Inter-University Representation";
    else if (filename.includes('cricket')) title = "Annual Cricket Championship";
    else if (filename.includes('volleyball')) title = "State Volleyball League";

    return {
      src,
      title,
      position: filename.includes('jntuk') ? '70% center' : 'center center',
    };
  });

// ==========================================
// SLIDESHOW CONFIGURATION
// Change slide display time here (in milliseconds):
// 3000 = 3 seconds | 4000 = 4 seconds | 5000 = 5 seconds
// ==========================================
const SLIDE_DURATION_MS = 8000;

export default function Hero({ onJoinClick, onExploreClick }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = SLIDESHOW_IMAGES;

  // Auto-advance slideshow based on SLIDE_DURATION_MS
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Handlers for Mobile Carousel Card
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const stats = [
    { label: "Active Athletes", value: "100+" },
    { label: "Championship Trophies", value: "75+" },
    { label: "Sports Disciplines", value: "9+" },
  ];
  const fallbackSlide = { src: '/hero_sports_banner.jpg', title: 'KiTS Campus Athletics', position: 'center center' };
  const activeSlides = slides.length > 0 ? slides : [fallbackSlide];
  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  return (
    <section
      id="home"
      className="relative min-h-0 sm:min-h-screen flex flex-col justify-start lg:justify-center overflow-hidden bg-[#041428] select-none text-white"
    >
      {/* DESKTOP VIEW: Full-Bleed Background Slideshow (lg and above - Shifted Downwards) */}
      <div className="hidden lg:block absolute inset-0 top-16 sm:top-20 lg:top-24 z-0 overflow-hidden pointer-events-none">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={slide.src}
                alt="KiTS Sports"
                style={{ objectPosition: slide.position }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          );
        })}

        {/* Very Light Transparent Layer */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 pt-36 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20">

        {/* DESKTOP LAYOUT (Left-Aligned Full-Bleed Content) */}
        <div className="hidden lg:block max-w-xl space-y-5">

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-hero font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-md">
              K<span className="text-red-500">i</span>TS
              <span className="block text-amber-400">Sports Club</span>
            </h1>
            <p className={`${tw`text-bodyLg`} text-slate-100 font-normal leading-relaxed max-w-md drop-shadow-md`}>
              Official Platform for Sports Registrations, Tournaments, Achievements, and Athletic Excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={onJoinClick}
              className={`px-6 py-3 rounded-xl ${tw`text-bodySm`} font-semibold text-white bg-transparent hover:bg-white/10 border border-white transition-all duration-200 flex items-center gap-2 backdrop-blur-sm active:scale-95 cursor-pointer`}
            >
              <span>Register Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreClick}
              className={`px-6 py-3 rounded-xl ${tw`text-bodySm`} font-semibold text-white bg-transparent hover:bg-white/10 border border-white transition-all duration-200 flex items-center gap-2 backdrop-blur-sm active:scale-95 cursor-pointer`}
            >
              <span>Explore Sports</span>
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Stats Row */}
          <div className="pt-8">
            <div className="flex items-center gap-8 sm:gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                    {stat.value}
                  </h3>
                  <p className={`${tw`text-bodySm`} font-semibold text-slate-300/90 tracking-wide`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* MOBILE & TABLET VIEW (Dedicated 16:9 Media Showcase Card) */}
        <div className="lg:hidden space-y-4 text-center">

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-hero font-extrabold tracking-tight leading-tight text-white">
              K<span className="text-red-500">i</span>TS <span className="text-amber-400">Sports Club</span>
            </h1>
            <p className={`${tw`text-bodyLg`} text-slate-300 font-normal max-w-md mx-auto`}>
              Official Platform for Sports Registrations, Tournaments, and Athletic Excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            <button
              onClick={onJoinClick}
              className={`px-5 py-2.5 rounded-lg ${tw`text-bodySm`} font-semibold text-white bg-transparent hover:bg-white/10 border border-white flex items-center gap-1.5 backdrop-blur-sm active:scale-95 cursor-pointer`}
            >
              <span>Register Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExploreClick}
              className={`px-5 py-2.5 rounded-lg ${tw`text-bodySm`} font-semibold text-white bg-transparent hover:bg-white/10 border border-white flex items-center gap-1.5 backdrop-blur-sm active:scale-95 cursor-pointer`}
            >
              <span>Explore Sports</span>
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile 16:9 Sports Media Card Carousel */}
          <div className="pt-2 max-w-xl mx-auto">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl select-none"
            >
              {/* Slides */}
              {activeSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                  <img
                    src={slide.src}
                    alt={slide.title}
                    style={{ objectPosition: slide.position }}
                    className="w-full h-full object-cover"
                  />
                  {/* Very Light Transparent Layer */}
                  <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                </div>
              ))}


            </div>
          </div>

          {/* Mobile Stats Row */}
          <div className="pt-4">
            <div className="flex justify-center items-center gap-6 sm:gap-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-sm">
                    {stat.value}
                  </h3>
                  <p className={`${tw`text-caption`} font-semibold text-slate-300/90 tracking-wide`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Grey Section Divider Line at Bottom of Hero */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="section-divider" />
      </div>
    </section>
  );
}


