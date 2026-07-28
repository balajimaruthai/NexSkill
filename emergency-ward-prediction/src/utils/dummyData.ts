// Dummy data for Emergency Ward Rush Prediction System
import type {
  Patient, Doctor, Nurse, Bed, Alert, DashboardStats,
  PredictionResult, Report, AnalyticsData, AdminUser,
  WeeklyRushData, ChartDataPoint, Notification, Hospital,
  AmbulanceDriver, BroadcastUpdate
} from '../types';

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const dummyDashboardStats: DashboardStats = {
  today_prediction: 'Medium Rush',
  prediction_confidence: 87,
  hospital_occupancy: 68,
  emergency_cases: 23,
  patients_waiting: 41,
  doctors_available: 18,
  nurses_available: 34,
  beds_remaining: 47,
  total_patients: 1847,
  total_predictions: 342,
  avg_waiting_time: 38,
  emergency_admissions: 156,
};

// ─── Patients ────────────────────────────────────────────────────────────────
export const dummyPatients: Patient[] = [
  { id: 'P001', name: 'Aarav Sharma', age: 45, gender: 'Male', severity: 3, status: 'In Treatment', ward: 'ICU', doctor: 'Dr. Mehta', admission_date: '2026-07-27', condition: 'Cardiac Arrest', contact: '+91 98765 43210' },
  { id: 'P002', name: 'Priya Patel', age: 32, gender: 'Female', severity: 2, status: 'Waiting', ward: 'Emergency', doctor: 'Dr. Singh', admission_date: '2026-07-28', condition: 'Fracture', contact: '+91 87654 32109' },
  { id: 'P003', name: 'Rohan Verma', age: 67, gender: 'Male', severity: 4, status: 'Admitted', ward: 'General', doctor: 'Dr. Kapoor', admission_date: '2026-07-26', condition: 'Pneumonia', contact: '+91 76543 21098' },
  { id: 'P004', name: 'Ananya Gupta', age: 28, gender: 'Female', severity: 1, status: 'Discharged', ward: 'OPD', doctor: 'Dr. Reddy', admission_date: '2026-07-25', condition: 'Fever', contact: '+91 65432 10987' },
  { id: 'P005', name: 'Vikram Singh', age: 52, gender: 'Male', severity: 3, status: 'In Treatment', ward: 'Surgery', doctor: 'Dr. Mehta', admission_date: '2026-07-27', condition: 'Appendicitis', contact: '+91 54321 09876' },
  { id: 'P006', name: 'Meera Nair', age: 41, gender: 'Female', severity: 2, status: 'Waiting', ward: 'Emergency', doctor: 'Dr. Kumar', admission_date: '2026-07-28', condition: 'Severe Asthma', contact: '+91 43210 98765' },
  { id: 'P007', name: 'Arjun Das', age: 19, gender: 'Male', severity: 1, status: 'Admitted', ward: 'General', doctor: 'Dr. Singh', admission_date: '2026-07-28', condition: 'Sports Injury', contact: '+91 32109 87654' },
  { id: 'P008', name: 'Kavya Menon', age: 60, gender: 'Female', severity: 4, status: 'In Treatment', ward: 'ICU', doctor: 'Dr. Kapoor', admission_date: '2026-07-26', condition: 'Stroke', contact: '+91 21098 76543' },
  { id: 'P009', name: 'Sanjay Joshi', age: 38, gender: 'Male', severity: 2, status: 'Waiting', ward: 'Emergency', doctor: 'Dr. Reddy', admission_date: '2026-07-28', condition: 'Chest Pain', contact: '+91 10987 65432' },
  { id: 'P010', name: 'Deepa Rao', age: 55, gender: 'Female', severity: 3, status: 'Admitted', ward: 'Cardiology', doctor: 'Dr. Mehta', admission_date: '2026-07-27', condition: 'Heart Disease', contact: '+91 09876 54321' },
  { id: 'P011', name: 'Rahul Mishra', age: 29, gender: 'Male', severity: 1, status: 'Discharged', ward: 'OPD', doctor: 'Dr. Kumar', admission_date: '2026-07-24', condition: 'Minor Cuts', contact: '+91 98765 10234' },
  { id: 'P012', name: 'Pooja Sharma', age: 35, gender: 'Female', severity: 2, status: 'In Treatment', ward: 'General', doctor: 'Dr. Singh', admission_date: '2026-07-28', condition: 'Dengue Fever', contact: '+91 87654 10123' },
];

// ─── Doctors ─────────────────────────────────────────────────────────────────
export const dummyDoctors: Doctor[] = [
  { id: 'D001', name: 'Dr. Rajesh Mehta', department: 'Cardiology', shift: 'morning', availability: 'available', specialization: 'Cardiologist', patients_count: 8, experience_years: 15, contact: '+91 98765 00001' },
  { id: 'D002', name: 'Dr. Priyanka Singh', department: 'Emergency', shift: 'afternoon', availability: 'busy', specialization: 'Emergency Medicine', patients_count: 12, experience_years: 10, contact: '+91 98765 00002' },
  { id: 'D003', name: 'Dr. Anil Kapoor', department: 'Neurology', shift: 'morning', availability: 'available', specialization: 'Neurologist', patients_count: 6, experience_years: 20, contact: '+91 98765 00003' },
  { id: 'D004', name: 'Dr. Sneha Reddy', department: 'Orthopedics', shift: 'night', availability: 'off-duty', specialization: 'Orthopedic Surgeon', patients_count: 4, experience_years: 12, contact: '+91 98765 00004' },
  { id: 'D005', name: 'Dr. Mohan Kumar', department: 'Pediatrics', shift: 'morning', availability: 'available', specialization: 'Pediatrician', patients_count: 9, experience_years: 8, contact: '+91 98765 00005' },
  { id: 'D006', name: 'Dr. Anita Sharma', department: 'ICU', shift: 'afternoon', availability: 'busy', specialization: 'Intensivist', patients_count: 5, experience_years: 18, contact: '+91 98765 00006' },
  { id: 'D007', name: 'Dr. Suresh Patel', department: 'Surgery', shift: 'morning', availability: 'available', specialization: 'General Surgeon', patients_count: 7, experience_years: 14, contact: '+91 98765 00007' },
  { id: 'D008', name: 'Dr. Lakshmi Nair', department: 'Gynecology', shift: 'afternoon', availability: 'available', specialization: 'Gynecologist', patients_count: 10, experience_years: 16, contact: '+91 98765 00008' },
];

// ─── Nurses ──────────────────────────────────────────────────────────────────
export const dummyNurses: Nurse[] = [
  { id: 'N001', name: 'Sunita Devi', department: 'Emergency', shift: 'morning', availability: 'busy', ward: 'Emergency', contact: '+91 98765 10001' },
  { id: 'N002', name: 'Kamla Yadav', department: 'ICU', shift: 'afternoon', availability: 'available', ward: 'ICU', contact: '+91 98765 10002' },
  { id: 'N003', name: 'Rekha Pandey', department: 'General', shift: 'night', availability: 'off-duty', ward: 'General Ward', contact: '+91 98765 10003' },
  { id: 'N004', name: 'Anita Gupta', department: 'Cardiology', shift: 'morning', availability: 'available', ward: 'Cardiology', contact: '+91 98765 10004' },
  { id: 'N005', name: 'Geeta Singh', department: 'Pediatrics', shift: 'morning', availability: 'busy', ward: 'Pediatric Ward', contact: '+91 98765 10005' },
  { id: 'N006', name: 'Meena Sharma', department: 'Surgery', shift: 'afternoon', availability: 'available', ward: 'Surgical Ward', contact: '+91 98765 10006' },
  { id: 'N007', name: 'Pooja Verma', department: 'Orthopedics', shift: 'night', availability: 'available', ward: 'Ortho Ward', contact: '+91 98765 10007' },
  { id: 'N008', name: 'Rashmi Joshi', department: 'Emergency', shift: 'afternoon', availability: 'busy', ward: 'Emergency', contact: '+91 98765 10008' },
];

// ─── Beds ─────────────────────────────────────────────────────────────────────
export const dummyBeds: Bed[] = [
  { id: 'W001', ward: 'ICU', total: 20, occupied: 17, reserved: 2, emergency: 1, available: 0, occupancy_percent: 95 },
  { id: 'W002', ward: 'Emergency', total: 30, occupied: 22, reserved: 3, emergency: 5, available: 0, occupancy_percent: 100 },
  { id: 'W003', ward: 'General Ward', total: 80, occupied: 54, reserved: 6, emergency: 0, available: 20, occupancy_percent: 75 },
  { id: 'W004', ward: 'Cardiology', total: 25, occupied: 18, reserved: 3, emergency: 1, available: 3, occupancy_percent: 88 },
  { id: 'W005', ward: 'Surgery', total: 15, occupied: 9, reserved: 2, emergency: 0, available: 4, occupancy_percent: 73 },
  { id: 'W006', ward: 'Pediatrics', total: 20, occupied: 8, reserved: 2, emergency: 0, available: 10, occupancy_percent: 50 },
  { id: 'W007', ward: 'Orthopedics', total: 18, occupied: 11, reserved: 2, emergency: 0, available: 5, occupancy_percent: 72 },
  { id: 'W008', ward: 'Gynecology', total: 22, occupied: 10, reserved: 3, emergency: 0, available: 9, occupancy_percent: 59 },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const dummyAlerts: Alert[] = [
  { id: 'A001', type: 'Rush Warning', message: 'High rush expected in next 2 hours. Emergency ward approaching capacity.', severity: 'high', action: 'Increase staff deployment immediately', created_at: '2026-07-28T09:30:00', is_read: false },
  { id: 'A002', type: 'ICU Alert', message: 'ICU occupancy at 95%. Prepare overflow protocol.', severity: 'critical', action: 'Prepare ICU overflow beds in Cardiology', created_at: '2026-07-28T09:15:00', is_read: false },
  { id: 'A003', type: 'Staff Shortage', message: 'Nurse-to-patient ratio below recommended level in Emergency Ward.', severity: 'high', action: 'Call additional nurses on standby', created_at: '2026-07-28T08:45:00', is_read: true },
  { id: 'A004', type: 'Ambulance Alert', message: '3 ambulances en route with critical patients. ETA: 15 minutes.', severity: 'critical', action: 'Prepare trauma rooms and notify surgical team', created_at: '2026-07-28T10:00:00', is_read: false },
  { id: 'A005', type: 'Bed Capacity', message: 'Emergency ward beds at 100% capacity. Divert incoming non-critical patients.', severity: 'critical', action: 'Activate patient diversion protocol', created_at: '2026-07-28T09:55:00', is_read: false },
  { id: 'A006', type: 'Medication Alert', message: 'Critical medication stock running low: Epinephrine, Morphine.', severity: 'medium', action: 'Contact pharmacy for emergency restock', created_at: '2026-07-28T08:00:00', is_read: true },
  { id: 'A007', type: 'Prediction Update', message: 'AI model updated prediction: Medium Rush expected this afternoon.', severity: 'low', action: 'Review staffing schedule for afternoon shift', created_at: '2026-07-28T07:30:00', is_read: true },
  { id: 'A008', type: 'Weather Advisory', message: 'Heavy rainfall expected. Historically increases emergency admissions by 30%.', severity: 'medium', action: 'Pre-position additional emergency resources', created_at: '2026-07-28T06:00:00', is_read: true },
];

// ─── Prediction History ───────────────────────────────────────────────────────
export const dummyPredictions: PredictionResult[] = [
  { id: 'PR001', rush_level: 'High Rush', probability: 0.91, confidence: 0.94, recommendations: ['Increase emergency staff immediately', 'Prepare ICU beds', 'Notify ambulance control', 'Activate overflow protocol'], created_at: '2026-07-28T09:00:00' },
  { id: 'PR002', rush_level: 'Medium Rush', probability: 0.65, confidence: 0.78, recommendations: ['Prepare additional staff', 'Monitor bed availability', 'Alert senior nurses'], created_at: '2026-07-28T06:00:00' },
  { id: 'PR003', rush_level: 'Low Rush', probability: 0.24, confidence: 0.89, recommendations: ['Maintain current staffing', 'Standard monitoring'], created_at: '2026-07-27T21:00:00' },
  { id: 'PR004', rush_level: 'High Rush', probability: 0.88, confidence: 0.91, recommendations: ['Increase emergency staff immediately', 'Prepare ICU beds', 'Notify ambulance control'], created_at: '2026-07-27T15:00:00' },
  { id: 'PR005', rush_level: 'Medium Rush', probability: 0.58, confidence: 0.82, recommendations: ['Prepare additional staff', 'Monitor bed availability'], created_at: '2026-07-27T12:00:00' },
];

// ─── Weekly Rush Chart Data ───────────────────────────────────────────────────
export const weeklyRushData: WeeklyRushData[] = [
  { day: 'Mon', low: 4, medium: 3, high: 2 },
  { day: 'Tue', low: 3, medium: 4, high: 3 },
  { day: 'Wed', low: 5, medium: 2, high: 2 },
  { day: 'Thu', low: 2, medium: 5, high: 4 },
  { day: 'Fri', low: 2, medium: 3, high: 6 },
  { day: 'Sat', low: 4, medium: 4, high: 3 },
  { day: 'Sun', low: 6, medium: 3, high: 2 },
];

// ─── Patient Trend Data ───────────────────────────────────────────────────────
export const patientTrendData: ChartDataPoint[] = [
  { name: '00:00', value: 45 },
  { name: '02:00', value: 38 },
  { name: '04:00', value: 30 },
  { name: '06:00', value: 42 },
  { name: '08:00', value: 78 },
  { name: '10:00', value: 95 },
  { name: '12:00', value: 110 },
  { name: '14:00', value: 102 },
  { name: '16:00', value: 115 },
  { name: '18:00', value: 130 },
  { name: '20:00', value: 108 },
  { name: '22:00', value: 72 },
];

// ─── Monthly Analytics ────────────────────────────────────────────────────────
export const monthlyAnalytics: ChartDataPoint[] = [
  { name: 'Jan', value: 1240, low: 400, medium: 520, high: 320 },
  { name: 'Feb', value: 1180, low: 380, medium: 490, high: 310 },
  { name: 'Mar', value: 1350, low: 420, medium: 560, high: 370 },
  { name: 'Apr', value: 1420, low: 450, medium: 580, high: 390 },
  { name: 'May', value: 1380, low: 440, medium: 570, high: 370 },
  { name: 'Jun', value: 1510, low: 480, medium: 610, high: 420 },
  { name: 'Jul', value: 1620, low: 510, medium: 650, high: 460 },
];

// ─── Bed Usage Over Time ──────────────────────────────────────────────────────
export const bedUsageData: ChartDataPoint[] = [
  { name: 'Mon', value: 72 },
  { name: 'Tue', value: 78 },
  { name: 'Wed', value: 65 },
  { name: 'Thu', value: 82 },
  { name: 'Fri', value: 88 },
  { name: 'Sat', value: 79 },
  { name: 'Sun', value: 68 },
];

// ─── Prediction Accuracy ──────────────────────────────────────────────────────
export const predictionAccuracyData: ChartDataPoint[] = [
  { name: 'Week 1', value: 94 },
  { name: 'Week 2', value: 96 },
  { name: 'Week 3', value: 95 },
  { name: 'Week 4', value: 97 },
];

// ─── Peak Hours Heatmap ───────────────────────────────────────────────────────
export const peakHoursData = [
  { hour: '6AM', mon: 45, tue: 50, wed: 42, thu: 48, fri: 52, sat: 38, sun: 35 },
  { hour: '9AM', mon: 78, tue: 82, wed: 75, thu: 80, fri: 88, sat: 62, sun: 55 },
  { hour: '12PM', mon: 95, tue: 98, wed: 92, thu: 96, fri: 105, sat: 78, sun: 70 },
  { hour: '3PM', mon: 88, tue: 92, wed: 85, thu: 90, fri: 98, sat: 75, sun: 68 },
  { hour: '6PM', mon: 110, tue: 115, wed: 108, thu: 112, fri: 125, sat: 90, sun: 82 },
  { hour: '9PM', mon: 82, tue: 85, wed: 78, thu: 83, fri: 92, sat: 70, sun: 65 },
];

// ─── Reports ──────────────────────────────────────────────────────────────────
export const dummyReports: Report[] = [
  { id: 'R001', type: 'daily', period: '2026-07-28', total_predictions: 48, avg_occupancy: 72, peak_hour: '6:00 PM', rush_distribution: { low: 15, medium: 20, high: 13 }, created_at: '2026-07-28T23:59:59' },
  { id: 'R002', type: 'weekly', period: 'July 22-28, 2026', total_predictions: 336, avg_occupancy: 68, peak_hour: 'Friday 6PM', rush_distribution: { low: 112, medium: 140, high: 84 }, created_at: '2026-07-28T23:59:59' },
  { id: 'R003', type: 'monthly', period: 'July 2026', total_predictions: 1440, avg_occupancy: 70, peak_hour: 'Weekday 6PM', rush_distribution: { low: 480, medium: 600, high: 360 }, created_at: '2026-07-28T23:59:59' },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const dummyAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 6, i + 1).toISOString().split('T')[0],
  rush_level: ['Low Rush', 'Medium Rush', 'High Rush'][Math.floor(Math.random() * 3)] as any,
  wait_time: Math.floor(Math.random() * 60) + 15,
  occupancy: Math.floor(Math.random() * 40) + 50,
  patient_count: Math.floor(Math.random() * 80) + 60,
  emergency_cases: Math.floor(Math.random() * 20) + 10,
}));

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const dummyAdminUsers: AdminUser[] = [
  { id: 'U001', email: 'admin@aihealth.in', full_name: 'Dr. System Admin', hospital_name: 'AIIMS Delhi', role: 'admin', status: 'active', last_login: '2026-07-28T09:00:00', created_at: '2026-01-01' },
  { id: 'U002', email: 'rajesh.mehta@aihealth.in', full_name: 'Dr. Rajesh Mehta', hospital_name: 'AIIMS Delhi', role: 'doctor', status: 'active', last_login: '2026-07-28T07:30:00', created_at: '2026-02-15' },
  { id: 'U003', email: 'priya.singh@aihealth.in', full_name: 'Dr. Priya Singh', hospital_name: 'Apollo Hospital', role: 'doctor', status: 'active', last_login: '2026-07-27T22:00:00', created_at: '2026-03-01' },
  { id: 'U004', email: 'manager@fortis.in', full_name: 'Amit Sharma', hospital_name: 'Fortis Healthcare', role: 'manager', status: 'active', last_login: '2026-07-28T08:00:00', created_at: '2026-04-10' },
  { id: 'U005', email: 'nurse.head@aihealth.in', full_name: 'Sunita Devi', hospital_name: 'AIIMS Delhi', role: 'nurse', status: 'active', last_login: '2026-07-28T06:00:00', created_at: '2026-02-28' },
  { id: 'U006', email: 'staff@maxhealth.in', full_name: 'Rakesh Gupta', hospital_name: 'Max Healthcare', role: 'staff', status: 'inactive', last_login: '2026-07-20T10:00:00', created_at: '2026-05-20' },
];

// ─── Hospitals with GPS & Real Emergency Helpline Numbers ────────────────────
export const dummyHospitals: Hospital[] = [
  {
    id: 'H001',
    name: 'AIIMS Delhi (All India Institute of Medical Sciences)',
    city: 'New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
    lat: 28.5672,
    lng: 77.2100,
    total_beds: 2478,
    free_emergency_beds: 18,
    free_icu_beds: 4,
    doctors_available: 24,
    emergency_contact: '+91 11 2658 8500',
    ambulance_helpline: '102 / 108',
    status: 'freely_available',
    last_updated: 'Just now (1 min ago)'
  },
  {
    id: 'H002',
    name: 'Apollo Hospital Main',
    city: 'Chennai / New Delhi',
    address: '21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006',
    lat: 13.0604,
    lng: 80.2496,
    total_beds: 1500,
    free_emergency_beds: 12,
    free_icu_beds: 2,
    doctors_available: 16,
    emergency_contact: '+91 44 2829 0200',
    ambulance_helpline: '1066',
    status: 'freely_available',
    last_updated: 'Just now (1 min ago)'
  },
  {
    id: 'H003',
    name: 'Fortis Escorts Heart & Trauma Institute',
    city: 'New Delhi / Gurugram',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi 110025',
    lat: 28.5606,
    lng: 77.2727,
    total_beds: 900,
    free_emergency_beds: 5,
    free_icu_beds: 1,
    doctors_available: 10,
    emergency_contact: '+91 11 4713 5000',
    ambulance_helpline: '+91 11 10501',
    status: 'moderate',
    last_updated: '2 mins ago'
  },
  {
    id: 'H004',
    name: 'Max Super Speciality Hospital Saket',
    city: 'New Delhi',
    address: '1 Press Enclave Marg, Saket, New Delhi 110017',
    lat: 28.5284,
    lng: 77.2120,
    total_beds: 1200,
    free_emergency_beds: 0,
    free_icu_beds: 0,
    doctors_available: 8,
    emergency_contact: '+91 11 2651 5050',
    ambulance_helpline: '+91 11 4055 4055',
    status: 'full_capacity',
    last_updated: 'Just now (1 min ago)'
  },
  {
    id: 'H005',
    name: 'Manipal Hospital HAL Airport Road',
    city: 'Bengaluru',
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
    lat: 12.9582,
    lng: 77.6484,
    total_beds: 600,
    free_emergency_beds: 14,
    free_icu_beds: 6,
    doctors_available: 15,
    emergency_contact: '+91 80 2502 4444',
    ambulance_helpline: '1800 102 4647',
    status: 'freely_available',
    last_updated: '1 min ago'
  }
];

// ─── Connected Ambulance Drivers ─────────────────────────────────────────────
export const dummyDrivers: AmbulanceDriver[] = [
  {
    id: 'AMB-101',
    driver_name: 'Rajesh Kumar',
    vehicle_number: 'DL-01-AB-1088',
    phone: '+91 98111 22334',
    status: 'en_route',
    current_location: 'Ring Road Near AIIMS Flyover',
    destination_hospital: 'AIIMS Delhi',
    patient_condition: 'Cardiac Emergency (Severe)',
    assigned_time: '14:15 PM'
  },
  {
    id: 'AMB-102',
    driver_name: 'Suresh Yadav',
    vehicle_number: 'DL-04-CD-4412',
    phone: '+91 98222 33445',
    status: 'available',
    current_location: 'Connaught Place Stand',
    assigned_time: '14:00 PM'
  },
  {
    id: 'AMB-103',
    driver_name: 'Vikram Singh',
    vehicle_number: 'TN-01-XY-9090',
    phone: '+91 98333 44556',
    status: 'dispatched',
    current_location: 'Anna Salai Near Apollo',
    destination_hospital: 'Apollo Hospital Main',
    patient_condition: 'Polytrauma / Fracture',
    assigned_time: '14:20 PM'
  },
  {
    id: 'AMB-104',
    driver_name: 'Dharmendra Sharma',
    vehicle_number: 'KA-03-MN-7811',
    phone: '+91 98444 55667',
    status: 'available',
    current_location: 'Indiranagar Metro Stand',
    assigned_time: '13:50 PM'
  }
];

// ─── Global Admin Broadcast Updates ──────────────────────────────────────────
export const dummyBroadcasts: BroadcastUpdate[] = [
  {
    id: 'BC-001',
    title: '🚨 Mass Casualty Diversion Notice',
    message: 'Max Saket Emergency Ward has reached 100% capacity due to highway pileup. Reroute all non-critical ambulances to AIIMS Delhi or Fortis Escorts.',
    category: 'urgent_alert',
    posted_by: 'Super Admin (Dr. System Director)',
    hospital_name: 'Central Control Hub',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    priority: 'critical'
  },
  {
    id: 'BC-002',
    title: '🛏️ AIIMS Delhi Opened 18 Free Emergency Beds',
    message: 'ICU overflow ward B has been activated. 18 emergency beds and 4 ICU beds are ready for instant patient admission.',
    category: 'ward_update',
    posted_by: 'Chief Emergency Officer',
    hospital_name: 'AIIMS Delhi',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    priority: 'high'
  },
  {
    id: 'BC-003',
    title: '🚙 Traffic Advisory for Ambulance Drivers',
    message: 'Road construction near Ring Road Ashram flyover causing 15 min delays. Use Outer Ring Road corridor for fast access to Fortis Escorts.',
    category: 'traffic_reroute',
    posted_by: 'Traffic Control Division',
    hospital_name: 'National Emergency Dispatch',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    priority: 'medium'
  }
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const dummyNotifications: Notification[] = [
  { id: 'NT001', title: 'High Rush Alert', message: 'Emergency ward approaching critical capacity', type: 'error', created_at: '2026-07-28T10:00:00', is_read: false },
  { id: 'NT002', title: 'Prediction Complete', message: 'AI model predicted Medium Rush for 2:00 PM', type: 'info', created_at: '2026-07-28T09:45:00', is_read: false },
  { id: 'NT003', title: 'New Patient Admitted', message: 'Critical patient admitted to ICU (P-1247)', type: 'warning', created_at: '2026-07-28T09:30:00', is_read: true },
  { id: 'NT004', title: 'Report Generated', message: 'Weekly report for July 22-28 is ready', type: 'success', created_at: '2026-07-28T09:00:00', is_read: true },
  { id: 'NT005', title: 'Staff Update', message: 'Dr. Kapoor shift changed to morning', type: 'info', created_at: '2026-07-28T08:00:00', is_read: true },
];

// ─── Admission / Discharge Chart ──────────────────────────────────────────────
export const admissionDischargeData = [
  { name: 'Mon', admissions: 45, discharges: 38 },
  { name: 'Tue', admissions: 52, discharges: 44 },
  { name: 'Wed', admissions: 38, discharges: 42 },
  { name: 'Thu', admissions: 61, discharges: 48 },
  { name: 'Fri', admissions: 70, discharges: 55 },
  { name: 'Sat', admissions: 58, discharges: 50 },
  { name: 'Sun', admissions: 42, discharges: 46 },
];

// ─── Feature Importance ───────────────────────────────────────────────────────
export const featureImportanceData = [
  { feature: 'Patient Count', importance: 0.28 },
  { feature: 'Available Beds', importance: 0.22 },
  { feature: 'Severity Level', importance: 0.18 },
  { feature: 'Waiting Time', importance: 0.12 },
  { feature: 'Ambulance Arrivals', importance: 0.09 },
  { feature: 'Time of Day', importance: 0.05 },
  { feature: 'Weather', importance: 0.03 },
  { feature: 'Day of Week', importance: 0.02 },
  { feature: 'Doctor Count', importance: 0.01 },
];

// ─── Statistics for Landing ───────────────────────────────────────────────────
export const hospitalStats = [
  { label: 'Total Patients Served', value: 128450, suffix: '+' },
  { label: 'Prediction Accuracy', value: 97, suffix: '%' },
  { label: 'Hospitals Using AI', value: 142, suffix: '+' },
  { label: 'Avg. Response Time', value: 2.4, suffix: 'min', isDecimal: true },
  { label: 'Lives Saved', value: 8700, suffix: '+' },
  { label: 'AI Predictions Made', value: 45000, suffix: '+' },
];

export const monthlyRushData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  rush_score: Math.floor(40 + Math.sin(i / 2) * 35 + Math.random() * 15),
  accuracy: Math.floor(95 + Math.random() * 4)
}));

