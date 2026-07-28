import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useClock } from '../../hooks/useClock';
import { dummyNotifications } from '../../utils/dummyData';
import type { Notification } from '../../types';

interface TopNavProps {
  sidebarCollapsed: boolean;
  title: string;
}

const WEATHERS = [
  { icon: '☀️', label: '28°C Clear', city: 'Delhi' },
  { icon: '🌧️', label: '22°C Rainy', city: 'Delhi' },
];

export const TopNav: React.FC<TopNavProps> = ({ sidebarCollapsed, title }) => {
  const { isDark, toggleTheme } = useTheme();
  const { formatted, date } = useClock();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [search, setSearch] = useState('');
  const weather = WEATHERS[0];

  const unread = notifications.filter(n => !n.is_read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const sidebarW = sidebarCollapsed ? 72 : 260;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center h-16 px-6 gap-4 shadow-xl transition-all duration-300 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-xl"
      style={{ left: sidebarW }}
    >
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-display font-bold truncate text-white tracking-wide">{title}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center relative">
        <input
          type="text"
          placeholder="Search patients, predictions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-60 pl-9 pr-4 py-2 rounded-xl text-sm border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:bg-zinc-950 outline-none transition-all"
        />
        <span className="absolute left-3 text-zinc-500 text-sm">🔍</span>
      </div>

      {/* Weather Widget */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-zinc-300">
        <span>{weather.icon}</span>
        <span className="font-semibold">{weather.label}</span>
        <span className="text-red-400 font-bold">{weather.city}</span>
      </div>

      {/* Clock */}
      <div className="hidden lg:flex flex-col items-end text-xs text-zinc-400">
        <span className="font-mono font-bold text-sm text-red-500 tracking-wider">{formatted}</span>
        <span className="truncate max-w-32">{date.split(',')[0]}</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(v => !v)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
        >
          <span className="text-lg">🔔</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-black shadow-md">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-sky-100'
              }`}
            >
              <div className={`flex items-center justify-between px-4 py-3 border-b ${
                isDark ? 'border-slate-700' : 'border-sky-100'
              }`}>
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</span>
                <button onClick={markAllRead} className="text-xs text-sky-500 hover:text-sky-600">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      !n.is_read
                        ? isDark ? 'bg-sky-900/20' : 'bg-sky-50'
                        : isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mt-0.5">
                      {n.type === 'error' ? '🚨' : n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{n.title}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{n.message}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-sky-500 rounded-full mt-1 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showNotif && <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
          isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </header>
  );
};
