// src/components/AppSkeletons.jsx
import React from 'react';

/* Base skeleton block */
const Sk = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />
);

/* Compact stat card skeleton */
export const SmallStatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
    <Sk className="h-10 w-10 rounded-xl" />
    <div className="flex-1">
      <Sk className="h-3 w-24 mb-2" />
      <Sk className="h-4 w-16" />
    </div>
  </div>
);

/* Top summary (3 small stats) */
export const StreakSummarySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SmallStatSkeleton />
    <SmallStatSkeleton />
    <SmallStatSkeleton />
  </div>
);

/* Week accordion/list skeleton */
export const WeekAccordionSkeleton = ({ rows = 3 }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/60 overflow-hidden">
    {/* Header row */}
    <div className="w-full flex items-center justify-between px-4 sm:px-5 py-4">
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-8 rounded-lg" />
        <div>
          <Sk className="h-3.5 w-24 mb-1" />
          <Sk className="h-4 w-40" />
        </div>
      </div>
      <Sk className="h-6 w-6 rounded-md" />
    </div>
    {/* Fake items */}
    <div className="px-4 sm:px-5 pb-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-5 rounded-md" />
              <Sk className="h-4 w-24" />
            </div>
            <div className="flex gap-2">
              <Sk className="h-7 w-14 rounded-lg" />
              <Sk className="h-7 w-16 rounded-lg" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Sk className="h-3 w-1/2" />
            <Sk className="h-3 w-2/3" />
            <Sk className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* Generic card skeleton with optional line count */
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-8 rounded-xl" />
        <div>
          <Sk className="h-4 w-32 mb-2" />
          <Sk className="h-3 w-24" />
        </div>
      </div>
      <Sk className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <Sk key={i} className={`h-3 ${i === lines - 1 ? 'w-2/5' : 'w-full'}`} />
      ))}
    </div>
  </div>
);

/* Row of compact stat cards */
export const StatsRowSkeleton = ({ cards = 4 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
    {[...Array(cards)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4"
      >
        <Sk className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <Sk className="h-3 w-24 mb-2" />
          <Sk className="h-4 w-16" />
        </div>
      </div>
    ))}
  </div>
);

/* Full page shell skeleton (title, stats row, and a couple cards) */
export const PageShellSkeleton = () => (
  <div role="status" aria-live="polite" className="space-y-8 p-4 sm:p-6 lg:p-8">
    {/* Page header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-2 rounded-full" />
        <div>
          <Sk className="h-6 w-40 mb-2" />
          <Sk className="h-4 w-64" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <Sk className="h-9 w-24 rounded-lg" />
        <Sk className="h-9 w-24 rounded-lg" />
        <Sk className="h-9 w-10 rounded-lg" />
      </div>
    </div>

    {/* Stats row */}
    <StatsRowSkeleton cards={4} />

    {/* Content cards */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CardSkeleton lines={4} />
      <CardSkeleton lines={4} />
    </div>

    {/* Secondary list/table section */}
    <div className="space-y-3">
      <Sk className="h-5 w-40" />
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm space-y-3">
        <Sk className="h-10 w-full" />
        <Sk className="h-10 w-full" />
        <Sk className="h-10 w-3/4" />
      </div>
    </div>
  </div>
);

/* ===================== AUTH SKELETONS ===================== */

/** Minimal form card skeleton (used by login & signup) */
export const AuthFormSkeleton = () => (
  <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur rounded-2xl border border-slate-200/60 p-6 shadow-sm">
    <div className="mb-6 space-y-2">
      <Sk className="h-6 w-40" />
      <Sk className="h-4 w-64" />
    </div>
    <div className="space-y-3">
      <Sk className="h-10 w-full rounded-lg" />
      <Sk className="h-10 w-full rounded-lg" />
      <Sk className="h-10 w-2/3 rounded-lg" />
    </div>
    <div className="mt-6 space-y-3">
      <Sk className="h-11 w-full rounded-xl" />
      <Sk className="h-4 w-24" />
    </div>
  </div>
);

/** Full Auth page skeleton (header + tabs + form) */
export const AuthPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Left side brand/illustration */}
      <div className="hidden lg:block">
        <div className="space-y-5">
          <Sk className="h-8 w-44 rounded-md" />
          <Sk className="h-5 w-80" />
          <Sk className="h-5 w-72" />
          <Sk className="h-5 w-64" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Sk className="h-20 w-full rounded-xl" />
            <Sk className="h-20 w-full rounded-xl" />
            <Sk className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Right side auth card */}
      <div className="space-y-4">
        {/* Fake tabs */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200/60 p-2 flex gap-2">
          <Sk className="h-10 w-28 rounded-lg" />
          <Sk className="h-10 w-28 rounded-lg" />
        </div>

        {/* Form card */}
        <AuthFormSkeleton />
      </div>
    </div>
  </div>
);

/* ---- Aliases so imports don't break across files ---- */
export const FullAppSkeleton = PageShellSkeleton;       // legacy name
export const StatCardSkeletonRow = StatsRowSkeleton;    // legacy name
export const WeekGroupSkeleton = WeekAccordionSkeleton; // legacy name
export const SectionCardSkeleton = CardSkeleton;        // legacy name (fixes your import)

/* Optional default export */
export default PageShellSkeleton;
