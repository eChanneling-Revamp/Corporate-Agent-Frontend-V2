'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Star, MapPin, Calendar, Download, AlertCircle } from 'lucide-react';
import { mockDoctors } from '@/lib/mock-data';
import { api } from '@/lib/api';
import { Doctor, TimeSlot } from '@/lib/types';

export default function DoctorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [hospital, setHospital] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'mock' | 'api' | 'loading'>('loading');

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        const apiDoctors = await api.doctors.search({});
        if (apiDoctors && apiDoctors.length > 0) {
          setDoctors(apiDoctors);
          setDataSource('api');
          toast({
            title: 'Connected to Database',
            description: `Loaded ${apiDoctors.length} doctors from Neon PostgreSQL database`,
            variant: 'default',
          });
        } else {
          // Fallback to mock data
          setDoctors(mockDoctors);
          setDataSource('mock');
          toast({
            title: 'Using Mock Data',
            description: 'Could not connect to database, showing sample data',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setError(`Failed to connect to backend: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Fallback to mock data
        setDoctors(mockDoctors);
        setDataSource('mock');
        toast({
          title: 'Database Connection Failed',
          description: 'Using mock data as fallback. Please check backend connection.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === '' ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      specialty === 'all' || doctor.specialty === specialty;
    const matchesHospital = hospital === 'all' || doctor.hospital === hospital;
    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  const handleBookAppointment = (doctor: Doctor, slot: TimeSlot) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    toast({
      title: 'Appointment Booked Successfully',
      description: `Appointment with ${selectedDoctor?.name} on ${selectedSlot?.date} at ${selectedSlot?.time}`,
    });
    setShowBookingModal(false);
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
  };

  return (
    <DashboardLayout
      title="Search Doctors"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Search Doctors' }]}
    >
      <div className="space-y-6">
        {/* Data Source Indicator */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {dataSource === 'api' && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Connected to Neon PostgreSQL Database
                </span>
              </div>
            )}
            {dataSource === 'mock' && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  Using Mock Data (Database Not Connected)
                </span>
              </div>
            )}
            {dataSource === 'loading' && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-700">
                  Connecting to Database...
                </span>
              </div>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              Error: {error}
            </div>
          )}
        </div>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by doctor name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hospital</Label>
                <Select value={hospital} onValueChange={setHospital}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    <SelectItem value="City General Hospital">
                      City General Hospital
                    </SelectItem>
                    <SelectItem value="St. Mary Medical Center">
                      St. Mary Medical Center
                    </SelectItem>
                    <SelectItem value="Metropolitan Hospital">
                      Metropolitan Hospital
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-none shadow-lg">
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 mb-2">
                      {doctor.specialty}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctor.hospital}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-900">
                      {doctor.rating}
                    </span>
                    <span className="text-sm text-gray-500">(245 reviews)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-lg font-bold text-gray-900">
                      Rs. {doctor.fee.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Available Slots
                  </p>
                  <div className="space-y-2">
                    {doctor.availableSlots.slice(0, 2).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-cyan-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">
                            {slot.date} • {slot.time}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleBookAppointment(doctor, slot)}
                          disabled={!slot.available}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                        >
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Complete the form below to book your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
              <p className="text-sm font-medium text-gray-900">
                {selectedDoctor?.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedSlot?.date} • {selectedSlot?.time}
              </p>
              <p className="text-sm font-bold text-cyan-700 mt-2">
                Fee: Rs. {selectedDoctor?.fee.toLocaleString()}
              </p>
            </div>

            <div>
              <Label>Patient Name</Label>
              <Input
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Patient Email</Label>
              <Input
                type="email"
                placeholder="patient@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Patient Phone</Label>
              <Input
                placeholder="+94 77 123 4567"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
