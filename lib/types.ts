export interface Agent {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  type: 'corporate' | 'individual';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  photo: string;
  availableSlots: TimeSlot[];
  fee: number;
  rating: number;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed';
  amount: number;
  hospital: string;
  specialty: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  method: 'card' | 'bank' | 'cash';
  transactionId: string;
  date: string;
}

export interface Report {
  id: string;
  type: 'appointments' | 'revenue' | 'doctors' | 'hospitals';
  dateFrom: string;
  dateTo: string;
  data: any;
  generatedAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingConfirmations: number;
  revenue: number;
  revenueChange: number;
  appointmentsChange: number;
}
