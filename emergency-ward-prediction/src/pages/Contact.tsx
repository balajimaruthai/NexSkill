import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you! Your message has been sent to our medical support team.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`p-8 rounded-3xl border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'
      }`}>
        <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Contact & Technical Support
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Have questions about deploying EWRP in your hospital network? Get in touch with our AI healthcare engineers.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Send a Message</h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Your Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Ananya Roy"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ananya@hospital.org"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Hospital Enterprise Integration"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Message *</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your query or hospital requirements..."
                className="input-field"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
              {loading ? 'Sending Message...' : '✉️ Send Inquiry'}
            </button>
          </form>
        </div>

        {/* Contact Info & Map */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`glass-card p-6 space-y-4 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Hospital HQ & Support</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Headquarters Address</p>
                  <p className="text-slate-400">AIIMS Campus, Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">24/7 Helpline</p>
                  <p className="text-sky-500 font-semibold">+91 11 2658 8500 / 8700</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Email Support</p>
                  <p className="text-sky-500 font-semibold">support@emergencyward.ai</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Preview */}
          <div className={`glass-card overflow-hidden rounded-2xl h-64 relative border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-sky-50 border-sky-100'}`}>
            <iframe
              title="Hospital Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=AIIMS%20Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
