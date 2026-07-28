import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { RushLevel } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface RushGaugeProps {
  level: RushLevel;
  value?: number;
  probability?: number;
  confidence?: number;
}

export const RushGauge: React.FC<RushGaugeProps> = ({ level, value, probability, confidence = 0.88 }) => {
  const { isDark } = useTheme();
  const rawVal = value ?? (probability ? (probability > 1 ? probability : probability * 100) : 50);
  const percent = Math.min(Math.max(Math.round(rawVal), 0), 100);

  const colors = {
    'Low Rush': { primary: '#10b981', secondary: '#d1fae5', text: 'text-emerald-600', label: 'LOW RUSH', emoji: '🟢' },
    'Medium Rush': { primary: '#f59e0b', secondary: '#fef3c7', text: 'text-amber-600', label: 'MEDIUM RUSH', emoji: '🟡' },
    'High Rush': { primary: '#ef4444', secondary: '#fee2e2', text: 'text-red-600', label: 'HIGH RUSH', emoji: '🔴' },
  };

  const cfg = colors[level] || colors['Medium Rush'];

  // Gauge data
  const gaugeData = [
    { value: percent },
    { value: 100 - percent },
  ];

  const cx = 150;
  const cy = 150;
  const iR = 90;
  const oR = 130;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-72 h-40">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={gaugeData}
              cx={cx}
              cy={cy}
              innerRadius={iR}
              outerRadius={oR}
              stroke="none"
            >
              <Cell fill={cfg.primary} />
              <Cell fill={isDark ? '#1e293b' : '#f1f5f9'} />
            </Pie>
            {/* Background arc */}
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={[{ value: 100 }]}
              cx={cx}
              cy={cy}
              innerRadius={iR - 4}
              outerRadius={iR - 1}
              stroke="none"
            >
              <Cell fill={isDark ? '#334155' : '#e2e8f0'} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className={`text-4xl font-black font-display ${cfg.text}`}
          >
            {percent}%
          </motion.p>
          <p className={`text-xs font-bold tracking-widest ${cfg.text}`}>{cfg.label}</p>
        </div>
      </div>

      {/* Rush Level Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg`}
        style={{ background: cfg.secondary }}
      >
        <span className="text-3xl">{cfg.emoji}</span>
        <div>
          <p className={`font-black text-xl ${cfg.text}`}>{level}</p>
          <p className="text-xs text-slate-500">Confidence: {Math.round(confidence * 100)}%</p>
        </div>
      </motion.div>

      {/* Risk meter bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)' }}>
          <motion.div
            initial={{ marginLeft: '0%' }}
            animate={{ marginLeft: `${Math.max(0, percent - 4)}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="w-4 h-4 bg-white rounded-full shadow-lg -mt-0.5 border-2"
            style={{ borderColor: cfg.primary }}
          />
        </div>
      </div>
    </div>
  );
};
