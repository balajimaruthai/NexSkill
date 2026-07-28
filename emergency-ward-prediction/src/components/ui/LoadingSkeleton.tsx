import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const LoadingSkeleton: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className={`skeleton h-8 w-48 ${isDark ? 'bg-slate-700' : ''}`} />
        <div className={`skeleton h-6 w-24 ${isDark ? 'bg-slate-700' : ''}`} />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`skeleton w-11 h-11 rounded-xl mb-3 ${isDark ? 'bg-slate-700' : ''}`} />
            <div className={`skeleton h-7 w-20 mb-1 ${isDark ? 'bg-slate-700' : ''}`} />
            <div className={`skeleton h-4 w-28 ${isDark ? 'bg-slate-700' : ''}`} />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`skeleton h-6 w-36 mb-4 ${isDark ? 'bg-slate-700' : ''}`} />
        <div className={`skeleton h-56 w-full rounded-xl ${isDark ? 'bg-slate-700' : ''}`} />
      </div>
    </div>
  );
};
