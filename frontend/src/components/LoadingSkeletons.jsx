import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Base helpers                                                        */
/* ------------------------------------------------------------------ */

const fadeIn = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.18 },
};

// Simple gray block with pulse animation
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}
    >
      {/* shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page-level overlay loader (for Suspense route transitions)          */
/* ------------------------------------------------------------------ */

export function PageLoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-3"
      >
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <div className="text-sm font-medium text-slate-600">
          Loading…
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compact section title skeleton                                      */
/* ------------------------------------------------------------------ */

export function SectionTitleSkeleton({ withActions = true }) {
  return (
    <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {withActions && (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Top stat card skeletons (match your 3 info cards)                   */
/* ------------------------------------------------------------------ */

export function StatCardSkeleton() {
  return (
    <motion.div {...fadeIn} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatRowSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Daily log form placeholder                                          */
/* ------------------------------------------------------------------ */

export function LogFormSkeleton() {
  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Daily weight input */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Nutrition grid */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout / Cardio sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* History/accordion placeholder                                       */
/* ------------------------------------------------------------------ */

export function HistoryListSkeleton({ groups = 3, itemsPerGroup = 3 }) {
  return (
    <motion.div {...fadeIn} className="space-y-4">
      {Array.from({ length: groups }).map((_, g) => (
        <div key={g} className="rounded-2xl border border-slate-200 bg-white/60 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          {/* items */}
          <div className="px-4 sm:px-5 pb-5 grid gap-3">
            {Array.from({ length: itemsPerGroup }).map((__, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Weekly summary placeholder                                          */
/* ------------------------------------------------------------------ */

export function WeeklySummarySkeleton() {
  return (
    <motion.div {...fadeIn} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 mb-3" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-7 w-16 mx-auto mb-2" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
