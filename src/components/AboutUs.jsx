import React from 'react';
import { Eye, Target, CheckCircle2, Sparkles } from 'lucide-react';

export default function AboutUs() {
  const missionPoints = [
    "Promote active participation in sports across all engineering & management departments.",
    "Provide professional coaching, tactical training, and strength conditioning opportunities.",
    "Develop discipline, physical resilience, and leadership qualities in student athletes.",
    "Conduct inter-departmental tournaments, intra-mural leagues, and fitness drives.",
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
    <section id="about" className="py-20 bg-[var(--bg-main)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Institute Sports Legacy</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            About <span className="accent-text">KKR & KSR Sports Club</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Established with a mandate to ignite athletic spirit and sporting excellence, KKR & KSR Sports Club serves as the premier governing body for all sports, fitness, and intra/inter-collegiate athletic activities at the Institute.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Vision */}
          <div className="p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Our Vision</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Strategic Horizon</p>
              </div>
            </div>
            <blockquote className="text-[var(--text-secondary)] text-sm italic leading-relaxed border-l-3 border-blue-600 dark:border-blue-400 pl-4 py-1">
              "To foster a dynamic and inclusive sports culture that inspires students to achieve excellence in sports, physical fitness, leadership, and teamwork while proudly representing the Institute at Intercollegiate, University, State, and National Levels."
            </blockquote>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Approved by Institute Academic & Executive Council</span>
            </div>
          </div>

          {/* Mission */}
          <div className="p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Our Mission</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Core Pillars</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {missionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[var(--text-secondary)] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Facilities */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border-color)] pb-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">World-Class Sports Facilities</h3>
              <p className="text-[var(--text-muted)] text-xs">State-of-the-art infrastructure spread over 15 acres of dedicated sports complex.</p>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-500/10">
              6 Major Venues
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((fac, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 card-hover">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{fac.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
