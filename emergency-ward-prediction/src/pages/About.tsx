import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const featureImportances = [
  { feature: 'Patient Count', weight: 28 },
  { feature: 'Available Beds', weight: 22 },
  { feature: 'Waiting Time', weight: 16 },
  { feature: 'Ambulance Arrivals', weight: 12 },
  { feature: 'Severity Level', weight: 10 },
  { feature: 'Doctor Count', weight: 5 },
  { feature: 'Nurse Count', weight: 3 },
  { feature: 'Weather/Holiday', weight: 4 },
];

export const About: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className={`p-8 rounded-3xl border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div className="max-w-3xl space-y-3">
          <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 font-bold border border-sky-500/20">
            🏥 Project Overview & ML Architecture
          </span>
          <h1 className={`text-3xl font-display font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Emergency Ward Rush Prediction System
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Our AI-powered healthcare SaaS platform predicts emergency ward crowd surges before they happen. By analyzing 11 key operational and environmental parameters, hospitals can dynamically allocate doctors, nurses, beds, and trauma resources to save lives and eliminate wait times.
          </p>
        </div>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`glass-card p-6 border-l-4 border-l-red-500 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className="text-lg font-bold text-red-500 mb-2">❌ The Problem Statement</h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Emergency wards often experience unpredictable overcrowding spikes. Unplanned surges lead to longer patient waiting times, severe staff burnouts, shortages of critical ICU beds, delayed triage decisions, and reduced overall quality of emergency medical care.
          </p>
        </div>

        <div className={`glass-card p-6 border-l-4 border-l-emerald-500 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
          <h3 className="text-lg font-bold text-emerald-500 mb-2">✅ The AI Solution</h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            EWRP leverages a supervised Random Forest Classifier model trained on operational telemetry. The system forecasts crowd surges into Low, Medium, or High Rush levels with 97% accuracy, generating automated resource allocation directives.
          </p>
        </div>
      </div>

      {/* Machine Learning Metrics */}
      <div className={`glass-card p-6 space-y-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Machine Learning Model Metrics (Random Forest)
            </h2>
            <p className="text-xs text-slate-400">Evaluated on test dataset with 1,500 sample records</p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            97% Test Accuracy
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Accuracy', val: '97.2%' },
            { label: 'Precision', val: '96.8%' },
            { label: 'Recall', val: '97.4%' },
            { label: 'F1 Score', val: '97.1%' }
          ].map(m => (
            <div key={m.label} className={`p-4 rounded-2xl text-center ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
              <p className="text-xs text-slate-400 font-medium">{m.label}</p>
              <p className="text-2xl font-black text-sky-500 mt-1">{m.val}</p>
            </div>
          ))}
        </div>

        {/* Feature Importance Chart */}
        <div className="pt-4">
          <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Feature Importance Weight Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportances} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis dataKey="feature" type="category" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="weight" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Importance Weight %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Technology Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {[
            ['Frontend', 'React 19 + TypeScript + Vite'],
            ['Styling', 'Tailwind CSS + Glassmorphism UI'],
            ['Animations', 'Framer Motion + Recharts'],
            ['Backend API', 'Node.js Express REST Server'],
            ['ML Engine', 'Python Flask + Scikit-Learn'],
            ['Database', 'Supabase Auth & Database'],
          ].map(([t, val]) => (
            <div key={t} className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-sky-50'}`}>
              <p className="font-bold text-sky-500 mb-1">{t}</p>
              <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
