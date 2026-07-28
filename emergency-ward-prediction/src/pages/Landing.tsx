import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { hospitalStats } from '../utils/dummyData';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const features = [
  { icon: '🤖', title: 'AI-Powered Predictions', desc: 'Random Forest ML model predicts emergency rush with 97% accuracy using 11 hospital parameters.' },
  { icon: '⚡', title: 'Real-Time Monitoring', desc: 'Live dashboard tracks patient flow, bed availability, staff deployment, and emergency arrivals.' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'Comprehensive charts showing daily, weekly, and monthly trends with interactive visualizations.' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'AI-generated alerts notify staff about upcoming rushes, resource shortages, and critical events.' },
  { icon: '🏥', title: 'Resource Optimization', desc: 'Automatically recommends optimal staff allocation, bed management, and resource distribution.' },
  { icon: '📋', title: 'Automated Reports', desc: 'Generate PDF and Excel reports for daily, weekly, and monthly hospital performance.' },
];

const benefits = [
  { icon: '⏱️', title: 'Reduce Wait Times', desc: 'Cut average patient wait time by 40% through proactive rush prediction.' },
  { icon: '💊', title: 'Better Patient Care', desc: 'Ensure adequate staffing and resources for every patient, every shift.' },
  { icon: '💰', title: 'Cost Efficiency', desc: 'Optimize resource allocation to reduce overtime and emergency procurement.' },
  { icon: '📈', title: 'Data-Driven Decisions', desc: 'Empower hospital administrators with actionable AI insights.' },
];

const workflow = [
  { step: '01', title: 'Input Hospital Data', desc: 'Enter patient count, bed availability, staff, severity levels, and environmental factors.' },
  { step: '02', title: 'AI Processes Data', desc: 'Random Forest model analyzes 11 parameters with 97% accuracy.' },
  { step: '03', title: 'Rush Level Predicted', desc: 'System outputs Low, Medium, or High rush prediction with confidence score.' },
  { step: '04', title: 'Smart Recommendations', desc: 'AI generates specific action recommendations for each predicted rush level.' },
];

const testimonials = [
  { name: 'Dr. Priya Sharma', hospital: 'AIIMS Delhi', role: 'Chief Emergency Officer', text: 'EWRP has transformed how we manage our emergency ward. We reduced patient wait times by 45% in just 3 months.' },
  { name: 'Dr. Arun Kapoor', hospital: 'Apollo Hospital', role: 'Medical Director', text: 'The AI predictions are incredibly accurate. We can now prepare for high-rush periods before they happen.' },
  { name: 'Sunita Devi', hospital: 'Fortis Healthcare', role: 'Head Nurse', text: 'As a nurse, knowing in advance when a rush is coming helps us prepare mentally and physically. This system is a game-changer.' },
];

const faqs = [
  { q: 'How accurate is the AI prediction?', a: 'Our Random Forest model achieves 97% accuracy on test data with high precision and recall across all three rush levels.' },
  { q: 'What data is needed for predictions?', a: 'The model requires 11 inputs: patient count, available beds, doctor/nurse count, severity level, ambulance arrivals, waiting time, weather, holiday flag, time of day, and day of week.' },
  { q: 'How long does a prediction take?', a: 'Predictions are generated in under 500ms, giving you real-time insights instantly.' },
  { q: 'Is patient data secure?', a: 'All data is encrypted end-to-end using AES-256. We are fully HIPAA compliant and follow best data security practices.' },
  { q: 'Can it integrate with existing hospital systems?', a: 'Yes, EWRP provides REST APIs that integrate with major HIS and EMR systems.' },
];

const StatCounter: React.FC<{ value: number; suffix: string; isDecimal?: boolean }> = ({ value, suffix, isDecimal }) => {
  const count = useAnimatedCounter(isDecimal ? value * 10 : value, 2000);
  return <span>{isDecimal ? (count / 10).toFixed(1) : count.toLocaleString()}{suffix}</span>;
};

export const Landing: React.FC = () => {
  const { isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-zinc-950/90 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-red-950/50">
              <span className="text-white text-lg">🏥</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-white tracking-wide">EWRP System</p>
              <p className="text-xs text-red-500 font-semibold">AI Healthcare</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Benefits', 'Workflow', 'Statistics', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2 shadow-lg shadow-red-950/50">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950">
        {/* Grid bg */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-red-900/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 bg-red-950/60 border border-red-800/40 text-red-400"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              AI-Powered Emergency Ward Intelligence
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6 text-white tracking-tight">
              Predict Hospital Rush{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">
                Before It Happens
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-8 text-zinc-400 font-medium">
              Real-time machine learning predictions for emergency ward surge levels. Allocate beds, doctors, and triage resources proactively.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary text-base px-6 py-3.5 rounded-xl shadow-xl shadow-red-950/50">
                ⚡ Get Started Free
              </Link>
              <Link to="/dashboard" className="btn-secondary text-base px-6 py-3.5 rounded-xl">
                📊 Live Dashboard
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {[['97%', 'Model Accuracy'], ['< 500ms', 'Prediction Speed'], ['11', 'Input Parameters']].map(([val, label]) => (
                <div key={label}>
                  <p className={`text-2xl font-black font-display ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{val}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hospital Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="float-animation">
                <div className={`w-80 h-80 lg:w-96 lg:h-96 rounded-3xl shadow-2xl overflow-hidden relative ${
                  isDark ? 'bg-gradient-to-br from-sky-900 to-slate-900' : 'bg-gradient-to-br from-sky-100 to-cyan-50'
                }`}>
                  {/* Hospital SVG illustration */}
                  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-8">
                    {/* Hospital building */}
                    <rect x="60" y="160" width="280" height="200" rx="8" fill={isDark ? '#1e40af' : '#bfdbfe'} />
                    <rect x="80" y="140" width="240" height="40" rx="6" fill={isDark ? '#2563eb' : '#3b82f6'} />
                    {/* Cross sign */}
                    <rect x="170" y="60" width="60" height="100" rx="8" fill={isDark ? '#ef4444' : '#ef4444'} />
                    <rect x="140" y="85" width="120" height="50" rx="8" fill={isDark ? '#ef4444' : '#ef4444'} />
                    <rect x="175" y="65" width="50" height="90" rx="4" fill={isDark ? '#fca5a5' : '#fff'} opacity="0.4" />
                    <rect x="145" y="90" width="110" height="40" rx="4" fill={isDark ? '#fca5a5' : '#fff'} opacity="0.4" />
                    {/* Windows */}
                    {[0, 1, 2, 3].map(col => [0, 1, 2].map(row => (
                      <rect key={`${col}-${row}`} x={90 + col * 65} y={175 + row * 55} width="40" height="35" rx="4"
                        fill={isDark ? '#60a5fa' : '#93c5fd'} opacity="0.8" />
                    )))}
                    {/* Ambulance */}
                    <rect x="70" y="340" width="90" height="40" rx="6" fill="#ef4444" />
                    <rect x="155" y="345" width="30" height="30" rx="4" fill="#fca5a5" />
                    <circle cx="90" cy="382" r="10" fill="#1e293b" />
                    <circle cx="90" cy="382" r="5" fill="#64748b" />
                    <circle cx="155" cy="382" r="10" fill="#1e293b" />
                    <circle cx="155" cy="382" r="5" fill="#64748b" />
                    <text x="78" y="362" fill="white" fontSize="8" fontWeight="bold">AMBULANCE</text>
                    {/* AI nodes */}
                    <circle cx="320" cy="80" r="20" fill={isDark ? '#0ea5e9' : '#0ea5e9'} opacity="0.9" />
                    <text x="313" y="85" fill="white" fontSize="10" fontWeight="bold">AI</text>
                    <line x1="300" y1="90" x2="240" y2="140" stroke={isDark ? '#38bdf8' : '#0ea5e9'} strokeWidth="2" strokeDasharray="4" />
                    <circle cx="30" cy="200" r="15" fill={isDark ? '#10b981' : '#10b981'} opacity="0.8" />
                    <text x="21" y="204" fill="white" fontSize="7" fontWeight="bold">DATA</text>
                    <line x1="45" y1="200" x2="75" y2="220" stroke={isDark ? '#34d399' : '#10b981'} strokeWidth="2" strokeDasharray="4" />
                  </svg>
                  {/* Floating cards */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-4 right-4 glass px-3 py-2 rounded-xl shadow-lg"
                  >
                    <p className="text-xs font-bold text-emerald-600">🟢 Low Rush</p>
                    <p className="text-xs text-slate-500">Confidence: 94%</p>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute bottom-16 left-4 glass px-3 py-2 rounded-xl shadow-lg"
                  >
                    <p className="text-xs font-bold text-red-500">🔴 AI Alert</p>
                    <p className="text-xs text-slate-500">High Rush: 2 PM</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hospital Statistics */}
      <section id="statistics" className={`py-20 ${
        isDark ? 'bg-slate-900' : 'bg-gradient-to-r from-sky-600 to-cyan-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {hospitalStats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`text-center p-4 rounded-2xl ${
                  isDark ? 'bg-slate-800' : 'bg-white/15 backdrop-blur-sm'
                }`}
              >
                <p className={`text-3xl font-black font-display mb-1 ${
                  isDark ? 'text-sky-400' : 'text-white'
                }`}>
                  <StatCounter value={stat.value} suffix={stat.suffix} isDecimal={(stat as any).isDecimal} />
                </p>
                <p className={`text-xs font-medium ${
                  isDark ? 'text-slate-400' : 'text-white/80'
                }`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-24 ${
        isDark ? 'bg-slate-950' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm mb-2">POWERFUL FEATURES</p>
            <h2 className={`text-4xl font-display font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Everything You Need to Manage Emergency Care
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A complete AI-powered healthcare management platform built for modern hospitals.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group"
              >
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-sky-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm mb-2">WHY CHOOSE EWRP</p>
            <h2 className={`text-4xl font-display font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Proven Benefits for Hospitals</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{b.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className={`py-24 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm mb-2">HOW IT WORKS</p>
            <h2 className={`text-4xl font-display font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Prediction Workflow</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200" />
            {workflow.map((w, i) => (
              <motion.div key={w.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-xl">{w.step}</div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{w.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-sky-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm mb-2">TESTIMONIALS</p>
            <h2 className={`text-4xl font-display font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Trusted by Healthcare Professionals</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <div className="text-3xl mb-3">"</div>
                <p className={`text-sm leading-relaxed mb-4 italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.name}</p>
                    <p className="text-xs text-sky-500">{t.role} · {t.hospital}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-24 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm mb-2">FAQ</p>
            <h2 className={`text-4xl font-display font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`w-full flex items-center justify-between p-4 text-left font-semibold text-sm ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {faq.q}
                  <span className={`text-sky-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className={`px-4 pb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-black text-white mb-4">Ready to Transform Emergency Care?</h2>
            <p className="text-sky-100 text-lg mb-8">Join 142+ hospitals using AI to predict and manage emergency ward rushes.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="bg-white text-sky-600 font-bold px-8 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-xl">
                🚀 Start Free Today
              </Link>
              <Link to="/dashboard" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                📊 View Demo Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center"><span className="text-white">🏥</span></div>
                <span className="text-white font-bold">EWRP System</span>
              </div>
              <p className="text-slate-400 text-sm">AI-powered emergency ward rush prediction for modern hospitals.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">{['Dashboard', 'Prediction', 'Analytics', 'Reports'].map(l => <li key={l}><Link to={`/${l.toLowerCase()}`} className="text-slate-400 text-sm hover:text-sky-400 transition-colors">{l}</Link></li>)}</ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">{['Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map(l => <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-sky-400 transition-colors">{l}</a></li>)}</ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Connect</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 text-sm hover:text-sky-400 flex items-center gap-2 transition-colors">🐙 GitHub</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 text-sm hover:text-sky-400 flex items-center gap-2 transition-colors">💼 LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-slate-500 text-sm">© 2026 Emergency Ward Rush Prediction System. All rights reserved.</p>
            <p className="text-slate-500 text-sm">Built with ❤️ for better healthcare</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
