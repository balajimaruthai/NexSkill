import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('doctor@aihealth.in');
  const [password, setPassword] = useState('demo1234');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    const ok = await login(email, password);
    if (ok) { toast.success('Welcome back! Redirecting...'); setTimeout(() => navigate('/dashboard'), 800); }
    else toast.error('Invalid credentials. Try again.');
  };

  const handleGoogle = () => toast.success('Google login coming soon!');

  return (
    <div className={`min-h-screen flex ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'
    }`}>
      <Toaster position="top-right" />

      {/* Left illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center text-4xl mb-8 shadow-2xl float-animation">
            🏥
          </div>
          <h2 className="text-4xl font-display font-black text-white mb-4 leading-tight">
            Emergency Ward Rush Prediction System
          </h2>
          <p className="text-sky-200 text-lg mb-10">
            AI-Powered Healthcare Intelligence
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {[
              ['97%', 'Accuracy'],
              ['<500ms', 'Speed'],
              ['11', 'Parameters'],
              ['3', 'Rush Levels'],
            ].map(([v, l]) => (
              <div key={l} className="glass p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-sky-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Floating badges */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-16 right-8 glass px-4 py-2 rounded-xl">
          <p className="text-xs text-emerald-400 font-bold">🟢 Low Rush Detected</p>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-32 left-8 glass px-4 py-2 rounded-xl">
          <p className="text-xs text-red-400 font-bold">🔴 High Rush Alert</p>
        </motion.div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Theme toggle */}
          <div className="flex justify-end mb-6">
            <button onClick={toggleTheme} className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
              isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'
            } transition-colors`}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xl shadow-lg">
              🏥
            </div>
            <span className={`font-display font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>EWRP System</span>
          </div>
          <h1 className={`text-3xl font-display font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h1>
          <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign in to your healthcare dashboard
          </p>

          {/* Demo credentials box */}
          <div className="p-3 rounded-xl mb-6 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 space-y-1">
            <p className="font-bold text-white mb-1">Demo Quick Logins:</p>
            <p>Doctor: <code>doctor@aihealth.in</code> (pass: <code>demo1234</code>)</p>
            <p>Ambulance Driver: <code>driver@ambulance.in</code> (pass: <code>demo1234</code>)</p>
          </div>

          {/* Admin Login Portal Banner */}
          <div className="mb-6">
            <Link
              to="/admin/login"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-950/70 transition-all text-xs font-bold shadow-lg shadow-red-950/30"
            >
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>Switch to Dedicated Admin Login Portal</span>
              </div>
              <span>➔</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-sm font-semibold mb-1.5 block ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your hospital email"
              />
            </div>

            <div>
              <label className={`text-sm font-semibold mb-1.5 block ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 text-sm cursor-pointer ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-600 font-medium">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </div>
              ) : (
                '🔐 Sign In'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or continue with</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>

          <button
            onClick={handleGoogle}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            } hover:shadow-md`}
          >
            <span className="text-xl">🔍</span>
            Continue with Google
          </button>

          <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-500 hover:text-sky-600 font-semibold">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
