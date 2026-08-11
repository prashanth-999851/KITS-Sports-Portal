import React from 'react';
import { EXECUTIVE_BODY } from '../data/mockData';
import { Mail, Phone, ShieldCheck, User, Sparkles, Building } from 'lucide-react';

export default function ExecutiveBody() {
  return (
    <section id="executive" className="py-20 bg-slate-50 dark:bg-slate-950/90 transition-colors border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Leadership</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            SPORTS CLUB <span className="gold-gradient-text">EXECUTIVE BODY</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Meet the student office bearers leading tournament organization, team logistics, player welfare, and institutional sports representation.
          </p>
        </div>

        {/* Executive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXECUTIVE_BODY.map((member, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-lg p-6 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Photo & Badge */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg group-hover:scale-105 transition-transform bg-slate-950">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
                      }}
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {member.badge}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors mt-1">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {member.position}
                    </p>
                  </div>
                </div>

                {/* Department Info */}
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <Building className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{member.department}</span>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-2 text-xs">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                  >
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span className="truncate">{member.email}</span>
                  </a>

                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                  >
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>{member.phone}</span>
                  </a>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>KKR & KSR Executive Council</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
