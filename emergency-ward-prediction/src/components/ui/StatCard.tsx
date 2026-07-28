import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  subtitle?: string;
  icon: string;
  trend?: number;
  color?: 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'purple' | 'danger' | 'warning' | 'success';
  delay?: number;
}

const colorMap = {
  blue: { bg: 'from-sky-400 to-sky-600', light: 'bg-sky-50', text: 'text-sky-600', dark: 'bg-sky-900/20' },
  cyan: { bg: 'from-cyan-400 to-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-600', dark: 'bg-cyan-900/20' },
  green: { bg: 'from-emerald-400 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', dark: 'bg-emerald-900/20' },
  success: { bg: 'from-emerald-400 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', dark: 'bg-emerald-900/20' },
  orange: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600', dark: 'bg-amber-900/20' },
  warning: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600', dark: 'bg-amber-900/20' },
  red: { bg: 'from-red-400 to-red-600', light: 'bg-red-50', text: 'text-red-600', dark: 'bg-red-900/20' },
  danger: { bg: 'from-red-400 to-red-600', light: 'bg-red-50', text: 'text-red-600', dark: 'bg-red-900/20' },
  purple: { bg: 'from-purple-400 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', dark: 'bg-purple-900/20' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, suffix = '', subtitle, icon, trend, color = 'blue', delay = 0
}) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5 border border-zinc-800 bg-zinc-900/80 hover:border-red-600/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-xl shadow-lg shadow-red-950/30`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            trend >= 0
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
              : 'bg-red-950/40 text-red-400 border border-red-800/40'
          }`}>
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold font-display mb-0.5 text-white tracking-tight">
        {value}{suffix}
      </p>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</p>
      {subtitle && (
        <p className="text-[11px] mt-1 text-zinc-500">{subtitle}</p>
      )}
    </motion.div>
  );
};
