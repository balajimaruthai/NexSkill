import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setSent(true);
    toast.success('Password reset instructions sent to your email!');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50 text-slate-900'
    }`}>
      <div className={`w-full max-w-md glass-card p-8 rounded-3xl ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-sky-100'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-xl">🏥</div>
          <span className="font-bold text-lg">EWRP System</span>
        </div>

        <h1 className="text-2xl font-black mb-2">Reset Password</h1>
        <p className="text-xs text-slate-400 mb-6">Enter your registered hospital email to receive password reset link.</p>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs space-y-3">
            <p className="font-bold text-sm">✅ Check your Inbox</p>
            <p>We've sent a password reset link to <strong>{email}</strong>.</p>
            <Link to="/login" className="btn-primary block text-center py-2 text-xs">Return to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@aihealth.in"
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold">
              Send Password Reset Link
            </button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-sky-500 hover:underline">← Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
