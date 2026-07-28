import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { dummyHospitals } from '../../utils/dummyData';
import type { Hospital } from '../../types';
import toast from 'react-hot-toast';

export const HospitalMapVisualizer: React.FC = () => {
  const { isDark } = useTheme();
  const [hospitals, setHospitals] = useState<Hospital[]>(dummyHospitals);
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(dummyHospitals[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [secondTicker, setSecondTicker] = useState(60);

  // Live minute-by-minute Ward monitoring ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondTicker(prev => {
        if (prev <= 1) {
          // Simulate live ward update every minute
          setHospitals(hList => hList.map(h => {
            if (h.id === 'H001') {
              const delta = Math.floor(Math.random() * 3) - 1;
              const newFree = Math.max(0, h.free_emergency_beds + delta);
              return { ...h, free_emergency_beds: newFree, last_updated: 'Updated 5s ago' };
            }
            return h;
          }));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredHospitals = hospitals.filter(h => {
    if (filterStatus === 'free') return h.status === 'freely_available';
    if (filterStatus === 'full') return h.status === 'full_capacity';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Live minute-by-minute radar status bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-xl font-bold">
            📡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Live Minute-by-Minute Emergency Ward Monitor
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">
              Auto refreshing telemetry stream • Next sync in <strong className="text-sky-500 font-mono">{secondTicker}s</strong>
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Hospitals' },
            { id: 'free', label: '🟢 Freely Available Wards' },
            { id: 'full', label: '🔴 Full Capacity Alert' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Map Embed Visualizer & Hospital Live Cards */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Hospital Interactive List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            🏥 Connected Hospitals Radar ({filteredHospitals.length})
          </h3>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredHospitals.map(h => {
              const isSelected = selectedHospital.id === h.id;
              const statusBg =
                h.status === 'freely_available' ? 'border-l-emerald-500 bg-emerald-500/5' :
                h.status === 'moderate' ? 'border-l-amber-500 bg-amber-500/5' :
                'border-l-red-500 bg-red-500/5';

              return (
                <motion.div
                  key={h.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedHospital(h)}
                  className={`p-4 rounded-2xl border-l-4 cursor-pointer transition-all shadow-sm ${statusBg} ${
                    isSelected
                      ? isDark ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30' : 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-400/20'
                      : isDark ? 'bg-slate-900/90 border-slate-800 hover:bg-slate-800/60' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{h.name}</h4>
                      <p className="text-xs text-slate-400">{h.address}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                      h.status === 'freely_available' ? 'bg-emerald-500/20 text-emerald-600' :
                      h.status === 'moderate' ? 'bg-amber-500/20 text-amber-600' :
                      'bg-red-500/20 text-red-600'
                    }`}>
                      {h.status === 'freely_available' ? '🟢 FREE WARD' : h.status === 'moderate' ? '🟡 MODERATE' : '🔴 FULL'}
                    </span>
                  </div>

                  {/* Bed stats summary */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                      <p className="text-[10px] text-slate-400">Free ER Beds</p>
                      <p className={`font-black text-sm ${h.free_emergency_beds > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {h.free_emergency_beds}
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                      <p className="text-[10px] text-slate-400">Free ICU Beds</p>
                      <p className="font-black text-sm text-sky-500">{h.free_icu_beds}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                      <p className="text-[10px] text-slate-400">Doctors On Duty</p>
                      <p className="font-black text-sm text-slate-700 dark:text-white">{h.doctors_available}</p>
                    </div>
                  </div>

                  {/* Contact Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <a
                      href={`tel:${h.emergency_contact}`}
                      onClick={e => e.stopPropagation()}
                      className="font-bold text-sky-500 hover:underline flex items-center gap-1"
                    >
                      📞 {h.emergency_contact}
                    </a>
                    <span className="text-[10px] text-slate-400">{h.last_updated}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Map Preview & Detailed Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`glass-card overflow-hidden rounded-3xl border shadow-xl relative h-80 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-sky-50 border-sky-100'
          }`}>
            <iframe
              title="Selected Hospital Map Visualizer"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedHospital.name + ' ' + selectedHospital.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
            {/* Overlay badge */}
            <div className="absolute top-4 left-4 glass px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{selectedHospital.name}</p>
                <p className="text-[10px] text-sky-500 font-semibold">{selectedHospital.city}</p>
              </div>
            </div>
          </div>

          {/* Selected Hospital Direct Dispatch & Helpline Panel */}
          <div className={`glass-card p-6 border-2 ${
            selectedHospital.status === 'freely_available' ? 'border-emerald-500/40 bg-emerald-500/5' :
            selectedHospital.status === 'moderate' ? 'border-amber-500/40 bg-amber-500/5' :
            'border-red-500/40 bg-red-500/5'
          } ${isDark ? 'bg-slate-900/90' : 'bg-white/90'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedHospital.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">{selectedHospital.address}</p>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Emergency Helpline: </span>
                    <a href={`tel:${selectedHospital.emergency_contact}`} className="font-bold text-sky-500 hover:underline">
                      {selectedHospital.emergency_contact}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">Ambulance Service: </span>
                    <a href={`tel:${selectedHospital.ambulance_helpline}`} className="font-bold text-emerald-500 hover:underline">
                      {selectedHospital.ambulance_helpline}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${selectedHospital.emergency_contact}`}
                  className="btn-primary text-xs px-4 py-3 flex items-center gap-2 shadow-lg"
                >
                  📞 Direct Call Ward
                </a>
                <button
                  onClick={() => toast.success(`Route calculated to ${selectedHospital.name}. Estimated travel time: 12 mins`)}
                  className="btn-secondary text-xs px-4 py-3 flex items-center gap-2"
                >
                  🧭 Get GPS Route
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
