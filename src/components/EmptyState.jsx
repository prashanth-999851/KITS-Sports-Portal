import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = "No Data Available Yet",
  description = "There are no records to display at this moment.",
  icon: Icon = Inbox
}) {
  return (
    <div className="py-12 px-4 text-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 animate-fadeIn">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
