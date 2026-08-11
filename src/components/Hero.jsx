import React from 'react';
import { Trophy, Users, Activity, Flame, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { SPORTS_LIST } from '../data/mockData';

export default function Hero({ onJoinClick, onExploreClick }) {
  const stats = [
    { label: "Active Athletes", value: "1,500+", icon: Users, desc: "Students in daily practice" },
    { label: "Championship Trophies", value: "45+", icon: Trophy, desc: "University & State Medals" },
    { label: "Sports Disciplines", value: "11", icon: Activity, desc: "Indoor & Outdoor Arenas" },
    { label: "Annual Events", value: "25+", icon: Flame, desc: "Inter & Intra College Meets" }
  ];

  return (
    <section id="home" className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero_sports_banner.jpg" 
          alt="KKR & KSR Sports Collage" 
          className="w-full h-full object-cover object-center opacity-35 scale-105 animate-pulse duration-[10000ms]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950/90" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg shadow-amber-500/10 animate-bounce">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Sports Portal • KKR & KSR Institute</span>
          </div>

          {/* Title Header */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
              KKR & KSR <br />
              <span className="gold-gradient-text">SPORTS CLUB</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-amber-400/90 italic tracking-wide">
              "Building Champions Through Discipline, Teamwork and Excellence"
            </p>
          </div>

          {/* Narrative Paragraph */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the beating heart of sports culture, leadership, and athletic dominance at KKR & KSR Institute. We foster high-performance training, state-of-the-art facilities, and unwavering sportsmanship across 11 major sports disciplines.
          </p>

          {/* CTA Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onJoinClick}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span>Join Club Membership</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400 hover:bg-slate-800 transition-all duration-300 flex items-center gap-2 backdrop-blur-md"
            >
              <span>Explore All 11 Sports</span>
              <Award className="w-4 h-4 text-amber-400" />
            </button>
          </div>

        </div>

        {/* Live Stats Counter Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 backdrop-blur-md transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white gold-gradient-text">
                      {stat.value}
                    </h3>
                    <p className="text-xs font-semibold text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infinite Horizontal Sports Ticker */}
      <div className="relative z-10 bg-slate-900/95 border-t border-slate-800 py-3.5 overflow-hidden">
        <div className="animate-ticker space-x-6">
          {[...SPORTS_LIST, ...SPORTS_LIST].map((sport, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-amber-500/20 text-xs font-semibold text-slate-200 hover:text-amber-400 transition cursor-pointer"
            >
              <span className="text-base">{sport.icon}</span>
              <span>{sport.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 font-bold uppercase">{sport.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
