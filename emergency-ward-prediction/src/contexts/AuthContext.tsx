import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, AuthState, UserRole } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  full_name: string;
  email: string;
  hospital_name: string;
  role: string;
  password: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  register: async () => false,
});

const ROLE_PRESETS: Record<string, Partial<User>> = {
  'driver@ambulance.in': {
    id: 'drv-101',
    full_name: 'Rajesh Kumar',
    hospital_name: 'National Emergency Ambulance Service',
    role: 'ambulance_driver',
    vehicle_id: 'DL-01-AB-1088',
    phone: '+91 98111 22334'
  },
  'admin@aihealth.in': {
    id: 'adm-001',
    full_name: 'Dr. Vikram Admin',
    hospital_name: 'AIIMS Delhi Control Hub',
    role: 'admin',
    phone: '+91 11 2658 8500'
  },
  'superadmin@ewrp.gov.in': {
    id: 'sp-001',
    full_name: 'Director General Health',
    hospital_name: 'Ministry of Health & Family Welfare',
    role: 'super_admin',
    phone: '+91 11 2306 1000'
  },
  'doctor@aihealth.in': {
    id: 'doc-001',
    full_name: 'Dr. Rajesh Mehta',
    hospital_name: 'AIIMS Delhi',
    role: 'doctor',
    phone: '+91 98765 43210'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ewrp-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Fast responsive login
    const preset = ROLE_PRESETS[email.toLowerCase()] || {
      id: 'usr-' + Date.now(),
      full_name: email.split('@')[0].toUpperCase(),
      hospital_name: 'AIIMS Delhi',
      role: 'doctor' as UserRole,
    };

    const loggedUser: User = {
      id: preset.id || 'usr-01',
      email,
      full_name: preset.full_name || 'Medical Officer',
      hospital_name: preset.hospital_name || 'AIIMS Delhi',
      role: preset.role || 'doctor',
      vehicle_id: preset.vehicle_id,
      phone: preset.phone || '+91 98765 00000',
      created_at: new Date().toISOString(),
    };

    setUser(loggedUser);
    localStorage.setItem('ewrp-user', JSON.stringify(loggedUser));
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ewrp-user');
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      full_name: data.full_name,
      hospital_name: data.hospital_name,
      role: (data.role || 'doctor') as UserRole,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('ewrp-user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
