import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/ui/StatCard';
import { RushBadge } from '../components/ui/RushBadge';
import { RushGauge } from '../components/charts/RushGauge';
import { dummyDashboardStats, patientTrendData, weeklyRushData, monthlyRushData, bedUsageData } from '../utils/dummyData';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats] = useState(dummyDashboardStats);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950 border border-zinc-800 shadow-2xl text-white"
      >
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-xs font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live AI Emergency Triage Active
            </div>
            <h2 className="text-3xl font-display font-extrabold tracking-tight">
              Welcome, {user?.full_name || 'Dr. Medical Officer'}
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl font-medium leading-relaxed">
              {user?.hospital_name || 'AIIMS Delhi'} Ward Monitor • Operational ML prediction active.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/prediction" className="btn-primary text-sm px-5 py-3 shadow-lg shadow-red-950/50">
              ⚡ Run AI Prediction
            </Link>
            <Link to="/analytics" className="btn-secondary text-sm px-4 py-3">
              📈 Analytics
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Today's Prediction & Quick Status Banner */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Rush Level Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 flex flex-col justify-between bg-zinc-900/90 border border-zinc-800 hover:border-red-600/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-zinc-200">Rush Forecast</h3>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 font-bold uppercase">
              Random Forest AI
            </span>
          </div>

          <div className="flex items-center gap-6 my-2">
            <div className="w-28 h-28 flex-shrink-0">
              <RushGauge value={stats.today_prediction === 'High Rush' ? 88 : stats.today_prediction === 'Medium Rush' ? 65 : 25} level={stats.today_prediction} />
            </div>
            <div className="space-y-2">
              <RushBadge level={stats.today_prediction} size="lg" />
              <p className="text-xs text-zinc-400">
                Confidence: <strong className="text-red-400 font-bold">{stats.prediction_confidence}%</strong>
              </p>
              <p className="text-xs text-amber-400 font-bold">
                ⚠️ Peak load: 2:00 PM - 5:00 PM
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 text-xs flex justify-between items-center text-zinc-400">
            <span>Recommended Staffing:</span>
            <span className="font-bold text-red-400">+4 Nursing Staff</span>
          </div>
        </motion.div>

        {/* Status Breakdown Grid (4 mini cards) */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Occupancy %" value={stats.hospital_occupancy} suffix="%" icon="🏥" color="blue" trend={+4.2} />
          <StatCard title="Emergency Cases" value={stats.emergency_cases} icon="🚑" color="danger" trend={+12} />
          <StatCard title="Patients Waiting" value={stats.patients_waiting} icon="⏳" color="warning" trend={-2} />
          <StatCard title="Beds Available" value={stats.beds_remaining} icon="🛏️" color="success" trend={-5} />
          <StatCard title="Doctors On Duty" value={stats.doctors_available} icon="👨‍⚕️" color="cyan" />
          <StatCard title="Nurses On Duty" value={stats.nurses_available} icon="👩‍⚕️" color="cyan" />
          <StatCard title="Avg Wait Time" value={stats.avg_waiting_time} suffix="m" icon="⏱️" color="warning" trend={-8} />
          <StatCard title="Total Predictions" value={stats.total_predictions} icon="🤖" color="blue" trend={+24} />
        </div>
      </div>

      {/* Main Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Patient Trend & Emergency Admissions */}
        <motion.div variants={itemVariants} className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-100">Patient Trend & Emergency Cases</h3>
              <p className="text-xs text-zinc-400">Hourly patient load vs critical emergency arrivals</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold">24-Hour Horizon</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientTrendData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#991b1b" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#991b1b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="patients" name="Total Patients" stroke="#ef4444" fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2} />
                <Area type="monotone" dataKey="emergency" name="Emergency Cases" stroke="#dc2626" fillOpacity={1} fill="url(#colorEmergency)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bed Usage by Ward */}
        <motion.div variants={itemVariants} className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-100">Ward Bed Utilization</h3>
              <p className="text-xs text-zinc-400">Occupied vs Available beds per department</p>
            </div>
            <Link to="/beds" className="text-xs text-red-400 font-bold hover:underline">View Beds →</Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="ward" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Rush Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-100">Weekly Rush Frequency</h3>
              <p className="text-xs text-zinc-400">Distribution of Low, Medium & High rush days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRushData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" name="Low Rush" fill="#22c55e" stackId="a" />
                <Bar dataKey="medium" name="Medium Rush" fill="#eab308" stackId="a" />
                <Bar dataKey="high" name="High Rush" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Rush & Model Accuracy */}
        <motion.div variants={itemVariants} className="glass-card p-6 bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-100">Monthly Rush Index & Model Accuracy</h3>
              <p className="text-xs text-zinc-400">30-day rush score against ML accuracy</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-bold">97% Accuracy</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRushData.slice(0, 14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rush_score" name="Rush Index Score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="accuracy" name="Prediction Accuracy %" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
