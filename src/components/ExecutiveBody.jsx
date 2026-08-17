import React from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Mail, Phone, Building } from 'lucide-react';

function ExecutiveSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4 animate-slideUp">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 skeleton-shimmer" />
              <div className="h-3 w-1/2 skeleton-shimmer" />
            </div>
          </div>
          <div className="h-10 w-full skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-3 w-full skeleton-shimmer" />
            <div className="h-3 w-2/3 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExecutiveBody() {
  const { executiveBody, isLoading } = useConvexState();

  return (
    <section id="executive" className="py-12 sm:py-16 bg-[var(--bg-card-subtle)] transition-colors">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)] dark:text-blue-400">
            Student Leadership
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] section-accent">
            Executive <span className="accent-text">Body</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-2">
            Meet the student office bearers leading tournament organization, team logistics, player welfare, and institutional sports representation.
          </p>
        </div>

        {/* Leadership Cards */}
        {isLoading ? (
          <ExecutiveSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {executiveBody.map((member, idx) => (
            <div
              key={idx}
              className="group rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden card-hover animate-slideUp"
            >
              {/* Accent Top Bar */}
              <div className="h-1 bg-gradient-to-r from-[#1E3A8A] via-blue-500 to-amber-500" />
              
              <div className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--secondary)] dark:group-hover:border-blue-400 transition-colors bg-[var(--bg-card-subtle)] shadow-sm">
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
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)] dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </h3>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {member.position}
                      </span>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
                    <Building className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span>{member.department}</span>
                  </div>

                  {/* Contact */}
                  {(member.email || member.phone) && (
                    <div className="space-y-2 text-xs">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--secondary)] dark:hover:text-blue-400 transition-colors group/link"
                        >
                          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-500/10">
                            <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="truncate group-hover/link:underline">{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--secondary)] dark:hover:text-blue-400 transition-colors group/link"
                        >
                          <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10">
                            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="group-hover/link:underline">{member.phone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-medium">
                  KKR & KSR Student Sports Council
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </section>
  );
}
