import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const roles = ['Doctor', 'Nurse', 'Hospital Manager', 'Administrator', 'Staff'];

export const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', hospital_name: '', role: 'Doctor', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.hospital_name || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const ok = await register(form);
    if (ok) { toast.success('Account created! Redirecting...'); setTimeout(() => navigate('/dashboard'), 800); }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'}`}>
      <Toaster position="top-right" />

      {/* Illustration */}
      <div className="hidden lg:flex lg:w-5/12 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center text-4xl mb-6 shadow-2xl float-animation">🏥</div>
          <h2 className="text-3xl font-display font-black text-white mb-3">Join EWRP System</h2>
          <p className="text-sky-200 mb-8">Transform emergency care with AI-powered predictions</p>
          <div className="space-y-3 w-full max-w-xs">
            {['✅ Free to start', '✅ 97% prediction accuracy', '✅ Real-time alerts', '✅ Analytics dashboard', '✅ HIPAA compliant'].map(f => (
              <div key={f} className="glass px-4 py-2 rounded-xl text-left text-sm text-white">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
          <div className="flex justify-end mb-4">
            <button onClick={toggleTheme} className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-slate-800' : 'bg-sky-50'} transition-colors`}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <h1 className={`text-3xl font-display font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Join the AI healthcare revolution</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name *</label>
                <input type="text" value={form.full_name} onChange={set('full_name')} className="input-field" placeholder="Dr. Your Name" />
              </div>
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Role *</label>
                <select value={form.role} onChange={set('role')} className="input-field">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address *</label>
              <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="your@hospital.com" />
            </div>
            <div>
              <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hospital Name *</label>
              <input type="text" value={form.hospital_name} onChange={set('hospital_name')} className="input-field" placeholder="e.g. AIIMS Delhi" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pr-10" placeholder="Min 8 chars" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div>
                <label className={`text-sm font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Confirm Password *</label>
                <input type="password" value={form.confirm_password} onChange={set('confirm_password')} className="input-field" placeholder="Repeat password" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Creating Account...
                </div>
              ) : '🏥 Create Account'}
            </button>
          </form>

          <p className={`text-center text-sm mt-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 hover:text-sky-600 font-semibold">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
