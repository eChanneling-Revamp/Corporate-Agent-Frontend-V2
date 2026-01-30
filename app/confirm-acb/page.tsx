'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle2, X, Calendar, Loader2, Phone, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { Appointment } from '@/lib/types';
import { isAuthenticated } from '@/lib/auth';

export default function ConfirmACBPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchUnpaidAppointments = async () => {
    try {
      setLoading(true);
      // Use the correct unpaid appointments endpoint
      const response = await api.appointments.getUnpaid();
      setAppointments(Array.isArray(response) ? response : (response as any)?.data || []);
    } catch (error) {
      console.error('Failed to fetch unpaid appointments:', error);
      toast({
        title: 'Error Loading Appointments',
        description: 'Failed to load unpaid appointments from database',
        variant: 'destructive',
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchQuery === '' ||
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    // Only show pending appointments (exclude confirmed/cancelled)
    const isPending = apt.status === 'pending';
    return matchesSearch && isPending;
  });

  const handleConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      setConfirmLoading(true);
      await api.appointments.confirm(selectedAppointment.id);
      
      // Immediately remove the confirmed appointment from local state for instant feedback
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      
      toast({
        title: 'Appointment Confirmed',
        description: `Appointment for ${selectedAppointment.patientName} has been confirmed successfully. Email notification sent.`,
      });
      
      setShowConfirmDialog(false);
      setSelectedAppointment(null);
      
      // Refresh the appointments list to ensure consistency
      await fetchUnpaidAppointments();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      toast({
        title: 'Confirmation Failed',
        description: 'Failed to confirm appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedAppointment) return;

    if (!cancelReason.trim()) {
      toast({
        title: 'Cancellation Reason Required',
        description: 'Please provide a reason for cancellation.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCancelLoading(true);
      await api.appointments.cancel(selectedAppointment.id, cancelReason.trim());
      
      // Immediately remove the cancelled appointment from local state for instant feedback
      setAppointments(prev => prev.filter(apt => apt.id !== selectedAppointment.id));
      
      toast({
        title: 'Appointment Cancelled',
        description: `Appointment for ${selectedAppointment.patientName} has been cancelled. Email notification sent.`,
      });
      
      setShowCancelDialog(false);
      setSelectedAppointment(null);
      setCancelReason('');
      
      // Refresh the appointments list to ensure consistency
      await fetchUnpaidAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Confirm ACB Appointments"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Confirm ACB' },
      ]}
    >
      <div className="space-y-6">
        <Card className="border-none shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="bg-amber-500 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                  Pending Confirmations
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  You have{' '}
                  <span className="font-bold text-amber-700">
                    {filteredAppointments.length}
                  </span>{' '}
                  appointments waiting for confirmation. Please review and
                  confirm or cancel each appointment.
                </p>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {filteredAppointments.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <Label className="text-sm sm:text-base">Search Appointments</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  placeholder="Search by doctor, patient, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 sm:py-16">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-4 text-amber-600" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Loading ACB Appointments...
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Fetching pending appointments for confirmation
                  </p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="bg-emerald-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    No pending appointments to confirm
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm sm:text-base">
                          {appointment.doctorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {appointment.specialty} • {appointment.hospital}
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs w-fit">
                            Pending Confirmation
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Patient Details
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {appointment.patientEmail}
                            </p>
                            <p className="text-xs text-gray-600">
                              {appointment.patientPhone}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Appointment Date & Time
                            </p>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {appointment.date}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {appointment.time}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Consultation Fee
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              Rs. {appointment.amount.toLocaleString()}
                            </p>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mt-2 flex items-center gap-1 w-fit">
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
                            <p className="text-xs text-gray-600 mt-1">
                              ID: {appointment.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm"
                            onClick={() => handleCancel(appointment)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white w-full sm:w-auto text-xs sm:text-sm"
                            onClick={() => handleConfirm(appointment)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm Appointment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}

              {filteredAppointments.length === 0 && !loading && (
                <div className="text-center py-12 sm:py-16">
                  <div className="bg-emerald-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    No pending appointments to confirm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirm Appointment</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review and confirm the appointment details below
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Confirmation Summary
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Doctor:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Patient:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Date & Time:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.date} • {selectedAppointment.time}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Hospital:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.hospital}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2 border-t border-emerald-200">
                    <span className="text-xs text-gray-600">
                      Consultation Fee:
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-700">
                      Rs. {selectedAppointment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> By confirming this appointment, the patient will be notified via email
                  and the appointment will be marked as confirmed in the system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 text-xs sm:text-sm"
                  disabled={confirmLoading}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm"
                  disabled={confirmLoading}
                >
                  {confirmLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm & Notify'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Please provide a reason for cancelling this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center space-x-2 mb-3">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    Appointment to Cancel
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Patient:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Doctor:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">Date & Time:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                      {selectedAppointment.date} • {selectedAppointment.time}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-gray-600">ID:</span>
                    <span className="text-xs text-gray-600 break-all text-right">
                      {selectedAppointment.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelReason" className="text-xs sm:text-sm">Cancellation Reason *</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Please provide a reason for cancelling this appointment..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[100px] text-xs sm:text-sm"
                />
                <p className="text-xs text-gray-500">
                  This reason will be included in the cancellation email sent to the patient.
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700">
                  <strong>Warning:</strong> This action cannot be undone. The patient will be notified
                  immediately via email about the cancellation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                  className="flex-1 text-xs sm:text-sm"
                  disabled={cancelLoading}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleCancelSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                  disabled={cancelLoading || !cancelReason.trim()}
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Appointment'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
