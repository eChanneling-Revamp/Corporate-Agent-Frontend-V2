import { Agent, Doctor, Appointment, Payment, Report, DashboardStats } from './types';

// DEVELOPMENT OVERRIDE - Use local API when running locally
const API_BASE = (() => {
  // Use local API when running in development
  if (typeof window !== 'undefined') {
    // Check if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    // Use production API for deployed frontend
    return 'https://corporate-agent-backend-v2.onrender.com/api';
  }
  // Server-side fallback
  return 'http://localhost:3001/api';
})();

// Clean production logging
if (typeof window !== 'undefined') {
  console.log('[CONFIG] Production API configured:', API_BASE);
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
    bulkCreate: async (data: any[]): Promise<any> => {
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
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE}/appointments/unpaid?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.json();
    },
    confirm: async (id: string): Promise<Appointment> => {
      const response = await fetch(`${API_BASE}/appointments/${id}/confirm`, {
        method: 'POST',
      });
      return response.json();
    },
    cancel: async (id: string, reason: string): Promise<void> => {
      const response = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return response.json();
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

  notifications: {
    getAll: async (): Promise<any> => {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE}/notifications?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.json();
    },
    markAsRead: async (id: string): Promise<any> => {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
      });
      return response.json();
    },
    markAllAsRead: async (): Promise<any> => {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
      });
      return response.json();
    },
  },
};
