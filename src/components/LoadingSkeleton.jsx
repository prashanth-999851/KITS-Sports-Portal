import React from 'react';
import { Loader2, Trophy } from 'lucide-react';

export function LoadingSpinner({ text = "Loading data from portal..." }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
        <Trophy className="w-5 h-5 text-amber-500 absolute" />
      </div>
      <p className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">{text}</p>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 space-y-4 animate-pulse"
        >
          <div className="h-40 rounded-lg bg-[var(--bg-card-subtle)]" />
          <div className="space-y-2">
            <div className="h-4 bg-[var(--bg-card-subtle)] rounded w-3/4" />
            <div className="h-3 bg-[var(--bg-card-subtle)] rounded w-full" />
            <div className="h-3 bg-[var(--bg-card-subtle)] rounded w-5/6" />
          </div>
          <div className="h-9 bg-[var(--bg-card-subtle)] rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-12 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] animate-pulse flex items-center px-4 justify-between"
        >
          <div className="h-3 bg-[var(--bg-card)] rounded w-1/4" />
          <div className="h-3 bg-[var(--bg-card)] rounded w-1/6" />
          <div className="h-3 bg-[var(--bg-card)] rounded w-1/5" />
          <div className="h-6 bg-[var(--bg-card)] rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function ButtonSpinner({ text = "Saving..." }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </span>
  );
}
