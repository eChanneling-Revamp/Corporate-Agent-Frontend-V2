'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle2, X, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Appointment } from '@/lib/types';

export default function ConfirmACBPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const fetchUnpaidAppointments = async () => {
      try {
        setLoading(true);
        const allAppointments = await api.appointments.getAll();
        const unpaidAppointments = allAppointments.filter(
          (apt: any) => apt.paymentStatus === 'pending'
        );
        setAppointments(unpaidAppointments);
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

    fetchUnpaidAppointments();
  }, [toast]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchQuery === '' ||
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    toast({
      title: 'Appointment Confirmed',
      description: `Appointment ${selectedAppointment?.id} has been confirmed successfully`,
    });
    setShowConfirmDialog(false);
  };

  const handleCancel = (appointmentId: string) => {
    toast({
      title: 'Appointment Cancelled',
      description: `Appointment ${appointmentId} has been cancelled`,
      variant: 'destructive',
    });
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
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-500 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Pending Confirmations
                </h3>
                <p className="text-sm text-gray-600">
                  You have{' '}
                  <span className="font-bold text-amber-700">
                    {appointments.length}
                  </span>{' '}
                  appointments waiting for confirmation. Please review and
                  confirm or cancel each appointment.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-600">
                  {appointments.length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6">
              <Label>Search Appointments</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by doctor, patient, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100" />
                        <AvatarFallback>
                          {appointment.doctorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.specialty} • {appointment.hospital}
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            Pending Confirmation
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50">
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
                            <p className="text-xs text-gray-600 mt-1">
                              ID: {appointment.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
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
              ))}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600">
                    No pending appointments to confirm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Review and confirm the appointment details below
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-gray-900">
                    Confirmation Summary
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Doctor:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointment.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Patient:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointment.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Date & Time:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointment.date} • {selectedAppointment.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Hospital:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointment.hospital}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200">
                    <span className="text-xs text-gray-600">
                      Consultation Fee:
                    </span>
                    <span className="text-lg font-bold text-emerald-700">
                      Rs. {selectedAppointment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> By confirming this appointment, you
                  acknowledge that the patient will be notified and the time
                  slot will be reserved.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  Confirm & Notify
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
