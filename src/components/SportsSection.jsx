import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import EmptyState from './EmptyState';
import { MapPin, ArrowRight, Trophy } from 'lucide-react';

function SportsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden animate-slideUp">
          <div className="h-52 skeleton-shimmer rounded-none" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 skeleton-shimmer" />
            <div className="h-3 w-full skeleton-shimmer" />
            <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] space-y-2">
              <div className="h-3 w-full skeleton-shimmer" />
              <div className="h-3 w-2/3 skeleton-shimmer" />
            </div>
            <div className="h-10 w-full skeleton-shimmer" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
            9+ Sports Disciplines
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Sports <span className="accent-text">Disciplines</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            From turf cricket grounds to indoor BWF wooden courts, discover our active sports disciplines, professional coaches, and captains.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/20'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] hover:shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Cards */}
        {isLoading ? (
          <SportsSkeleton />
        ) : filteredSports.length === 0 ? (
          <EmptyState
            title="No Sports Disciplines Found"
            description="There are currently no active sports panels under this category."
            icon={Trophy}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredSports.map((sport) => (
            <div
              key={sport.id}
              className="group rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between card-hover min-h-[460px] shadow-sm animate-slideUp"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-[var(--bg-card-subtle)] img-zoom">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#1E3A8A] text-white shadow-md tracking-wide uppercase">
                    {sport.category}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white drop-shadow-md">
                      {sport.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {sport.description}
                  </p>

                  {/* Details Box */}
                  <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Faculty Coordinator</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sport.coordinator}</span>
                    </div>
                    {sport.asstFacultyCoordinator && (
                      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2">
                        <span className="text-[var(--text-muted)]">Asst. Faculty Coordinator</span>
                        <span className="font-semibold text-[var(--text-primary)]">{sport.asstFacultyCoordinator}</span>
                      </div>
                    )}
                    {sport.teamDetails?.menCaptain && (
                      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2">
                        <span className="text-[var(--text-muted)]">
                          {sport.teamDetails?.womenCaptain ? "Men Captain" : "Captain"}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">{sport.teamDetails.menCaptain}</span>
                      </div>
                    )}
                    {sport.teamDetails?.womenCaptain && (
                      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2">
                        <span className="text-[var(--text-muted)]">
                          {sport.teamDetails?.menCaptain ? "Women Captain" : "Captain"}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">{sport.teamDetails.womenCaptain}</span>
                      </div>
                    )}
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{sport.teamDetails?.venue || 'Campus Sports Ground'}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                <button
                  onClick={() => onRegisterSport(sport.name)}
                  className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn"
                >
                  <span>Register for {sport.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
