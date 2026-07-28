import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { dummyAdminUsers, dummyHospitals, dummyDrivers, dummyBroadcasts } from '../utils/dummyData';
import type { AdminUser, Hospital, AmbulanceDriver, BroadcastUpdate } from '../types';
import { HospitalMapVisualizer } from '../components/charts/HospitalMapVisualizer';
import toast from 'react-hot-toast';

export const Admin: React.FC = () => {
  const { isDark } = useTheme();
  const [users] = useState<AdminUser[]>(dummyAdminUsers);
  const [hospitals] = useState<Hospital[]>(dummyHospitals);
  const [drivers] = useState<AmbulanceDriver[]>(dummyDrivers);
  const [broadcasts, setBroadcasts] = useState<BroadcastUpdate[]>(dummyBroadcasts);

  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'drivers' | 'broadcast' | 'dataset'>('overview');
  const [file, setFile] = useState<File | null>(null);

  // Broadcast creation form
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bCategory, setBCategory] = useState<'urgent_alert' | 'ward_update' | 'traffic_reroute' | 'general'>('urgent_alert');

  const handlePostBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bMessage) {
      toast.error('Please enter announcement title and message');
      return;
    }

    const newBroadcast: BroadcastUpdate = {
      id: 'BC-' + String(broadcasts.length + 1).padStart(3, '0'),
      title: bTitle,
      message: bMessage,
      category: bCategory,
      posted_by: 'Super Admin (Command Hub)',
      hospital_name: 'Central Control Center',
      created_at: new Date().toISOString(),
      priority: bCategory === 'urgent_alert' ? 'critical' : 'high'
    };

    const updated = [newBroadcast, ...broadcasts];
    setBroadcasts(updated);
    localStorage.setItem('ewrp-broadcasts', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    toast.success('📢 Global Announcement Broadcasted to ALL Connected Users!');
    setBTitle('');
    setBMessage('');
  };

  const handleRetrain = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1800)),
      {
        loading: 'Retraining Random Forest Classifier on latest connected hospital dataset...',
        success: 'Random Forest Model retrained successfully! Test Accuracy: 97.4%',
        error: 'Failed to retrain model.'
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`CSV Dataset file "${e.target.files[0].name}" loaded. Ready for import.`);
    }
  };

  const activeDriversCount = drivers.filter(d => d.status !== 'off-duty').length;
  const freeEmergencyBedsCount = hospitals.reduce((acc, h) => acc + h.free_emergency_beds, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 font-bold text-xs mb-3">
            🛡️ Central Command Hub • Real-time Monitoring
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            System Admin & Infrastructure Command Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">
            Monitor active ambulance drivers, live hospital emergency wards, global broadcast alerts & ML operations.
          </p>
        </div>

        <div className="flex p-1.5 rounded-2xl border border-zinc-800 bg-zinc-950 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hospitals' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🏥 Live Hospitals Map ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drivers' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🚑 Active Drivers ({activeDriversCount}/{drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'broadcast' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📢 Broadcasts
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dataset' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📁 AI Retraining
          </button>
        </div>
      </div>

      {/* Overview Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-zinc-900/90 border border-zinc-800">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Connected Hospitals</p>
          <p className="text-3xl font-black text-red-500 mt-1">{hospitals.length}</p>
          <p className="text-xs text-emerald-400 font-semibold mt-1">🟢 Live Telemetry Online</p>
        </div>

        <div className="glass-card p-5 bg-zinc-900/90 border border-zinc-800 border-l-4 border-l-red-500">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Fleet Drivers</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            {activeDriversCount} <span className="text-sm font-normal text-zinc-400">/ {drivers.length}</span>
          </p>
          <p className="text-xs text-emerald-400 font-semibold mt-1">⚡ GPS & Dispatch Active</p>
        </div>

        <div className="glass-card p-5 bg-zinc-900/90 border border-zinc-800">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Available Emergency Beds</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{freeEmergencyBedsCount} Free</p>
          <p className="text-xs text-zinc-400 font-medium mt-1">Across all hospital wards</p>
        </div>

        <div className="glass-card p-5 bg-zinc-900/90 border border-zinc-800">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Broadcast Alerts</p>
          <p className="text-3xl font-black text-rose-500 mt-1">{broadcasts.length}</p>
          <p className="text-xs text-rose-400 font-medium mt-1">Live across network</p>
        </div>
      </div>

      {/* Tab 1: Overview - Includes Realtime Hospital Map + Registered Users */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Realtime Hospital Mapping Embedded */}
          <div className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Real-Time Available Hospital Map</h3>
                <p className="text-xs text-zinc-400">Live GPS locations, ward bed availability & direct emergency helplines</p>
              </div>
              <button
                onClick={() => setActiveTab('hospitals')}
                className="text-xs font-bold text-red-400 hover:underline"
              >
                Expand Directory View →
              </button>
            </div>
            <HospitalMapVisualizer />
          </div>

          <div className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white">Registered System Users</h3>
              <button onClick={() => toast.success('Invite link copied to clipboard')} className="btn-primary text-xs px-4 py-2">
                ➕ Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Hospital</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div>
                          <p className="font-bold text-sm text-white">{u.full_name}</p>
                          <p className="text-xs text-zinc-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="text-zinc-300 font-medium">{u.hospital_name}</td>
                      <td>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950/60 border border-red-800/40 text-red-400 uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.status === 'active' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          ● {u.status}
                        </span>
                      </td>
                      <td className="text-xs text-zinc-400 font-medium">{u.last_login}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Connected Hospitals Directory */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-white">
              Connected Hospital Emergency Wards & Live Map
            </h3>
            <button onClick={() => toast.success('Hospital registration form opened')} className="btn-primary text-xs px-4 py-2">
              🏥 Register New Hospital
            </button>
          </div>

          <HospitalMapVisualizer />

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {hospitals.map(h => (
              <div key={h.id} className={`glass-card p-6 border-l-4 ${
                h.status === 'freely_available' ? 'border-l-emerald-500' :
                h.status === 'moderate' ? 'border-l-amber-500' : 'border-l-red-500'
              } bg-zinc-900/90 border border-zinc-800`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-base text-white">{h.name}</h4>
                    <p className="text-xs text-zinc-400">{h.address}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    h.status === 'freely_available' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                    h.status === 'moderate' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-red-950/60 text-red-400 border border-red-800/40'
                  }`}>
                    {h.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 my-4 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400 text-[10px]">Total Beds</p>
                    <p className="font-bold text-white text-sm">{h.total_beds}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400 text-[10px]">Free ER Beds</p>
                    <p className="font-bold text-emerald-400 text-sm">{h.free_emergency_beds}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400 text-[10px]">Free ICU Beds</p>
                    <p className="font-bold text-red-400 text-sm">{h.free_icu_beds}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400 text-[10px]">Doctors</p>
                    <p className="font-bold text-white text-sm">{h.doctors_available}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <a href={`tel:${h.emergency_contact}`} className="text-red-400 font-bold hover:underline">
                    📞 Ward Contact: {h.emergency_contact}
                  </a>
                  <span className="text-zinc-500 text-[10px]">{h.last_updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Connected Ambulance Drivers Directory */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-white">
                Active Connected Ambulance Drivers ({activeDriversCount} Active Now)
              </h3>
              <p className="text-xs text-zinc-400">Live GPS tracking and fleet dispatch control</p>
            </div>
            <button onClick={() => toast.success('Ambulance driver registration modal opened')} className="btn-primary text-xs px-4 py-2">
              🚑 Register Ambulance Driver
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {drivers.map(drv => (
              <div key={drv.id} className="glass-card p-6 bg-zinc-900/90 border border-zinc-800 hover:border-red-600/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-md shadow-red-950/40">
                      🚑
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{drv.driver_name}</h4>
                      <p className="text-xs text-red-400 font-semibold">{drv.vehicle_number} • ID: {drv.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    drv.status === 'available' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                    drv.status === 'en_route' ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  }`}>
                    ● {drv.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>GPS Location:</span>
                    <strong className="text-slate-900 dark:text-white">{drv.current_location}</strong>
                  </div>
                  {drv.destination_hospital && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span>Destination Hospital:</span>
                      <strong className="text-sky-500">{drv.destination_hospital}</strong>
                    </div>
                  )}
                  {drv.patient_condition && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span>Transport Patient:</span>
                      <strong className="text-red-500">{drv.patient_condition}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <a href={`tel:${drv.phone}`} className="font-bold text-sky-500 hover:underline">📞 {drv.phone}</a>
                  <span className="text-slate-400">Assigned: {drv.assigned_time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Post Broadcast Announcement Form & Feed */}
      {activeTab === 'broadcast' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handlePostBroadcast} className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📢 Post Global Broadcast Update
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Broadcast emergency directives, mass casualty notifications, or traffic alerts instantly to ALL connected ambulance drivers, doctors, and users!
              </p>

              <div>
                <label className="block text-xs font-semibold mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={bTitle}
                  onChange={e => setBTitle(e.target.value)}
                  placeholder="e.g. 🚨 Highway Accident Reroute Alert"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={bCategory}
                  onChange={e => setBCategory(e.target.value as any)}
                  className="input-field cursor-pointer"
                >
                  <option value="urgent_alert">🚨 Urgent Emergency Alert</option>
                  <option value="ward_update">🛏️ Ward Capacity Update</option>
                  <option value="traffic_reroute">🚙 Traffic / Ambulance Reroute</option>
                  <option value="general">ℹ️ General Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  value={bMessage}
                  onChange={e => setBMessage(e.target.value)}
                  placeholder="Type the message to be broadcasted live across all dashboards..."
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2">
                📡 Publish Live Broadcast Now
              </button>
            </form>
          </div>

          {/* Active Broadcast Feed */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Live Broadcast Feed ({broadcasts.length})
            </h3>

            <div className="space-y-3">
              {broadcasts.map(bc => (
                <div key={bc.id} className={`glass-card p-5 border-l-4 ${
                  bc.category === 'urgent_alert' ? 'border-l-red-500 bg-red-500/5' :
                  bc.category === 'ward_update' ? 'border-l-sky-500 bg-sky-500/5' :
                  'border-l-amber-500 bg-amber-500/5'
                } ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{bc.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-bold uppercase">
                      {bc.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>{bc.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Posted by: {bc.posted_by} ({bc.hospital_name})</span>
                    <span>{new Date(bc.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: ML & Dataset Retraining */}
      {activeTab === 'dataset' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Import Custom Hospital Dataset (CSV)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Upload historical hospital records to retrain the Random Forest Classifier across connected wards.
            </p>

            <div className="border-2 border-dashed border-sky-400/30 rounded-2xl p-8 text-center space-y-4 hover:border-sky-400 transition-colors">
              <span className="text-4xl block">📊</span>
              <p className="text-xs text-slate-400">Drag and drop CSV dataset file here or click to browse</p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="btn-secondary text-xs px-4 py-2 cursor-pointer inline-block">
                Select CSV File
              </label>
              {file && (
                <p className="text-xs font-bold text-emerald-500">File Ready: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
              )}
            </div>

            <button
              onClick={() => toast.success('Dataset imported into training pipeline')}
              disabled={!file}
              className={`w-full mt-6 py-3 rounded-xl text-xs font-bold transition-all ${
                file ? 'btn-primary' : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              📥 Import Dataset & Update Database
            </button>
          </div>

          <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Random Forest Model Controls
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Model retraining status and hyperparameter tuning parameters.
            </p>

            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-2xl flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Active Model</p>
                  <p className="text-slate-400">RandomForestClassifier (n_estimators=100)</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 font-bold rounded-full">97.2% Accuracy</span>
              </div>
            </div>

            <button
              onClick={handleRetrain}
              className="btn-primary w-full mt-6 py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              🔄 Re-train Random Forest Classifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
