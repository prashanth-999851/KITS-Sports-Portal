import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Users, Activity, ChevronRight } from 'lucide-react';

// Dynamically import all images from the Slideshow folder
const slideshowModules = import.meta.glob(
  '/assets/images/Slideshow/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);

const SLIDESHOW_IMAGES = Object.entries(slideshowModules).map(([path, src]) => {
  const filename = path.split('/').pop().toLowerCase();
  let title = "KKR & KSR Campus Athletics";
  if (filename.includes('jntuk')) title = "JNTUK Inter-University Representation";
  else if (filename.includes('cricket')) title = "Annual Cricket Championship";
  else if (filename.includes('volleyball')) title = "State Volleyball League";

  return {
    src,
    title,
    position: filename.includes('jntuk') ? '70% center' : 'center center',
  };
});

export default function Hero({ onJoinClick, onExploreClick }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = SLIDESHOW_IMAGES;

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
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
    { label: "Active Athletes", value: "100+", icon: Users },
    { label: "Championship Trophies", value: "75+", icon: Trophy },
    { label: "Sports Disciplines", value: "9+", icon: Activity },
  ];
  const fallbackSlide = { src: '/hero_sports_banner.jpg', title: 'KKR & KSR Campus Athletics', position: 'center center' };
  const activeSlides = slides.length > 0 ? slides : [fallbackSlide];
  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  return (
    <section
      id="home"
      className="relative min-h-0 sm:min-h-screen flex flex-col justify-start lg:justify-center overflow-hidden bg-[#0A0F1D] select-none text-white"
    >
      {/* DESKTOP VIEW: Full-Bleed Background Slideshow (lg and above) */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
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
                alt="KKR & KSR Sports"
                style={{ objectPosition: slide.position }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          );
        })}

        {/* Contrast Overlays for Desktop */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D1B]/90 via-[#0A1227]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D]/90 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20">

        {/* DESKTOP LAYOUT (Left-Aligned Full-Bleed Content) */}
        <div className="hidden lg:block max-w-xl space-y-5">

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.15] text-white">
              KKR & KSR
              <span className="block text-amber-400">Sports Club</span>
            </h1>
            <p className="text-base text-slate-300/90 font-normal leading-relaxed max-w-md">
              Official Platform for Sports Registrations, Tournaments, Achievements, and Athletic Excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={onJoinClick}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>Register Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-all duration-200 flex items-center gap-2 backdrop-blur-sm active:scale-95 cursor-pointer"
            >
              <span>Explore Sports</span>
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Stats Row */}
          <div className="pt-8">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-white">
                          {stat.value}
                        </h3>
                        <p className="text-xs font-medium text-slate-400">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* MOBILE & TABLET VIEW (Dedicated 16:9 Media Showcase Card) */}
        <div className="lg:hidden space-y-4 text-center">

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              KKR & KSR <span className="text-amber-400">Sports Club</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-md mx-auto">
              Official Platform for Sports Registrations, Tournaments, and Athletic Excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            <button
              onClick={onJoinClick}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-900 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Register Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white border border-white/20 bg-white/5 flex items-center gap-1.5 backdrop-blur-sm active:scale-95"
            >
              <span>Explore Sports</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              ))}

              {/* Bottom Caption Badge */}
              {currentSlide && (
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
                  <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-left">
                    <span className="text-[9px] font-bold text-amber-400 uppercase block">Featured Showcase</span>
                    <h4 className="text-xs font-bold text-white truncate">{currentSlide.title}</h4>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Stats Row */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-left"
                  >
                    <div className="p-1 rounded bg-amber-500/15 text-amber-400 w-fit mb-1">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {stat.value}
                    </h3>
                    <p className="text-[9px] font-medium text-slate-400 truncate">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
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


