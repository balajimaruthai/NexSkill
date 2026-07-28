import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Toaster } from 'react-hot-toast';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/prediction': 'AI Prediction',
  '/analytics': 'Analytics',
  '/patients': 'Patient Management',
  '/staff': 'Staff Management',
  '/beds': 'Bed Management',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/admin': 'Admin Panel',
  '/profile': 'My Profile',
  '/about': 'About',
  '/contact': 'Contact',
};

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true);
      else setCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const title = PAGE_TITLES[location.pathname] || 'EWRP System';
  const sidebarW = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
          },
        }}
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <TopNav sidebarCollapsed={collapsed} title={title} />
      <main
        className="transition-all duration-300 pt-16 min-h-screen"
        style={{ marginLeft: sidebarW }}
      >
        <Outlet />
      </main>
    </div>
  );
};
