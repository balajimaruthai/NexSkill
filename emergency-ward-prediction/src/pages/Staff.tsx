import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { dummyDoctors, dummyNurses } from '../utils/dummyData';
import type { Doctor, Nurse } from '../types';
import toast from 'react-hot-toast';

export const Staff: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'doctors' | 'nurses'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>(dummyDoctors);
  const [nurses] = useState<Nurse[]>(dummyNurses);

  const toggleDoctorStatus = (id: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        const nextAvail = d.availability === 'available' ? 'busy' : d.availability === 'busy' ? 'off-duty' : 'available';
        toast.success(`Updated ${d.name} status to ${nextAvail}`);
        return { ...d, availability: nextAvail };
      }
      return d;
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
            Staff & Personnel Management
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage doctor shifts, nursing rosters, real-time availability, and department allocation.
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`flex p-1 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-sky-50 border-sky-100'}`}>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'doctors' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            👨‍⚕️ Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('nurses')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nurses' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            👩‍⚕️ Nurses ({nurses.length})
          </button>
        </div>
      </div>

      {/* Grid of Staff Cards */}
      {activeTab === 'doctors' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -4 }}
              className={`glass-card p-6 flex flex-col justify-between ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-sky-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.name}</h3>
                      <p className="text-xs text-sky-500 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDoctorStatus(doc.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                      doc.availability === 'available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                      doc.availability === 'busy' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/30'
                    }`}
                  >
                    ● {doc.availability.toUpperCase()}
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Department:</span>
                    <strong className="text-slate-900 dark:text-white">{doc.department}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Shift Timing:</span>
                    <strong className="text-slate-900 dark:text-white capitalize">{doc.shift} Shift</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Active Patients:</span>
                    <strong className="text-sky-500">{doc.patients_count} Patients</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Experience:</span>
                    <strong>{doc.experience_years} Years</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">📞 {doc.contact}</span>
                <button
                  onClick={() => toggleDoctorStatus(doc.id)}
                  className="text-sky-500 hover:text-sky-600 font-semibold"
                >
                  Change Status
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nurses.map(nurse => (
            <motion.div
              key={nurse.id}
              whileHover={{ y: -4 }}
              className={`glass-card p-6 flex flex-col justify-between ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-sky-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {nurse.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{nurse.name}</h3>
                      <p className="text-xs text-cyan-500 font-semibold">{nurse.ward}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    nurse.availability === 'available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                    nurse.availability === 'busy' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                    'bg-slate-500/10 text-slate-500 border-slate-500/30'
                  }`}>
                    ● {nurse.availability.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Department:</span>
                    <strong className="text-slate-900 dark:text-white">{nurse.department}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Shift Timing:</span>
                    <strong className="text-slate-900 dark:text-white capitalize">{nurse.shift} Shift</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">📞 {nurse.contact}</span>
                <span className="text-xs text-emerald-500 font-bold">On Active Duty</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
