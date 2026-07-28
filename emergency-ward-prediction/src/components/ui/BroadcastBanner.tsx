import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dummyBroadcasts } from '../../utils/dummyData';
import type { BroadcastUpdate } from '../../types';
export const BroadcastBanner: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastUpdate[]>(dummyBroadcasts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Poll for new broadcasts stored in localStorage or window event
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ewrp-broadcasts');
      if (saved) {
        try { setBroadcasts(JSON.parse(saved)); } catch (e) {}
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (dismissed || broadcasts.length === 0) return null;

  const current = broadcasts[currentIndex % broadcasts.length];

  const categoryColors = {
    urgent_alert: 'from-red-600 to-amber-600 border-red-500 text-white',
    ward_update: 'from-sky-600 to-blue-700 border-sky-400 text-white',
    traffic_reroute: 'from-amber-600 to-yellow-600 border-amber-400 text-white',
    general: 'from-slate-800 to-slate-900 border-slate-700 text-white'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full bg-gradient-to-r ${categoryColors[current.category] || categoryColors.general} border-b shadow-lg px-4 py-2.5 flex items-center justify-between gap-4 text-xs z-30 relative`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-white/20 font-black tracking-wider uppercase text-[10px] animate-pulse">
            📢 LIVE BROADCAST ({currentIndex + 1}/{broadcasts.length})
          </span>
          <p className="font-bold truncate text-sm">
            {current.title}: <span className="font-normal text-white/90">{current.message}</span>
          </p>
          <span className="hidden md:inline-block text-white/60 text-[10px] flex-shrink-0">
            • Posted by {current.posted_by} ({current.hospital_name})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {broadcasts.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % broadcasts.length)}
              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors"
            >
              Next Broadcast ➔
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 text-white font-bold"
            title="Dismiss Announcement"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
