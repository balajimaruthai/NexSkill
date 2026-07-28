// TypeScript types for the Emergency Ward Rush Prediction System

export type RushLevel = 'Low Rush' | 'Medium Rush' | 'High Rush';

export type UserRole = 'admin' | 'super_admin' | 'doctor' | 'nurse' | 'staff' | 'manager' | 'ambulance_driver';

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'emergency';

export type StaffAvailability = 'available' | 'busy' | 'off-duty';

export type DriverStatus = 'available' | 'dispatched' | 'en_route' | 'off-duty';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ShiftType = 'morning' | 'afternoon' | 'night';

// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  hospital_name: string;
  role: UserRole;
  phone?: string;
  vehicle_id?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Prediction types
export interface PredictionInput {
  Patient_Count: number;
  Available_Beds: number;
  Doctor_Count: number;
  Nurse_Count: number;
  Severity_Level: number;
  Ambulance_Arrivals: number;
  Waiting_Time: number;
  Weather: string;
  Holiday: number;
  Time_of_Day: string;
  Day_of_Week: string;
}

export interface PredictionResult {
  id?: string;
  rush_level: RushLevel;
  probability: number;
  confidence: number;
  recommendations: string[];
  input_data?: PredictionInput;
  created_at?: string;
}

// Patient types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  severity: number;
  status: 'Waiting' | 'In Treatment' | 'Admitted' | 'Discharged';
  ward: string;
  doctor: string;
  admission_date: string;
  condition: string;
  contact: string;
}

// Staff types
export interface Doctor {
  id: string;
  name: string;
  department: string;
  shift: ShiftType;
  availability: StaffAvailability;
  specialization: string;
  patients_count: number;
  experience_years: number;
  contact: string;
  avatar?: string;
}

export interface Nurse {
  id: string;
  name: string;
  department: string;
  shift: ShiftType;
  availability: StaffAvailability;
  ward: string;
  contact: string;
  avatar?: string;
}

// Bed types
export interface Bed {
  id: string;
  ward: string;
  total: number;
  occupied: number;
  reserved: number;
  emergency: number;
  available: number;
  occupancy_percent: number;
}

// Alert types
export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: AlertSeverity;
  action?: string;
  created_at: string;
  is_read: boolean;
}

// Dashboard types
export interface DashboardStats {
  today_prediction: RushLevel;
  prediction_confidence: number;
  hospital_occupancy: number;
  emergency_cases: number;
  patients_waiting: number;
  doctors_available: number;
  nurses_available: number;
  beds_remaining: number;
  total_patients: number;
  total_predictions: number;
  avg_waiting_time: number;
  emergency_admissions: number;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  low?: number;
  medium?: number;
  high?: number;
}

export interface WeeklyRushData {
  day: string;
  low: number;
  medium: number;
  high: number;
}

// Report types
export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  period: string;
  total_predictions: number;
  avg_occupancy: number;
  peak_hour: string;
  rush_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  created_at: string;
}

// Analytics types
export interface AnalyticsData {
  date: string;
  rush_level: RushLevel;
  wait_time: number;
  occupancy: number;
  patient_count: number;
  emergency_cases: number;
}

// Realtime Connected Hospital type with real location & phone numbers
export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  total_beds: number;
  free_emergency_beds: number;
  free_icu_beds: number;
  doctors_available: number;
  emergency_contact: string;
  ambulance_helpline: string;
  status: 'freely_available' | 'moderate' | 'full_capacity';
  last_updated: string;
}

// Connected Ambulance Driver
export interface AmbulanceDriver {
  id: string;
  driver_name: string;
  vehicle_number: string;
  phone: string;
  status: DriverStatus;
  current_location: string;
  destination_hospital?: string;
  patient_condition?: string;
  assigned_time?: string;
}

// Global Admin Broadcast Update
export interface BroadcastUpdate {
  id: string;
  title: string;
  message: string;
  category: 'urgent_alert' | 'ward_update' | 'traffic_reroute' | 'general';
  posted_by: string;
  hospital_name: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  hospital_name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string;
  created_at: string;
}

// Theme
export type ThemeMode = 'light' | 'dark';

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  is_read: boolean;
}
