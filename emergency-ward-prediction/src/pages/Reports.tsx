import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { dummyPredictions } from '../utils/dummyData';
import { RushBadge } from '../components/ui/RushBadge';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const { isDark } = useTheme();

  const handleGenerateReport = (type: string) => {
    toast.success(`Generating ${type.toUpperCase()} Hospital Executive Report...`);
  };

  const handleDownloadPDF = () => {
    toast.success('Downloading Report in PDF format...');
  };

  const handleDownloadExcel = () => {
    toast.success('Downloading Report in Excel format...');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Automated Hospital Performance & AI Reports
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Generate comprehensive operational reports, prediction audit trails, and compliance exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDownloadPDF} className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-2">
            📄 Download PDF Report
          </button>
          <button onClick={handleDownloadExcel} className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2">
            📊 Export Excel Data
          </button>
        </div>
      </div>

      {/* Generator Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { type: 'daily', title: 'Daily Ward Summary', desc: 'Detailed 24-hour breakdown of patient arrivals, peak rush hours, bed occupancy, and AI accuracy.' },
          { type: 'weekly', title: 'Weekly Operational Audit', desc: '7-day trend analysis of emergency load, nurse/doctor shift distribution, and resource bottlenecks.' },
          { type: 'monthly', title: 'Monthly Executive Report', desc: '30-day overview for hospital management, budget forecasting, and predictive model validation.' }
        ].map(card => (
          <div key={card.type} className={`glass-card p-6 flex flex-col justify-between ${
            isDark ? 'bg-slate-900/80' : 'bg-white/80'
          }`}>
            <div>
              <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.title}</h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.desc}</p>
            </div>
            <button
              onClick={() => handleGenerateReport(card.type)}
              className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              ⚡ Generate {card.type.toUpperCase()} Report
            </button>
          </div>
        ))}
      </div>

      {/* Prediction History Table */}
      <div className={`glass-card p-6 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent AI Prediction History Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Log of all historical predictions executed by the Random Forest model</p>
          </div>
          <span className="text-xs text-sky-500 font-bold">Total: {dummyPredictions.length} Predictions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prediction ID</th>
                <th>Rush Level</th>
                <th>Probability</th>
                <th>Confidence</th>
                <th>Timestamp</th>
                <th>Action Recommendations</th>
              </tr>
            </thead>
            <tbody>
              {dummyPredictions.map(pred => (
                <tr key={pred.id}>
                  <td className="font-mono text-sky-500 font-bold">{pred.id}</td>
                  <td>
                    <RushBadge level={pred.rush_level} size="sm" />
                  </td>
                  <td className="font-bold text-slate-800 dark:text-white">{(pred.probability * 100).toFixed(0)}%</td>
                  <td className="font-semibold text-emerald-500">{(pred.confidence * 100).toFixed(0)}%</td>
                  <td className="text-xs text-slate-400">{new Date(pred.created_at || '').toLocaleString()}</td>
                  <td className="text-xs max-w-xs truncate text-slate-600 dark:text-slate-300">
                    {pred.recommendations.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
