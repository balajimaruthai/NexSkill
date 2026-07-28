import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Prediction } from './pages/Prediction';
import { Analytics } from './pages/Analytics';
import { Patients } from './pages/Patients';
import { Staff } from './pages/Staff';
import { Beds } from './pages/Beds';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard Protected Layout Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/beds" element={<Beds />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
