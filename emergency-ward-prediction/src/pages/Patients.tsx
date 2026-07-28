import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { dummyPatients } from '../utils/dummyData';
import type { Patient } from '../types';
import toast from 'react-hot-toast';

export const Patients: React.FC = () => {
  const { isDark } = useTheme();
  const [patients, setPatients] = useState<Patient[]>(dummyPatients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New patient state
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 30,
    gender: 'Male',
    severity: 2,
    status: 'Waiting',
    ward: 'Emergency',
    doctor: 'Dr. Mehta',
    condition: '',
    contact: ''
  });

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.condition.toLowerCase().includes(search.toLowerCase()) ||
                        p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.condition) {
      toast.error('Please enter patient name and condition');
      return;
    }
    const created: Patient = {
      id: 'P' + String(patients.length + 1).padStart(3, '0'),
      name: newPatient.name || '',
      age: Number(newPatient.age) || 30,
      gender: (newPatient.gender as any) || 'Male',
      severity: Number(newPatient.severity) || 2,
      status: (newPatient.status as any) || 'Waiting',
      ward: newPatient.ward || 'Emergency',
      doctor: newPatient.doctor || 'Dr. Mehta',
      admission_date: new Date().toISOString().split('T')[0],
      condition: newPatient.condition || '',
      contact: newPatient.contact || '+91 98765 00000'
    };
    setPatients([created, ...patients]);
    setIsAddOpen(false);
    toast.success(`Patient ${created.name} registered successfully!`);
  };

  const handleDelete = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
    setSelectedPatient(null);
    toast.success('Patient record deleted');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Search Controls */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Emergency Patient Management
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitor, admit, triage, and manage emergency patient records in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2"
        >
          ➕ Add New Patient
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, ID, condition..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Waiting', 'In Treatment', 'Admitted', 'Discharged'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-sky-500 text-white shadow-md'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:bg-sky-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <div className={`glass-card overflow-hidden ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name & Age</th>
                <th>Condition</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Ward</th>
                <th>Doctor</th>
                <th>Admission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="cursor-pointer">
                  <td className="font-mono font-bold text-sky-500">{p.id}</td>
                  <td>
                    <div>
                      <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name}</p>
                      <p className="text-xs text-slate-400">{p.age} yrs • {p.gender}</p>
                    </div>
                  </td>
                  <td className="font-medium text-slate-700 dark:text-slate-300">{p.condition}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.severity >= 4 ? 'bg-red-500/10 text-red-500' :
                      p.severity === 3 ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      Level {p.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                      p.status === 'Waiting' ? 'bg-amber-500/10 text-amber-600' :
                      p.status === 'In Treatment' ? 'bg-sky-500/10 text-sky-600' :
                      p.status === 'Admitted' ? 'bg-indigo-500/10 text-indigo-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.ward}</td>
                  <td>{p.doctor}</td>
                  <td className="text-xs text-slate-400">{p.admission_date}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="text-xs text-sky-500 hover:text-sky-600 font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl ${
                isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg">Patient Details - {selectedPatient.id}</h3>
                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Name:</strong> {selectedPatient.name}</p>
                  <p><strong>Age/Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</p>
                  <p><strong>Condition:</strong> {selectedPatient.condition}</p>
                  <p><strong>Severity:</strong> Level {selectedPatient.severity}</p>
                  <p><strong>Status:</strong> {selectedPatient.status}</p>
                  <p><strong>Ward:</strong> {selectedPatient.ward}</p>
                  <p><strong>Attending Doctor:</strong> {selectedPatient.doctor}</p>
                  <p><strong>Contact:</strong> {selectedPatient.contact}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelectedPatient(null)} className="btn-secondary text-xs px-4 py-2">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl ${
                isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg">Register New Emergency Patient</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      value={newPatient.age}
                      onChange={e => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={e => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Medical Condition</label>
                  <input
                    type="text"
                    value={newPatient.condition}
                    onChange={e => setNewPatient({ ...newPatient, condition: e.target.value })}
                    placeholder="e.g. Acute Respiratory Distress"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Triage Severity (1-5)</label>
                    <input
                      type="number"
                      min="1" max="5"
                      value={newPatient.severity}
                      onChange={e => setNewPatient({ ...newPatient, severity: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Ward</label>
                    <input
                      type="text"
                      value={newPatient.ward}
                      onChange={e => setNewPatient({ ...newPatient, ward: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-primary text-xs px-5 py-2">Save Patient</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
