'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { mockDoctors } from '@/lib/mock-data';
import { Doctor } from '@/lib/types';

export default function DoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'loading' | 'api' | 'mock'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  // Booking dialog state
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking form state
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiDoctors = await api.doctors.search({});
        
        if (apiDoctors && apiDoctors.length > 0) {
          setDoctors(apiDoctors);
          setDataSource('api');
        } else {
          setDoctors(mockDoctors);
          setDataSource('mock');
          toast({
            title: 'Using Mock Data',
            description: 'API returned no data, showing sample doctors',
            variant: 'destructive',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDoctors(mockDoctors);
        setDataSource('mock');
        toast({
          title: 'Database Connection Failed',
          description: 'Using mock data as fallback',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Filter doctors based on search query and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      searchQuery === '' ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = 
      specialtyFilter === 'all' || 
      doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase();
    
    return matchesSearch && matchesSpecialty;
  });

  // Handle booking dialog
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingDialog(true);
    // Reset form
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setAppointmentDate('');
    setAppointmentTime('');
  };

  // Handle booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    setBookingLoading(true);
    
    try {
      const bookingData = {
        doctorId: selectedDoctor.id,
        patientName,
        patientEmail,
        patientPhone,
        date: appointmentDate,
        timeSlot: appointmentTime,
        amount: selectedDoctor.fee || 3000,
        paymentMethod: 'corporate-credit'
      };

      const response = await api.appointments.create(bookingData);
      
      toast({
        title: 'Appointment Booked Successfully! 🎉',
        description: `Booking confirmation sent to ${patientEmail}. Appointment ID: ${response.id || 'Generated'}`,
      });

      // Show detailed success information
      setTimeout(() => {
        toast({
          title: 'What happens next?',
          description: `📧 Email confirmation sent to ${patientEmail} | 📱 SMS sent to ${patientPhone} | 💳 Charged to ABC Insurance corporate account`,
        });
      }, 2000);
      
      setShowBookingDialog(false);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Get unique specialties for filter
  const specialties = [...new Set(doctors.map(d => d.specialty))];
  
  // Generate time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  return (
    <DashboardLayout
      title="Search Doctors"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Search Doctors' }]}
    >
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Doctors</Label>
                <Input
                  id="search"
                  placeholder="Search by name or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="specialty">Filter by Specialty</Label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSpecialtyFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </span>
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                {dataSource === 'api' ? 'Live Database' : 'Demo Data'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <Badge className="mb-2">{doctor.specialty}</Badge>
                    <p className="text-sm text-gray-600">{doctor.hospital}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="text-lg font-bold text-gray-900">
                        Rs. {(doctor.fee || 3000).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Doctors Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or clear the filters
            </p>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Book Appointment with {selectedDoctor?.name}
            </DialogTitle>
            <DialogDescription>
              Fill in the patient details to book the appointment
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Doctor Info Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-500 p-3 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {selectedDoctor.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedDoctor.specialty} • {selectedDoctor.hospital}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-100 text-cyan-700">
                        {selectedDoctor.specialty}
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          Rs. {(selectedDoctor.fee || 3000).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Consultation Fee</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">
                    <User className="h-4 w-4 inline mr-2" />
                    Patient Name *
                  </Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="patientEmail">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="patientPhone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number *
                  </Label>
                  <Input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="appointmentDate">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Appointment Date *
                  </Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="appointmentTime">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Preferred Time *
                  </Label>
                  <Select value={appointmentTime} onValueChange={setAppointmentTime} required>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select appointment time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900">Corporate Credit Account</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      Rs. {(selectedDoctor.fee || 3000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingDialog(false)}
                  className="flex-1"
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingLoading || !patientName || !patientEmail || !patientPhone || !appointmentDate || !appointmentTime}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}