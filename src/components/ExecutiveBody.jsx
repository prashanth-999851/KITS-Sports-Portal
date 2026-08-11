import React from 'react';
import { useConvexState } from '../context/ConvexStateContext';
import { Mail, Phone, Building } from 'lucide-react';

export default function ExecutiveBody() {
  const { executiveBody } = useConvexState();

  return (
    <section id="executive" className="py-20 bg-[var(--bg-card-subtle)] transition-colors border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Student Leadership</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Executive <span className="accent-text">Body</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Meet the student office bearers leading tournament organization, team logistics, player welfare, and institutional sports representation.
          </p>
        </div>

        {/* Leadership Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {executiveBody.map((member, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 flex flex-col justify-between card-hover"
            >
              <div className="space-y-4">
                {/* Photo & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card-subtle)]">
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
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
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
                  <div className="space-y-1.5 text-xs">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{member.phone}</span>
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
          ))}
        </div>

      </div>
    </section>
  );
}
