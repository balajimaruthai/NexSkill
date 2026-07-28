import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HospitalMapVisualizer } from '../components/charts/HospitalMapVisualizer';
import { dummyHospitals } from '../utils/dummyData';
import type { DriverStatus } from '../types';
import toast from 'react-hot-toast';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [driverStatus, setDriverStatus] = useState<DriverStatus>('en_route');
  const [hospitals] = useState(dummyHospitals);

  const freeHospitals = hospitals.filter(h => h.free_emergency_beds > 0);

  const handleStatusChange = (newStatus: DriverStatus) => {
    setDriverStatus(newStatus);
    toast.success(`Driver status updated to: ${newStatus.toUpperCase().replace('_', ' ')}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Driver Header Banner */}
      <div className={`p-6 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 gradient-hero text-white`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-md">
            🚑
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-200 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ambulance Driver Portal
            </div>
            <h1 className="text-2xl font-display font-bold">
              Welcome, {user?.full_name || 'Rajesh Kumar'}
            </h1>
            <p className="text-xs text-sky-200">
              Vehicle: <strong className="text-white">{user?.vehicle_id || 'DL-01-AB-1088'}</strong> • Connected to Live National Emergency Network
            </p>
          </div>
        </div>

        {/* Driver Status Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs text-sky-200 font-semibold">Your Status:</span>
          <div className="flex p-1 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
            {[
              { id: 'available', label: '🟢 Available' },
              { id: 'en_route', label: '🚨 En Route' },
              { id: 'dispatched', label: '🟡 Dispatched' },
              { id: 'off-duty', label: '⚪ Off Duty' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => handleStatusChange(st.id as DriverStatus)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  driverStatus === st.id
                    ? 'bg-white text-sky-900 shadow-md scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Active Dispatch Alert Card */}
      <div className={`glass-card p-6 border-2 border-red-500/50 bg-red-500/5 ${isDark ? 'bg-slate-900/90' : 'bg-white/90'}`}>
        <div className="flex items-center justify-between border-b pb-3 mb-4 border-red-500/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <h3 className="font-black text-base text-red-500">Active Emergency Patient Transport</h3>
              <p className="text-xs text-slate-400">Assigned Dispatch ID: #DSP-9921</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500 text-white font-black text-xs">
            CRITICAL PRIORITY
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs mb-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <p className="text-slate-400">Patient Condition</p>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Acute Cardiac Emergency</p>
          </div>
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <p className="text-slate-400">Pickup Location</p>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Ring Road Flyover, New Delhi</p>
          </div>
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <p className="text-slate-400">Assigned Destination Ward</p>
            <p className="font-bold text-sm text-emerald-500">AIIMS Delhi (18 Free ER Beds)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:+911126588500" className="text-sky-500 hover:underline">
              📞 Call AIIMS Emergency: +91 11 2658 8500
            </a>
            <span className="text-slate-400">• Estimated ETA: 8 Mins</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Patient arrival notified to AIIMS Emergency Ward!')}
              className="btn-primary text-xs px-4 py-2"
            >
              ✅ Notify Ward of Arrival
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Hospitals with Free Wards */}
      <div className="space-y-4">
        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          ⚡ Hospitals with Free Emergency Wards Right Now ({freeHospitals.length})
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {freeHospitals.map(h => (
            <div
              key={h.id}
              className={`glass-card p-5 border-l-4 border-l-emerald-500 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{h.name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-[10px]">
                  🟢 {h.free_emergency_beds} BEDS FREE
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{h.address}</p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <a href={`tel:${h.emergency_contact}`} className="font-bold text-sky-500 hover:underline">
                  📞 {h.emergency_contact}
                </a>
                <button
                  onClick={() => toast.success(`Route calculated to ${h.name}`)}
                  className="text-xs text-emerald-500 font-bold hover:underline"
                >
                  Navigate ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Map Visualizer */}
      <HospitalMapVisualizer />
    </div>
  );
};
