import React from 'react';

export default function ResultLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse py-4 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-4">
        <div className="h-4 bg-slate-800 rounded-full w-48" />
        <div className="h-8 bg-slate-800 rounded-xl w-3/4" />
        <div className="h-4 bg-slate-800 rounded-full w-1/2" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="h-3 bg-slate-800 rounded-full w-24" />
            <div className="h-7 bg-slate-800 rounded-xl w-16" />
          </div>
        ))}
      </div>

      {/* Winner Skeleton */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto" />
        <div className="h-6 bg-slate-800 rounded-xl w-48 mx-auto" />
        <div className="h-4 bg-slate-800 rounded-full w-32 mx-auto" />
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 h-80" />
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 h-80" />
      </div>
    </div>
  );
}
