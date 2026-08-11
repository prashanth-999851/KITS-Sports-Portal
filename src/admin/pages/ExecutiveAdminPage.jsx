import React, { useState } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { Sparkles, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

export default function ExecutiveAdminPage() {
  const { executiveBody } = useConvexState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Executive Body & Student Officers</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage student office bearers (President, Vice President, General Secretary, Treasurer, Coordinators).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {executiveBody.map((member, idx) => (
          <div key={idx} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 space-y-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-[var(--border-color)] shrink-0">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"; }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{member.name}</h3>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{member.position}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              {member.department}
            </div>

            {(member.email || member.phone) && (
              <div className="space-y-1 text-xs text-[var(--text-muted)]">
                {member.email && <p className="truncate">✉️ {member.email}</p>}
                {member.phone && <p>📞 {member.phone}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
