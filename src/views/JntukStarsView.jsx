import React, { useEffect } from 'react';
import JntukPlayersSection from '../components/JntukPlayersSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useConvexState } from '../context/ConvexStateContext';
import { ShieldCheck, Trophy } from 'lucide-react';

function JntukPlayersPageSkeleton() {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0b2e5b] text-xs font-bold uppercase tracking-widest shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#0b2e5b]" />
            <span>Inter-University Athletic Honors</span>
          </div>
          <div className="h-9 bg-slate-200 rounded-xl w-80 mx-auto animate-pulse" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="h-3.5 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-3.5 bg-slate-200 rounded w-4/5 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Loading Status Banner */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
            <Trophy className="w-4 h-4 text-amber-500 absolute" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#0b2e5b]">Loading JNTUK Athletes</p>
            <p className="text-xs text-slate-400 animate-pulse">Fetching university representation records...</p>
          </div>
        </div>

        {/* Year Tabs Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`px-6 py-2.5 rounded-xl animate-pulse ${
              i === 0 ? 'bg-[#0b2e5b]/20 w-36' : 'bg-slate-100 w-28'
            }`} />
          ))}
        </div>

        {/* Filter Bar Skeleton */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-2 rounded-lg bg-slate-100 animate-pulse w-20 h-8" />
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-36 h-9 rounded-xl bg-slate-100 animate-pulse" />
            <div className="w-52 h-9 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Player Cards Skeleton - Diamond Crest Style */}
        <div className="flex flex-wrap justify-center items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16 max-w-6xl mx-auto pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Diamond Avatar Skeleton */}
              <div className="w-24 h-24 rounded-2xl bg-slate-200 rotate-45 border-2 border-slate-300 shadow-md" />
              {/* Name Skeleton */}
              <div className="h-3.5 bg-slate-200 rounded w-24 mt-2" />
              {/* Sport Badge Skeleton */}
              <div className="h-5 bg-slate-100 rounded-full w-16 border border-slate-200" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function JntukStarsView() {
  const navigate = useNavigate();
  const { isLoadingJntukPlayers } = useConvexState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col transition-colors duration-300">
      
      {/* Unified Top Navbar */}
      <Navbar
        activeSection="jntuk-players"
        onOpenMembership={() => navigate('/register')}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-24 lg:pt-28">
        {isLoadingJntukPlayers ? <JntukPlayersPageSkeleton /> : <JntukPlayersSection />}
      </main>

      {/* Footer */}
      <Footer setActiveSection={() => navigate('/')} />

    </div>
  );
}
