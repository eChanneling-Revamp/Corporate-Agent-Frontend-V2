'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, X, Eye, Loader2, RefreshCw, Phone, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { Appointment } from '@/lib/types';
import { isAuthenticated } from '@/lib/auth';

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const apiAppointments = await api.appointments.getAll();
      setAppointments(apiAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast({
        title: 'Error Loading Appointments',
        description: 'Failed to load appointments from database',
        variant: 'destructive',
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [toast]);

  // Auto-refresh every 30 seconds to catch updates from ACB actions
  useEffect(() => {
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  // Extract unique doctors and hospitals from appointments
  const uniqueDoctors = Array.from(new Set(appointments.map(apt => apt.doctorName))).sort();
  const uniqueHospitals = Array.from(new Set(appointments.map(apt => apt.hospital))).sort();

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchQuery === '' ||
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoctor =
      filterDoctor === 'all' || apt.doctorName === filterDoctor;
    const matchesHospital =
      filterHospital === 'all' || apt.hospital === filterHospital;

    // Handle status filtering with case-insensitive comparison
    const status = apt.status.toLowerCase();
    let matchesTab = false;
    if (selectedTab === 'upcoming') {
      matchesTab = status === 'confirmed' || status === 'pending';
    } else if (selectedTab === 'completed') {
      matchesTab = status === 'completed';
    } else if (selectedTab === 'cancelled') {
      matchesTab = status === 'cancelled';
    } else {
      matchesTab = true; // Show all if no tab selected
    }

    return matchesSearch && matchesDoctor && matchesHospital && matchesTab;
  });

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Cancellation Reason Required',
        description: 'Please provide a reason for cancellation',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAppointment) return;

    try {
      setCancelLoading(true);
      
      // Call the API to cancel the appointment
      await api.appointments.cancel(selectedAppointment.id, cancelReason);
      
      // Immediately update local state for instant feedback
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'cancelled' as any }
            : apt
        )
      );

      toast({
        title: 'Appointment Cancelled',
        description: `Appointment ${selectedAppointment.id} has been cancelled successfully`,
      });
      
      setShowCancelDialog(false);
      setCancelReason('');
      
      // Refresh appointments to get updated data
      await fetchAppointments();
    } catch (error) {
      console.error('[ERROR] Failed to cancel appointment:', error);
      toast({
        title: 'Cancel Failed',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout
      title="Appointment Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Appointments' },
      ]}
    >
      <div className="space-y-6">
        {/* Information Banner */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-cyan-500 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Appointment Management Center
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  All appointments booked through the ABC Insurance Corporate Agent Portal appear here. 
                  Patients and corporate coordinators can track, view, and manage appointments in real-time.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <Badge className="bg-emerald-100 text-emerald-700">✓ Real-time Updates</Badge>
                  <Badge className="bg-blue-100 text-blue-700">✓ SMS & Email Notifications</Badge>
                  <Badge className="bg-purple-100 text-purple-700">✓ Corporate Billing</Badge>
                  <Badge className="bg-orange-100 text-orange-700">✓ Digital Receipts</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by patient or doctor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Filter by Doctor</Label>
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {uniqueDoctors.map((doctor) => (
                      <SelectItem key={doctor} value={doctor}>
                        {doctor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Filter by Hospital</Label>
                <Select value={filterHospital} onValueChange={setFilterHospital}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {uniqueHospitals.map((hospital) => (
                      <SelectItem key={hospital} value={hospital}>
                        {hospital}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={fetchAppointments}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    <span className="ml-2 text-gray-600">Loading appointments...</span>
                  </div>
                ) : filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                            {appointment.doctorName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {appointment.doctorName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.specialty} • {appointment.hospital}
                              </p>
                            </div>
                            <Badge
                              className={`${getStatusColor(
                                appointment.status
                              )} text-xs`}
                            >
                              {appointment.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Patient Details
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.patientName}
                              </p>
                              <p className="text-xs text-gray-600">
                                Email: {appointment.patientEmail}
                              </p>
                              <p className="text-xs text-gray-600">
                                Phone: {appointment.patientPhone}
                              </p>
                              <p className="text-xs text-emerald-600 font-medium mt-1">
                                Notifications sent to patient
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Appointment Details
                              </p>
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">
                                  {appointment.date} • {appointment.time}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                Appointment ID: {appointment.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="text-lg font-bold text-gray-900">
                                  Rs. {appointment.amount.toLocaleString()}
                                </p>
                              </div>
                              {appointment.paymentMethod && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                                  {appointment.paymentMethod === 'BILL_TO_PHONE' ? (
                                    <>
                                      <Phone className="h-3 w-3" />
                                      Paid by Phone Bill
                                    </>
                                  ) : (
                                    <>
                                      <Briefcase className="h-3 w-3" />
                                      Paid by Salary Deduction
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              {appointment.status !== 'cancelled' &&
                                appointment.status !== 'completed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowCancelDialog(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && filteredAppointments.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No appointments found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-gray-900">
                {selectedAppointment?.doctorName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Patient: {selectedAppointment?.patientName}
              </p>
              <p className="text-xs text-gray-600">
                {selectedAppointment?.date} • {selectedAppointment?.time}
              </p>
            </div>

            <div>
              <Label>Cancellation Reason</Label>
              <Textarea
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
                disabled={cancelLoading}
              >
                Go Back
              </Button>
              <Button
                onClick={handleCancelAppointment}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                  <p className="text-xs text-gray-600 mb-1">Appointment ID</p>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.id}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  Doctor Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.doctorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Specialty</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.specialty}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">Hospital</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.hospital}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Patient Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.patientEmail}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-medium">
                      {selectedAppointment.patientPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      Rs. {selectedAppointment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <Badge
                      className={getPaymentStatusColor(
                        selectedAppointment.paymentStatus
                      )}
                    >
                      {selectedAppointment.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
