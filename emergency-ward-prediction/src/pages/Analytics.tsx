import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { weeklyRushData, monthlyRushData, patientTrendData } from '../utils/dummyData';
import toast from 'react-hot-toast';

export const Analytics: React.FC = () => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const handleExportPDF = () => {
    toast.success('Generating and downloading Analytics PDF Report...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting Analytics Data to Excel (.xlsx)...');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Analytics & Hospital Intelligence
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Comprehensive AI performance metrics, crowd heatmaps, bed utilization, and emergency trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-sky-50 border-sky-100'}`}>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-sky-500 text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={handleExportPDF} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
            📥 PDF
          </button>
          <button onClick={handleExportExcel} className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
            📊 Excel
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Prediction Accuracy', val: '97.2%', label: '+0.5% vs last month', color: 'emerald' },
          { title: 'Avg Emergency Wait', val: '38 mins', label: '-12 mins improvement', color: 'sky' },
          { title: 'Peak Rush Hour', val: '14:00 - 16:00', label: 'Afternoon Shift', color: 'amber' },
          { title: 'Total Admissions', val: '1,847', label: 'Last 30 days', color: 'blue' }
        ].map(kpi => (
          <div key={kpi.title} className={`glass-card p-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <p className="text-xs text-slate-400 font-semibold">{kpi.title}</p>
            <p className="text-2xl font-black mt-1 text-sky-500">{kpi.val}</p>
            <p className="text-xs text-emerald-500 font-medium mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak Hours & Crowd Heatmap */}
        <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Hourly Emergency Rush Heatmap (Peak Hours)
          </h3>
          <p className="text-xs text-slate-400 mb-6">Patient crowd concentration by hour of day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="patients" stroke="#0ea5e9" fill="#38bdf8" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Rush Comparison */}
        <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Weekly Rush Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-6">Low, Medium, and High rush day breakdowns</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRushData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" name="Low Rush" fill="#10b981" />
                <Bar dataKey="medium" name="Medium Rush" fill="#f59e0b" />
                <Bar dataKey="high" name="High Rush" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Monthly Rush & Accuracy Trend */}
        <div className={`glass-card p-6 lg:col-span-2 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            30-Day Rush Trend & AI Model Accuracy
          </h3>
          <p className="text-xs text-slate-400 mb-6">Evaluating long-term predictive accuracy vs actual operational load</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRushData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rush_score" name="Rush Score Index" stroke="#0ea5e9" strokeWidth={3} />
                <Line type="monotone" dataKey="accuracy" name="AI Model Accuracy %" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
