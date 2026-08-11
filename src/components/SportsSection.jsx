import React, { useState } from 'react';
import { SPORTS_LIST } from '../data/mockData';
import { Trophy, Calendar, MapPin, User, ShieldAlert, Award, ArrowRight, Sparkles } from 'lucide-react';

export default function SportsSection({ onRegisterSport }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Outdoor", "Indoor", "Track & Field"];

  const filteredSports = selectedCategory === "All"
    ? SPORTS_LIST
    : SPORTS_LIST.filter(s => s.category.includes(selectedCategory));

  return (
    <section id="sports" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>11 Sports Disciplines</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            EXPLORE OUR <span className="gold-gradient-text">SPORTS PANELS</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            From turf cricket grounds to indoor BWF wooden courts, discover our 11 active sports disciplines, professional coaches, captains, and championship achievements.
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 11 Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSports.map((sport) => (
            <div
              key={sport.id}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2"
            >
              <div>
                {/* Image Header with Badge */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                      {sport.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{sport.name}</span>
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {sport.description}
                  </p>

                  {/* Coordinators & Captains */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty Coordinator:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-right">{sport.coordinator}</span>
                    </div>
                    {sport.assistantCoordinator && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Asst. Faculty Coordinator:</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-right">{sport.assistantCoordinator}</span>
                      </div>
                    )}
                    {sport.teamDetails.menCaptain && (
                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {sport.teamDetails.womenCaptain ? "Men Captain:" : "Captain:"}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{sport.teamDetails.menCaptain}</span>
                      </div>
                    )}
                    {sport.teamDetails.womenCaptain && (
                      <div className={`flex items-center justify-between ${!sport.teamDetails.menCaptain ? "border-t border-slate-200 dark:border-slate-800/80 pt-2" : ""}`}>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {sport.teamDetails.menCaptain ? "Women Captain:" : "Captain:"}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{sport.teamDetails.womenCaptain}</span>
                      </div>
                    )}
                  </div>

                  {/* Venue */}
                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sport.teamDetails.venue}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onRegisterSport(sport.name)}
                  className="w-full py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span>Register for {sport.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
