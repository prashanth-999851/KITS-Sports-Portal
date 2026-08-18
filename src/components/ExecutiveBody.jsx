import React from 'react';
import { useConvexState } from '../context/ConvexStateContext';

function ExecutiveSkeleton() {
  return (
    <div className="space-y-10">
      {/* Tier 1 Skeleton (Top Head) */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center text-center space-y-2.5 w-36 sm:w-48">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full skeleton-shimmer ring-4 ring-slate-100" />
          <div className="space-y-1 w-full flex flex-col items-center">
            <div className="h-3.5 w-3/4 skeleton-shimmer rounded" />
            <div className="h-2.5 w-1/2 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>

      {/* Tier 2 Skeleton (2 in a row on mobile) */}
      <div className="flex justify-center gap-4 sm:gap-10 md:gap-16">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center text-center space-y-2.5 w-36 sm:w-48">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full skeleton-shimmer ring-4 ring-slate-100" />
            <div className="space-y-1 w-full flex flex-col items-center">
              <div className="h-3.5 w-3/4 skeleton-shimmer rounded" />
              <div className="h-2.5 w-1/2 skeleton-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member, isTopTier = false }) {
  return (
    <div className="group flex flex-col items-center text-center space-y-2.5 sm:space-y-3 w-36 sm:w-48 md:w-52 animate-slideUp cursor-default">
      {/* Circular Portrait Frame */}
      <div className="relative">
        <div className={`rounded-full p-1 sm:p-1.5 bg-white border-2 border-slate-200 shadow-md group-hover:border-[#0b2e5b] group-hover:shadow-lg transition-all duration-300 ${
          isTopTier 
            ? 'w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48' 
            : 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44'
        }`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";
              }}
            />
          </div>
        </div>
      </div>

      {/* Name & Designation Only */}
      <div className="space-y-0.5 sm:space-y-1 max-w-full px-1">
        <h3 className={`font-bold text-[#0b2e5b] leading-snug group-hover:text-[#0d3a73] transition-colors ${
          isTopTier ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm md:text-base'
        }`}>
          {member.name}
        </h3>
        <p className="text-[10.5px] sm:text-xs font-semibold text-slate-600 leading-tight">
          {member.position}
        </p>
      </div>
    </div>
  );
}

export default function ExecutiveBody() {
  const { executiveBody = [], isLoading } = useConvexState();

  // 1. Separate College Management / Heads and Student Leads
  const managementMembers = executiveBody
    .filter(m => !m.memberType || m.memberType === 'Executive Body' || m.memberType === 'College Head' || m.memberType === 'Management' || m.memberType === 'Faculty')
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  const studentLeads = executiveBody
    .filter(m => m.memberType === 'Student Officer' || m.memberType === 'Student Lead' || m.memberType === 'Student Leadership')
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  // 2. Pyramid Tiers for Management Heads:
  // - Tier 1: 1 Top Management Head (Chairman/Patron, Centered Single)
  // - Tier 2: Next Management Members (2 in a row on mobile, Centered)
  const tier1 = managementMembers.length > 0 ? [managementMembers[0]] : [];
  const tier2 = managementMembers.length > 1 ? managementMembers.slice(1) : [];

  return (
    <section id="executive" className="py-12 sm:py-16 bg-slate-50/70 transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b2e5b]">
            Institutional Leadership
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Executive <span className="accent-text">Body</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Meet the distinguished institutional leadership guiding the sports directorate and athletic development at KKR & KSR Institute of Technology and Sciences.
          </p>
        </div>

        {isLoading ? (
          <ExecutiveSkeleton />
        ) : managementMembers.length === 0 && studentLeads.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No executive members listed currently.
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            
            {/* MANAGEMENT PYRAMID STRUCTURE */}
            <div className="space-y-8 sm:space-y-10">
              
              {/* Tier 1: Top Management Head (Chairman, Centered Solo) */}
              {tier1.length > 0 && (
                <div className="flex justify-center items-center">
                  {tier1.map((member) => (
                    <MemberCard key={member.id} member={member} isTopTier={true} />
                  ))}
                </div>
              )}

              {/* Tier 2: Next Management Members (2 Members in a row on Mobile & Desktop) */}
              {tier2.length > 0 && (
                <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-10 md:gap-16 lg:gap-20 max-w-sm sm:max-w-none mx-auto pt-2">
                  {tier2.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              )}

            </div>

            {/* TIER 3: STUDENT LEADS (2 Members in a row on Mobile & Desktop) */}
            {studentLeads.length > 0 && (
              <div className="pt-10 border-t border-slate-200/80 space-y-6">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Student Leads
                  </h3>
                </div>

                {/* 2 Student Leads in a Row on Mobile */}
                <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-10 md:gap-16 lg:gap-20 max-w-sm sm:max-w-none mx-auto">
                  {studentLeads.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
