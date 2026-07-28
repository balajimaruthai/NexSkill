import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export const AdminLogin: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('superadmin@ewrp.gov.in');
  const [password, setPassword] = useState('admin1234');
  const [securityCode, setSecurityCode] = useState('ADM-9901');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter admin credentials');
      return;
    }
    const ok = await login(email, password);
    if (ok) {
      toast.success('🛡️ Admin Authentication Verified! Accessing Command Center...');
      setTimeout(() => navigate('/admin'), 600);
    } else {
      toast.error('Invalid admin credentials. Access Denied.');
    }
  };

  const setPreset = (type: 'super' | 'admin') => {
    if (type === 'super') {
      setEmail('superadmin@ewrp.gov.in');
      setPassword('admin1234');
      setSecurityCode('SP-CTRL-01');
      toast.success('Loaded Super Admin Security Profile');
    } else {
      setEmail('admin@aihealth.in');
      setPassword('admin1234');
      setSecurityCode('ADM-9901');
      toast.success('Loaded Control Center Admin Profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <Toaster position="top-right" />

      {/* Grid Pattern & Crimson Glow */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-900/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card p-8 bg-zinc-900/90 border border-zinc-800 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-semibold">
            ← Standard Login
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 font-bold text-[10px] uppercase tracking-wider">
            🛡️ RESTRICTED ADMIN ACCESS
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-2xl shadow-lg shadow-red-950/50">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Admin Command Portal</h1>
            <p className="text-xs text-red-400 font-semibold">Emergency Infrastructure Control</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-6">
          Secure authentication for hospital administrators, fleet managers & government emergency response controllers.
        </p>

        {/* Demo Admin Preset Switcher */}
        <div className="mb-6 p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <p className="font-bold text-zinc-300">Quick Admin Presets:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPreset('super')}
              className={`p-2 rounded-lg border text-left transition-all ${
                email === 'superadmin@ewrp.gov.in'
                  ? 'bg-red-950/40 border-red-600 text-red-300 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => setPreset('admin')}
              className={`p-2 rounded-lg border text-left transition-all ${
                email === 'admin@aihealth.in'
                  ? 'bg-red-950/40 border-red-600 text-red-300 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              🏥 Control Center Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 block">
              Admin Identification Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field font-medium"
              placeholder="admin@aihealth.in"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 block">
              Security Token / Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-10 font-medium"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 block">
              Security Clearance Code
            </label>
            <input
              type="text"
              value={securityCode}
              onChange={e => setSecurityCode(e.target.value)}
              className="input-field uppercase font-mono text-red-400 tracking-wider font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-xl shadow-red-950/50 mt-2"
          >
            {isLoading ? 'Verifying Credentials...' : '🔐 Authorize & Launch Admin Center'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
