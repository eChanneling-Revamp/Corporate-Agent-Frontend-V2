import { Agent, Doctor, Appointment, Payment, Report, DashboardStats } from './types';

// FINAL ATTEMPT - RUNTIME API URL OVERRIDE
const API_BASE = (() => {
  // ALWAYS use production API in browser
  if (typeof window !== 'undefined') {
    // Force production API URL regardless of environment
    return 'https://corporate-agent-backend-v2.onrender.com/api';
  }
  // Server-side fallback (should never be used in static export)
  return 'https://corporate-agent-backend-v2.onrender.com/api';
})();

// Clean production logging
if (typeof window !== 'undefined') {
  console.log('✅ Production API configured:', API_BASE);
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    logout: async () => {
      const response = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      return response.json();
    },
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const response = await fetch(`${API_BASE}/dashboard`);
      return response.json();
    },
  },

  doctors: {
    search: async (filters: any): Promise<Doctor[]> => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/doctors?${params}`);
      return response.json();
    },
    getById: async (id: string): Promise<Doctor> => {
      const response = await fetch(`${API_BASE}/doctors/${id}`);
      return response.json();
    },
  },

  appointments: {
    create: async (data: any): Promise<Appointment> => {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    bulkCreate: async (data: any[]): Promise<Appointment[]> => {
      const response = await fetch(`${API_BASE}/appointments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    getAll: async (filters?: any): Promise<Appointment[]> => {
      const params = filters ? new URLSearchParams(filters) : '';
      const response = await fetch(`${API_BASE}/appointments${params ? '?' + params : ''}`);
      return response.json();
    },
    getUnpaid: async (): Promise<Appointment[]> => {
      const response = await fetch(`${API_BASE}/appointments/unpaid`);
      return response.json();
    },
    confirm: async (id: string): Promise<Appointment> => {
      const response = await fetch(`${API_BASE}/appointments/confirm/${id}`, {
        method: 'PUT',
      });
      return response.json();
    },
    cancel: async (id: string, reason: string): Promise<void> => {
      await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    },
  },

  payments: {
    getAll: async (): Promise<Payment[]> => {
      const response = await fetch(`${API_BASE}/payments`);
      return response.json();
    },
    create: async (data: any): Promise<Payment> => {
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    updateStatus: async (id: string, status: string): Promise<Payment> => {
      const response = await fetch(`${API_BASE}/payments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
  },

  reports: {
    generate: async (filters: any): Promise<Report> => {
      const response = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      return response.json();
    },
    getAll: async (): Promise<Report[]> => {
      const response = await fetch(`${API_BASE}/reports`);
      return response.json();
    },
  },

  profile: {
    get: async (): Promise<Agent> => {
      const response = await fetch(`${API_BASE}/profile`);
      return response.json();
    },
    update: async (data: any): Promise<Agent> => {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
};
