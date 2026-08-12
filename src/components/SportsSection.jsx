import React, { useState } from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { CardSkeleton } from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { MapPin, ArrowRight, Trophy } from 'lucide-react';

export default function SportsSection({ onRegisterSport }) {
  const { sports, isLoading } = useConvexState();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Outdoor", "Indoor", "Track & Field"];

  const filteredSports = selectedCategory === "All"
    ? sports
    : sports.filter(s => s.category.includes(selectedCategory));

  return (
    <section id="sports" className="py-20 bg-[var(--bg-main)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">11 Sports Disciplines</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Sports <span className="accent-text">Disciplines</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            From turf cricket grounds to indoor BWF wooden courts, discover our active sports disciplines, professional coaches, and captains.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Cards */}
        {isLoading ? (
          <CardSkeleton count={6} />
        ) : filteredSports.length === 0 ? (
          <EmptyState
            title="No Sports Disciplines Found"
            description="There are currently no active sports panels under this category."
            icon={Trophy}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sport) => (
            <div
              key={sport.id}
              className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between card-hover"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#1E3A8A] text-white">
                    {sport.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {sport.name}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {sport.description}
                  </p>

                  {/* Details */}
                  <div className="p-3 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Faculty Coordinator</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sport.coordinator}</span>
                    </div>
                    {sport.teamDetails?.menCaptain && (
                      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2">
                        <span className="text-[var(--text-muted)]">
                          {sport.teamDetails?.womenCaptain ? "Men Captain" : "Captain"}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">{sport.teamDetails.menCaptain}</span>
                      </div>
                    )}
                    {sport.teamDetails?.womenCaptain && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">
                          {sport.teamDetails?.menCaptain ? "Women Captain" : "Captain"}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">{sport.teamDetails.womenCaptain}</span>
                      </div>
                    )}
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{sport.teamDetails?.venue || 'Campus Sports Ground'}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => onRegisterSport(sport.name)}
                  className="w-full py-2.5 rounded-lg font-semibold text-xs bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors flex items-center justify-center gap-2"
                >
                  <span>Register for {sport.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
