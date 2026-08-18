import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import EmptyState from './EmptyState';
import { MapPin, ArrowRight, Trophy } from 'lucide-react';

function SportsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="rounded-xl bg-white border border-slate-200 overflow-hidden animate-slideUp shadow-sm flex flex-col h-full">
          <div className="h-56 sm:h-52 md:h-48 lg:h-44 skeleton-shimmer rounded-none shrink-0" />
          <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
            <div className="space-y-2 min-h-[82px] flex flex-col justify-center">
              <div className="flex justify-between">
                <div className="h-3 w-1/3 skeleton-shimmer" />
                <div className="h-3 w-1/2 skeleton-shimmer" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-1/4 skeleton-shimmer" />
                <div className="h-3 w-1/3 skeleton-shimmer" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-1/3 skeleton-shimmer" />
                <div className="h-3 w-1/4 skeleton-shimmer" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
              <div className="h-3 w-1/3 skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SportsSection({ onRegisterSport }) {
  const { sports, isLoading } = useConvexState();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Outdoor", "Indoor", "Track & Field"];

  const filteredSports = selectedCategory === "All"
    ? sports
    : sports.filter(s => s.category.includes(selectedCategory));

  return (
    <section id="sports" className="py-12 sm:py-16 bg-[var(--bg-main)] transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-9">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2e5b]">
            9+ Sports Disciplines
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Sports <span className="accent-text">Disciplines</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed pt-1 max-w-2xl mx-auto">
            From turf cricket grounds to indoor BWF wooden courts, discover our active sports disciplines, professional coaches, and captains.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0b2e5b] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-[#0b2e5b] hover:shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards per Row Grid */}
        {isLoading ? (
          <SportsSkeleton />
        ) : filteredSports.length === 0 ? (
          <EmptyState
            title="No Sports Disciplines Found"
            description="There are currently no active sports panels under this category."
            icon={Trophy}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children items-stretch">
            {filteredSports.map((sport) => (
              <div
                key={sport.id}
                className="group rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between card-hover shadow-sm animate-slideUp transition-all duration-200 hover:shadow-md hover:border-slate-300 h-full"
              >
                {/* 1st Half: Sports Image Banner (Taller on Mobile) */}
                <div className="relative h-56 sm:h-52 md:h-48 lg:h-44 overflow-hidden bg-slate-100 img-zoom shrink-0">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#0b2e5b]/90 backdrop-blur-sm text-white shadow-sm tracking-wide uppercase">
                    {sport.category}
                  </span>

                  {/* Sport Title */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5">
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-md leading-tight">
                      {sport.name}
                    </h3>
                  </div>
                </div>

                {/* 2nd Half: Compact, Clean White Content Area (Flex-1 & Pinned Bottom) */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-3">
                  
                  {/* Details Area with consistent fixed baseline height for 3 or 4 fields */}
                  <div className="space-y-1.5 text-[11px] min-h-[82px] flex flex-col justify-center">
                    <div className="flex items-center justify-between text-slate-700 gap-1">
                      <span className="text-slate-400 font-medium">Coordinator:</span>
                      <span className="font-bold text-[#0b2e5b] truncate text-right">{sport.coordinator}</span>
                    </div>
                    
                    {sport.asstFacultyCoordinator && (
                      <div className="flex items-center justify-between text-slate-700 gap-1">
                        <span className="text-slate-400 font-medium">Asst. Coord:</span>
                        <span className="font-semibold text-slate-700 truncate text-right">{sport.asstFacultyCoordinator}</span>
                      </div>
                    )}
                    
                    {sport.teamDetails?.menCaptain && (
                      <div className="flex items-center justify-between text-slate-700 gap-1">
                        <span className="text-slate-400 font-medium">
                          {sport.teamDetails?.womenCaptain ? "Men Capt:" : "Captain:"}
                        </span>
                        <span className="font-semibold text-slate-800 truncate text-right">{sport.teamDetails.menCaptain}</span>
                      </div>
                    )}
                    
                    {sport.teamDetails?.womenCaptain && (
                      <div className="flex items-center justify-between text-slate-700 gap-1">
                        <span className="text-slate-400 font-medium">
                          {sport.teamDetails?.menCaptain ? "Women Capt:" : "Captain:"}
                        </span>
                        <span className="font-semibold text-slate-800 truncate text-right">{sport.teamDetails.womenCaptain}</span>
                      </div>
                    )}
                  </div>

                  {/* Venue & Register Action Row (Aligned horizontally across all cards) */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2 mt-auto">
                    <div className="flex items-center gap-1 text-[10.5px] text-slate-500 min-w-0">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">{sport.teamDetails?.venue || 'Campus Sports Ground'}</span>
                    </div>

                    <button
                      onClick={() => onRegisterSport(sport.name)}
                      className="px-3.5 py-1 rounded-full font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm flex items-center gap-1 shrink-0 group/btn cursor-pointer active:scale-95"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
