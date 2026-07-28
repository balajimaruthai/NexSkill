import axios from 'axios';
import type { PredictionInput, PredictionResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('ewrp-user');
  if (user) {
    const { id } = JSON.parse(user);
    config.headers['x-user-id'] = id;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

// Prediction
export const predictionAPI = {
  predict: async (input: PredictionInput): Promise<PredictionResult> => {
    // Call ML API via backend proxy
    const res = await api.post('/predict', input);
    return res.data;
  },
  getHistory: () => api.get('/predictions'),
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

// Patients
export const patientAPI = {
  getAll: () => api.get('/patients'),
  create: (data: object) => api.post('/patients', data),
  update: (id: string, data: object) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// Staff
export const staffAPI = {
  getDoctors: () => api.get('/staff/doctors'),
  getNurses: () => api.get('/staff/nurses'),
};

// Beds
export const bedAPI = {
  getAll: () => api.get('/beds'),
  update: (id: string, data: object) => api.put(`/beds/${id}`, data),
};

// Alerts
export const alertAPI = {
  getAll: () => api.get('/alerts'),
  markRead: (id: string) => api.patch(`/alerts/${id}/read`),
};

// Reports
export const reportAPI = {
  getAll: () => api.get('/reports'),
  generate: (type: string) => api.post('/reports/generate', { type }),
};

// Analytics
export const analyticsAPI = {
  getAll: () => api.get('/analytics'),
};

export default api;
