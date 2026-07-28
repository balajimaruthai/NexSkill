import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5001;
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5002';

app.use(cors());
app.use(express.json());

// In-Memory Database / Mock Store
let db = {
  users: [
    {
      id: 'demo-001',
      email: 'doctor@aihealth.in',
      full_name: 'Dr. Rajesh Mehta',
      hospital_name: 'AIIMS Delhi',
      role: 'doctor',
      created_at: new Date().toISOString()
    }
  ],
  hospitals: [
    {
      id: 'hosp-001',
      name: 'AIIMS Delhi',
      location: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
      total_beds: 250,
      departments: ['Emergency', 'ICU', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
      contact: '+91 11 2658 8500',
      established: '1956'
    }
  ],
  patients: [
    { id: 'P001', name: 'Aarav Sharma', age: 45, gender: 'Male', severity: 3, status: 'In Treatment', ward: 'ICU', doctor: 'Dr. Mehta', admission_date: '2026-07-27', condition: 'Cardiac Arrest', contact: '+91 98765 43210' },
    { id: 'P002', name: 'Priya Patel', age: 32, gender: 'Female', severity: 2, status: 'Waiting', ward: 'Emergency', doctor: 'Dr. Singh', admission_date: '2026-07-28', condition: 'Fracture', contact: '+91 87654 32109' },
    { id: 'P003', name: 'Rohan Verma', age: 67, gender: 'Male', severity: 4, status: 'Admitted', ward: 'General', doctor: 'Dr. Kapoor', admission_date: '2026-07-26', condition: 'Pneumonia', contact: '+91 76543 21098' },
    { id: 'P004', name: 'Ananya Gupta', age: 28, gender: 'Female', severity: 1, status: 'Discharged', ward: 'OPD', doctor: 'Dr. Reddy', admission_date: '2026-07-25', condition: 'Fever', contact: '+91 65432 10987' },
    { id: 'P005', name: 'Vikram Singh', age: 52, gender: 'Male', severity: 3, status: 'In Treatment', ward: 'Surgery', doctor: 'Dr. Mehta', admission_date: '2026-07-27', condition: 'Appendicitis', contact: '+91 54321 09876' }
  ],
  doctors: [
    { id: 'D001', name: 'Dr. Rajesh Mehta', department: 'Cardiology', shift: 'morning', availability: 'available', specialization: 'Cardiologist', patients_count: 8, experience_years: 15, contact: '+91 98765 00001' },
    { id: 'D002', name: 'Dr. Priyanka Singh', department: 'Emergency', shift: 'afternoon', availability: 'busy', specialization: 'Emergency Medicine', patients_count: 12, experience_years: 10, contact: '+91 98765 00002' },
    { id: 'D003', name: 'Dr. Anil Kapoor', department: 'Neurology', shift: 'morning', availability: 'available', specialization: 'Neurologist', patients_count: 6, experience_years: 20, contact: '+91 98765 00003' }
  ],
  nurses: [
    { id: 'N001', name: 'Sunita Devi', department: 'Emergency', shift: 'morning', availability: 'busy', ward: 'Emergency', contact: '+91 98765 10001' },
    { id: 'N002', name: 'Kamla Yadav', department: 'ICU', shift: 'afternoon', availability: 'available', ward: 'ICU', contact: '+91 98765 10002' }
  ],
  beds: [
    { id: 'W001', ward: 'ICU', total: 20, occupied: 17, reserved: 2, emergency: 1, available: 0, occupancy_percent: 95 },
    { id: 'W002', ward: 'Emergency', total: 30, occupied: 22, reserved: 3, emergency: 5, available: 0, occupancy_percent: 100 },
    { id: 'W003', ward: 'General Ward', total: 80, occupied: 54, reserved: 6, emergency: 0, available: 20, occupancy_percent: 75 }
  ],
  alerts: [
    { id: 'A001', type: 'Rush Warning', message: 'High rush expected in next 2 hours. Emergency ward approaching capacity.', severity: 'high', action: 'Increase staff deployment immediately', created_at: new Date().toISOString(), is_read: false },
    { id: 'A002', type: 'ICU Alert', message: 'ICU occupancy at 95%. Prepare overflow protocol.', severity: 'critical', action: 'Prepare ICU overflow beds in Cardiology', created_at: new Date().toISOString(), is_read: false }
  ],
  predictions: []
};

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Emergency Ward Rush Prediction System Backend API',
    message: 'Backend server is active. Frontend UI is available at http://localhost:3001',
    endpoints: ['/api/health', '/api/patients', '/api/predict', '/api/stats', '/api/hospitals']
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', system: 'Emergency Ward Rush Prediction API', uptime: process.uptime() });
});

// Authentication APIs
app.post('/api/auth/register', (req, res) => {
  const { email, full_name, hospital_name, role, password } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newUser = {
    id: 'usr-' + Date.now(),
    email,
    full_name,
    hospital_name: hospital_name || 'General Hospital',
    role: role || 'doctor',
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);
  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user && email !== 'doctor@aihealth.in') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const loggedIn = user || db.users[0];
  res.json({ message: 'Login successful', user: loggedIn, token: 'mock-jwt-token-' + loggedIn.id });
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ message: 'Password reset link sent to registered email address.' });
});

// Prediction API Proxy
app.post('/api/predict', async (req, res) => {
  try {
    const input = req.body;
    let result;
    try {
      const mlRes = await axios.post(`${ML_API_URL}/predict`, input, { timeout: 3000 });
      result = mlRes.data;
    } catch (err) {
      // Fallback prediction calculation logic
      const pat = Number(input.Patient_Count || 50);
      const beds = Number(input.Available_Beds || 10);
      const wait = Number(input.Waiting_Time || 40);
      
      let rush = 'Low Rush';
      let prob = 75;
      if (pat > 80 || beds < 5 || wait > 60) {
        rush = 'High Rush';
        prob = 92;
      } else if (pat > 45 || beds < 15 || wait > 30) {
        rush = 'Medium Rush';
        prob = 84;
      }
      
      result = {
        rush_level: rush,
        probability: prob,
        confidence: 0.88,
        risk_score: prob,
        occupancy_percent: Math.min(Math.round((pat / (beds + pat)) * 100), 100),
        recommendations: rush === 'High Rush' 
          ? ['Increase emergency staff immediately', 'Prepare ICU beds', 'Notify ambulance control'] 
          : rush === 'Medium Rush' 
            ? ['Prepare additional staff', 'Monitor bed availability'] 
            : ['Maintain current staffing', 'Standard monitoring']
      };
    }

    const predictionRecord = {
      id: 'PR-' + Date.now(),
      ...result,
      input_data: input,
      created_at: new Date().toISOString()
    };
    db.predictions.unshift(predictionRecord);

    res.json(predictionRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate prediction', details: error.message });
  }
});

app.get('/api/predictions', (req, res) => {
  res.json(db.predictions);
});

// Dashboard Summary API
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    today_prediction: db.predictions[0]?.rush_level || 'Medium Rush',
    prediction_confidence: 87,
    hospital_occupancy: 68,
    emergency_cases: 23,
    patients_waiting: 41,
    doctors_available: 18,
    nurses_available: 34,
    beds_remaining: 47,
    total_patients: 1847,
    total_predictions: db.predictions.length + 342,
    avg_waiting_time: 38,
    emergency_admissions: 156
  });
});

// Patient CRUD APIs
app.get('/api/patients', (req, res) => res.json(db.patients));
app.post('/api/patients', (req, res) => {
  const newPatient = { id: 'P' + String(db.patients.length + 1).padStart(3, '0'), ...req.body };
  db.patients.unshift(newPatient);
  res.status(201).json(newPatient);
});
app.put('/api/patients/:id', (req, res) => {
  const idx = db.patients.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.patients[idx] = { ...db.patients[idx], ...req.body };
    return res.json(db.patients[idx]);
  }
  res.status(404).json({ error: 'Patient not found' });
});
app.delete('/api/patients/:id', (req, res) => {
  db.patients = db.patients.filter(p => p.id !== req.params.id);
  res.json({ message: 'Patient deleted successfully' });
});

// Staff APIs
app.get('/api/staff/doctors', (req, res) => res.json(db.doctors));
app.get('/api/staff/nurses', (req, res) => res.json(db.nurses));

// Bed Management APIs
app.get('/api/beds', (req, res) => res.json(db.beds));

// Alerts APIs
app.get('/api/alerts', (req, res) => res.json(db.alerts));
app.patch('/api/alerts/:id/read', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (alert) alert.is_read = true;
  res.json(alert || {});
});

// Reports & Analytics APIs
app.get('/api/reports', (req, res) => res.json([
  { id: 'REP-001', type: 'daily', period: '2026-07-28', total_predictions: 48, avg_occupancy: 71.5, peak_hour: '14:00 - 16:00', created_at: new Date().toISOString() }
]));

app.get('/api/analytics', (req, res) => res.json({
  daily_rush: [
    { hour: '00:00', rush: 20 }, { hour: '04:00', rush: 15 },
    { hour: '08:00', rush: 65 }, { hour: '12:00', rush: 85 },
    { hour: '16:00', rush: 90 }, { hour: '20:00', rush: 50 }
  ]
}));

app.listen(PORT, () => {
  console.log(`EWRP Node.js Express server running on port ${PORT}`);
});
