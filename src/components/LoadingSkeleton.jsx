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

export function TableRowSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 animate-pulse flex items-center px-4 justify-between gap-4 shadow-xs"
        >
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded-md w-1/4" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/6 hidden sm:block" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/5 hidden md:block" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/6" />
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-lg w-16" />
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

export function MetricCardSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 animate-pulse shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded w-16 mt-1" />
        </div>
      ))}
    </div>
  );
}

export function AdminTablePageSkeleton({ 
  title = "Details", 
  subtitle = "Fetching verified records from KiTS sports database..." 
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Prominent Active Loading Status Pill */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          <span className="font-bold text-blue-950 dark:text-blue-200">Loading {title}...</span>
          <span className="text-blue-700 dark:text-blue-300 hidden sm:inline">{subtitle}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-600 text-white animate-pulse">Syncing</span>
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded-lg w-56 animate-pulse" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24 animate-pulse" />
          </div>
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-72 sm:w-96 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-28 animate-pulse" />
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 animate-pulse" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 animate-pulse shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="h-9 bg-slate-200 dark:bg-slate-700/80 rounded-lg flex-1 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 bg-slate-200 dark:bg-slate-700/80 rounded-lg w-28 animate-pulse" />
            <div className="h-9 bg-slate-200 dark:bg-slate-700/80 rounded-lg w-28 animate-pulse" />
            <div className="h-9 bg-slate-200 dark:bg-slate-700/80 rounded-lg w-28 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="h-11 bg-slate-100 dark:bg-slate-800 border-b border-[var(--border-color)] flex items-center px-4 justify-between animate-pulse">
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-1/5" />
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-1/6" />
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-1/6" />
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-1/6" />
          <div className="h-3.5 bg-slate-300 dark:bg-slate-600 rounded w-20" />
        </div>
        <div className="p-4 space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      </div>
    </div>
  );
}

export function AdminGridPageSkeleton({
  title = "Details",
  subtitle = "Fetching verified records from KiTS sports database..."
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Prominent Active Loading Status Pill */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          <span className="font-bold text-blue-950 dark:text-blue-200">Loading {title}...</span>
          <span className="text-blue-700 dark:text-blue-300 hidden sm:inline">{subtitle}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-600 text-white animate-pulse">Syncing</span>
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded-lg w-56 animate-pulse" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24 animate-pulse" />
          </div>
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-72 sm:w-96 animate-pulse" />
        </div>
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 animate-pulse" />
      </div>

      {/* Filter/Tabs Toolbar */}
      <div className="h-10 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 flex items-center gap-2 animate-pulse max-w-md shadow-sm">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden space-y-4 p-4 animate-pulse shadow-sm"
          >
            <div className="h-44 rounded-lg bg-slate-200 dark:bg-slate-700/80" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-20" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Prominent Active Loading Status Pill */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
          <span className="font-bold text-blue-950 dark:text-blue-200">Loading Sports Directorate Dashboard...</span>
          <span className="text-blue-700 dark:text-blue-300 hidden sm:inline">Aggregating live registrations, teams, medal tallies, and analytics...</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-600 text-white animate-pulse">Syncing</span>
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-2">
          <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded-lg w-64 animate-pulse" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-80 sm:w-96 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-28 animate-pulse" />
        </div>
      </div>

      {/* 8 Metric KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2.5 animate-pulse shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded w-16 mt-1" />
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-48" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          </div>
          <div className="h-56 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin" />
          </div>
        </div>

        <div className="h-80 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 space-y-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-48" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          </div>
          <div className="h-56 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-200 dark:border-slate-700 border-t-amber-500 animate-spin" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table Skeleton */}
      <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-52 animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
        </div>
        <TableRowSkeleton rows={5} />
      </div>
    </div>
  );
}

