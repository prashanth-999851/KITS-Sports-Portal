import React from 'react';
import { Trophy, Users, Activity, Flame, ChevronRight, Award } from 'lucide-react';

export default function Hero({ onJoinClick, onExploreClick }) {
  const stats = [
    { label: "Active Athletes", value: "1,500+", icon: Users },
    { label: "Championship Trophies", value: "45+", icon: Trophy },
    { label: "Sports Disciplines", value: "11", icon: Activity },
    { label: "Annual Events", value: "25+", icon: Flame }
  ];

  return (
    <section id="home" className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Background Image with Navy Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero_sports_banner.jpg" 
          alt="KITS Sports" 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80";
          }}
        />
        <div className="absolute inset-0 bg-[#0F172A]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl space-y-6">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white/90 text-xs font-medium tracking-wide">
            <Award className="w-3.5 h-3.5" />
            <span>Official Sports Portal • KKR & KSR Institute of Technology & Sciences</span>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              KITS Sports Club Portal
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              Official Platform for Sports Registrations, Tournaments, Achievements, and Athletic Excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onJoinClick}
              className="px-6 py-3 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>Register Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
            >
              <span>Explore Sports</span>
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
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
    </section>
  );
}
