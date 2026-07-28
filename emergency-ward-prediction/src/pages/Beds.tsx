import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { dummyBeds } from '../utils/dummyData';
import type { Bed } from '../types';
import toast from 'react-hot-toast';

export const Beds: React.FC = () => {
  const { isDark } = useTheme();
  const [beds, setBeds] = useState<Bed[]>(dummyBeds);

  const totalBeds = beds.reduce((acc, b) => acc + b.total, 0);
  const occupiedBeds = beds.reduce((acc, b) => acc + b.occupied, 0);
  const reservedBeds = beds.reduce((acc, b) => acc + b.reserved, 0);
  const emergencyBeds = beds.reduce((acc, b) => acc + b.emergency, 0);
  const availableBeds = totalBeds - (occupiedBeds + reservedBeds + emergencyBeds);
  const overallOccupancy = Math.round((occupiedBeds / totalBeds) * 100);

  const handleReserveBed = (id: string) => {
    setBeds(prev => prev.map(b => {
      if (b.id === id && b.available > 0) {
        toast.success(`Reserved 1 emergency bed in ${b.ward}`);
        return {
          ...b,
          available: b.available - 1,
          reserved: b.reserved + 1
        };
      }
      return b;
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bed & Ward Capacity Management
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time ward occupancy, emergency bed reservation, overflow tracking, and bed availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-500 font-bold border border-sky-500/20">
            📊 Overall Occupancy: {overallOccupancy}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`glass-card p-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <p className="text-xs text-slate-400 font-semibold">Total Hospital Beds</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{totalBeds}</p>
          <p className="text-xs text-slate-400 mt-1">Across 8 Wards</p>
        </div>

        <div className={`glass-card p-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <p className="text-xs text-slate-400 font-semibold">Occupied Beds</p>
          <p className="text-3xl font-black text-sky-500 mt-1">{occupiedBeds}</p>
          <p className="text-xs text-sky-500 mt-1">{overallOccupancy}% Capacity</p>
        </div>

        <div className={`glass-card p-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <p className="text-xs text-slate-400 font-semibold">Available Beds</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{availableBeds}</p>
          <p className="text-xs text-emerald-500 mt-1">Ready for Admissions</p>
        </div>

        <div className={`glass-card p-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <p className="text-xs text-slate-400 font-semibold">Reserved / Emergency</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{reservedBeds + emergencyBeds}</p>
          <p className="text-xs text-amber-500 mt-1">{emergencyBeds} Emergency Standby</p>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {beds.map(bed => {
          const occPct = Math.round((bed.occupied / bed.total) * 100);
          const isCritical = occPct >= 90;

          return (
            <motion.div
              key={bed.id}
              whileHover={{ y: -4 }}
              className={`glass-card p-6 flex flex-col justify-between border-2 ${
                isCritical ? 'border-red-500/40 bg-red-500/5' : isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-sky-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {bed.ward}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isCritical ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {occPct}% Full
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden my-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${occPct}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-sky-400 to-emerald-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                  <div className={`p-2 rounded-xl text-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                    <p className="text-slate-400">Total Beds</p>
                    <p className="font-bold text-slate-800 dark:text-white">{bed.total}</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                    <p className="text-slate-400">Occupied</p>
                    <p className="font-bold text-sky-500">{bed.occupied}</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                    <p className="text-slate-400">Available</p>
                    <p className="font-bold text-emerald-500">{bed.available}</p>
                  </div>
                  <div className={`p-2 rounded-xl text-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                    <p className="text-slate-400">Emergency</p>
                    <p className="font-bold text-amber-500">{bed.emergency}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleReserveBed(bed.id)}
                disabled={bed.available === 0}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  bed.available > 0
                    ? 'btn-secondary hover:bg-sky-500 hover:text-white'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                }`}
              >
                {bed.available > 0 ? '🔒 Reserve Bed' : '🚫 Ward Full'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
