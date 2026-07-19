import React from 'react';

const SkeletonLoader = ({ type = 'table', count = 5, className = '' }) => {
  const shimmerClass = "animate-pulse bg-slate-200 rounded-lg";

  if (type === 'table') {
    return (
      <div className={`space-y-4 w-full ${className}`}>
        {/* Table Head Shim */}
        <div className="flex items-center space-x-4 py-3 border-b border-slate-200/60">
          <div className={`h-4 w-8 ${shimmerClass}`} />
          <div className={`h-4 flex-1 ${shimmerClass}`} />
          <div className={`h-4 w-28 ${shimmerClass}`} />
          <div className={`h-4 w-20 ${shimmerClass}`} />
          <div className={`h-4 w-24 ${shimmerClass}`} />
        </div>
        {/* Table Rows Shim */}
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center space-x-4 py-4 border-b border-slate-100">
            <div className={`h-10 w-10 rounded-xl bg-slate-200 animate-pulse`} />
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-1/3 ${shimmerClass}`} />
              <div className={`h-2.5 w-1/4 ${shimmerClass}`} />
            </div>
            <div className={`h-3 w-28 ${shimmerClass}`} />
            <div className={`h-3 w-20 ${shimmerClass}`} />
            <div className={`h-6 w-24 rounded-xl bg-slate-200 animate-pulse`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-200/60 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className={`h-3 w-3/4 ${shimmerClass}`} />
                <div className={`h-2.5 w-1/2 ${shimmerClass}`} />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className={`h-2.5 w-full ${shimmerClass}`} />
              <div className={`h-2.5 w-5/6 ${shimmerClass}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
