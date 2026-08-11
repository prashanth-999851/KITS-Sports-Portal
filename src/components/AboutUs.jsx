import React from 'react';
import { Eye, Target, CheckCircle2, Shield, Award, Landmark, Sparkles } from 'lucide-react';

export default function AboutUs() {
  const missionPoints = [
    "Promote active participation in sports across all engineering & management departments.",
    "Provide professional coaching, tactical training, and strength conditioning opportunities.",
    "Develop discipline, physical resilience, and leadership qualities in student athletes.",
    "Conduct inter-departmental tournaments, intra-mural leagues, and fitness fitness drives.",
    "Identify, mentor, and financially support talented student athletes for state/national meets.",
    "Maintain world-class sports infrastructure, turf grounds, and indoor stadiums.",
    "Ensure total fairness, transparency, and gender inclusiveness in all sports selections."
  ];

  const facilities = [
    { title: "Turf Oval Cricket Ground", desc: "60-meter boundary turf pitch with automated bowling machines and net practice bays." },
    { title: "FIFA Standard Football Pitch", desc: "Natural grass pitch with professional floodlighting for day & night championship matches." },
    { title: "Indoor Wooden Badminton Stadium", desc: "4 BWF certified wooden courts with LED glare-free sports lighting." },
    { title: "Synthetic Acrylic Basketball Court", desc: "FIBA standard acrylic court surface with shock absorption and hydraulic hoops." },
    { title: "400m Synthetic Athletic Track", desc: "8-lane standard synthetic track with dedicated jump pits and throwing circles." },
    { title: "Fitness & High-Performance Gym", desc: "State-of-the-art strength training equipment, power racks, and sports physiotherapist." }
  ];

  return (
    <section id="about" className="py-20 bg-slate-50 dark:bg-slate-950/90 transition-colors border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Landmark className="w-3.5 h-3.5" />
            <span>Institute Sports Legacy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            ABOUT <span className="gold-gradient-text">KKR & KSR SPORTS CLUB</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Established with a mandate to ignite athletic spirit and sporting excellence, KKR & KSR Sports Club serves as the premier governing body for all sports, fitness, and intra/inter-collegiate athletic activities at the Institute.
          </p>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Vision Card */}
          <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl space-y-6 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
            
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">OUR VISION</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold tracking-wider uppercase">Strategic Horizon</p>
              </div>
            </div>

            <blockquote className="text-slate-800 dark:text-slate-200 text-base sm:text-lg italic font-medium leading-relaxed border-l-4 border-amber-500 pl-4 py-1">
              "To foster a dynamic and inclusive sports culture that inspires students to achieve excellence in sports, physical fitness, leadership, and teamwork while proudly representing the Institute at Intercollegiate, University, State, and National Levels."
            </blockquote>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Approved by Institute Academic & Executive Council</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">OUR MISSION</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold tracking-wider uppercase">Core Pillars</p>
              </div>
            </div>

            <ul className="space-y-3">
              {missionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Facilities Spotlight */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">World-Class Sports Facilities</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">State-of-the-art infrastructure spread over 15 acres of dedicated sports complex.</p>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              Floodlit Arenas & Equipment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-md">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase mb-2">
                  <Award className="w-4 h-4" />
                  <span>Facility #{i + 1}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{fac.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
