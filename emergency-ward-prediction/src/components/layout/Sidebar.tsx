import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/prediction', icon: '🤖', label: 'AI Prediction' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/patients', icon: '🏥', label: 'Patients' },
  { path: '/staff', icon: '👨⚕️', label: 'Staff' },
  { path: '/beds', icon: '🛏️', label: 'Bed Management' },
  { path: '/alerts', icon: '🔔', label: 'Alerts' },
  { path: '/reports', icon: '📋', label: 'Reports' },
  { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
];

const bottomItems = [
  { path: '/profile', icon: '👤', label: 'Profile' },
  { path: '/about', icon: 'ℹ️', label: 'About' },
  { path: '/contact', icon: '📞', label: 'Contact' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden shadow-2xl bg-zinc-950 border-r border-zinc-800/80"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800/80">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-950/40">
          <span className="text-white text-lg">🏥</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-display font-bold text-sm leading-tight text-white tracking-wide">EWRP System</p>
              <p className="text-xs text-red-500 font-semibold">AI Healthcare</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className={`ml-auto flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-sky-50 text-slate-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />}
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-zinc-800/80 px-2 py-3 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {/* User card */}
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-red-400 font-semibold uppercase truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-xs text-red-400 hover:text-red-300 font-semibold py-1 rounded-lg hover:bg-red-950/40 transition-colors"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};
