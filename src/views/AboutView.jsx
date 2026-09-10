import React, { useEffect } from 'react';
import { Eye, Target, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
      
      {/* Unified Top Navbar */}
      <Navbar
        activeSection="about"
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-36 lg:pt-40 pb-6 sm:pb-8 space-y-6 sm:space-y-8">
        
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
              Established with a mandate to ignite athletic spirit, KiTS Sports Club serves as the premier governing body for all sports, fitness, and intra/inter-collegiate athletic activities at the Institute.
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

      {/* Unified Footer */}
      <Footer setActiveSection={() => handleBack()} />

    </div>
  );
}
