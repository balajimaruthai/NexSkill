import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Rajesh Mehta');
  const [email] = useState(user?.email || 'doctor@aihealth.in');
  const [hospitalName, setHospitalName] = useState(user?.hospital_name || 'AIIMS Delhi');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile details updated successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please fill in password fields');
      return;
    }
    toast.success('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className={`p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center gap-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white font-black text-4xl shadow-xl flex-shrink-0">
          🏥
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {fullName}
          </h1>
          <p className="text-xs text-sky-500 font-semibold uppercase tracking-wider">{user?.role || 'Doctor / Chief Officer'}</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hospitalName} • {email}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
            isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-sky-50 text-slate-700 border-sky-100'
          }`}>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hospital & Personal Info */}
        <form onSubmit={handleSaveProfile} className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className={`font-bold text-lg border-b pb-3 border-slate-100 dark:border-slate-800 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Personal & Hospital Details
          </h3>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Hospital Name
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={e => setHospitalName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input-field opacity-60 cursor-not-allowed"
            />
          </div>

          <button type="submit" className="btn-primary text-xs px-5 py-2.5">
            Save Profile Changes
          </button>
        </form>

        {/* Change Password & Notification Toggles */}
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg border-b pb-3 border-slate-100 dark:border-slate-800 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Security & Password
            </h3>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-secondary text-xs px-5 py-2.5">
              Update Password
            </button>
          </form>

          {/* Preferences */}
          <div className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg border-b pb-3 border-slate-100 dark:border-slate-800 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Alert & Notification Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Email alerts on High Rush Forecast</span>
                <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} className="accent-sky-500 w-4 h-4" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Critical ICU Bed Capacity Push Alerts</span>
                <input type="checkbox" checked={notifAlerts} onChange={e => setNotifAlerts(e.target.checked)} className="accent-sky-500 w-4 h-4" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
