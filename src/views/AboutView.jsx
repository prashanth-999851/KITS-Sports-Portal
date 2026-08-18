import React, { useEffect } from 'react';
import { Eye, Target, CheckCircle2, Sparkles, ArrowLeft, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutView({ onBack }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const missionPoints = [
    "Promote active sports participation across all engineering & management departments.",
    "Provide professional coaching, tactical training, and strength conditioning opportunities.",
    "Develop discipline, physical resilience, and leadership qualities in student athletes.",
    "Conduct inter-departmental tournaments, intra-mural leagues, and fitness drives.",
    "Identify, mentor, and support talented student athletes for university & state meets.",
    "Maintain world-class sports infrastructure, turf grounds, and indoor stadiums.",
    "Ensure total fairness, transparency, and gender inclusiveness in all sports selections."
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              aria-label="Back to Portal Home"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="KITS Logo" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[#0b2e5b] leading-tight truncate">
                  About Sports Directorate
                </h1>
                <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                  Governance & Infrastructure Overview • KKR & KSR Institute
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden md:inline">Accredited by JNTUK & State Sports Council</span>
          </div>

        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0b2e5b] text-white p-6 sm:p-10 shadow-md">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-block px-2.5 py-1 rounded bg-white/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Sports Directorate Overview
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Empowering Athletic Excellence & Student Leadership
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              Established with a mandate to ignite athletic spirit, KKR & KSR Sports Club serves as the premier governing body for all sports, fitness, and intra/inter-collegiate athletic activities at the Institute.
            </p>
          </div>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Vision Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-[#0b2e5b]">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Our Vision</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Strategic Horizon</p>
                </div>
              </div>
              <blockquote className="text-slate-600 text-xs sm:text-sm italic leading-relaxed border-l-4 border-[#0b2e5b] pl-4 py-2 bg-slate-50 rounded-r-lg">
                "To foster a dynamic and inclusive sports culture that inspires students to achieve excellence in sports, physical fitness, leadership, and teamwork while proudly representing the Institute at Intercollegiate, University, State, and National Levels."
              </blockquote>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Approved by Institute Academic & Executive Council</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Our Mission</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Core Pillars</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {missionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </main>

      {/* Footer Back Bar */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KKR & KSR Institute of Technology & Sciences — Sports Directorate</p>
          <button
            onClick={handleBack}
            className="text-[#0b2e5b] hover:underline font-bold cursor-pointer"
          >
            ← Return to Main Portal Homepage
          </button>
        </div>
      </footer>

    </div>
  );
}
