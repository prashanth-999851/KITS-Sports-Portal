import React from 'react';
import { Eye, Target, CheckCircle2, Sparkles, ArrowLeft, Building, Trophy, Users, Shield, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutView({ onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const missionPoints = [
    "Promote active participation in sports across all engineering & management departments.",
    "Provide professional coaching, tactical training, and strength conditioning opportunities.",
    "Develop discipline, physical resilience, and leadership qualities in student athletes.",
    "Conduct inter-departmental tournaments, intra-mural leagues, and fitness drives.",
    "Identify, mentor, and financially support talented student athletes for state/national meets.",
    "Maintain world-class sports infrastructure, turf grounds, and indoor stadiums.",
    "Ensure total fairness, transparency, and gender inclusiveness in all sports selections."
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-[var(--border-color)]" />

            <div className="flex items-center gap-2.5">
              <img src="/assets/images/logo.png" alt="KITS Logo" className="w-8 h-8 rounded-md border border-[var(--border-color)]" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100"; }} />
              <div>
                <h1 className="text-sm font-bold text-[var(--text-primary)] leading-none">
                  About KKR & KSR Sports Directorate
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Official Athletic Governance & Infrastructure Overview
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Accredited by JNTUK & State Sports Council</span>
          </div>

        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        
        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0F172A] text-white p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Empowering Athletic Excellence & Leadership
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Established with a mandate to ignite athletic spirit, KKR & KSR Sports Club serves as the premier governing body for all sports, fitness, and intra/inter-collegiate athletic activities at the Institute.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 hidden lg:block overflow-hidden pointer-events-none">
            <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80" alt="Sports" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Vision Card */}
          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  <Eye className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Our Vision</h3>
                  <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Strategic Horizon</p>
                </div>
              </div>
              <blockquote className="text-[var(--text-secondary)] text-sm italic leading-relaxed border-l-4 border-blue-600 dark:border-blue-400 pl-4 py-2 bg-[var(--bg-card-subtle)] rounded-r-lg">
                "To foster a dynamic and inclusive sports culture that inspires students to achieve excellence in sports, physical fitness, leadership, and teamwork while proudly representing the Institute at Intercollegiate, University, State, and National Levels."
              </blockquote>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold pt-4 border-t border-[var(--border-color)]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Approved by Institute Academic & Executive Council</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Our Mission</h3>
                <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Core Pillars</p>
              </div>
            </div>
            <ul className="space-y-3">
              {missionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </main>

      {/* Footer Back Bar */}
      <footer className="mt-16 bg-[var(--bg-card)] border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Sports Directorate</p>
          <button
            onClick={handleBack}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>

    </div>
  );
}
