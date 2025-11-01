'use client';

import { useState } from 'react';
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
import { Search, Star, MapPin, Calendar, Download } from 'lucide-react';
import { mockDoctors } from '@/lib/mock-data';
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

  const filteredDoctors = mockDoctors.filter((doctor) => {
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

        {filteredDoctors.length === 0 && (
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
