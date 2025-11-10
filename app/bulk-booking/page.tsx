'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface BulkAppointmentRow {
  id: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'valid' | 'invalid' | 'pending';
  error?: string;
}

export default function BulkBookingPage() {
  const { toast } = useToast();
  
  // Available doctors in the database
  const availableDoctors = [
    'Dr. Saman Perera',
    'Dr. Nimal Fernando', 
    'Dr. Kamala Silva',
    'Dr. Rajesh Gupta'
  ];
  
  const [rows, setRows] = useState<BulkAppointmentRow[]>([
    {
      id: '1',
      doctorName: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      date: '',
      time: '',
      status: 'pending',
    },
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now().toString(),
        doctorName: '',
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        date: '',
        time: '',
        status: 'pending',
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: string, value: string) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value, status: 'pending' } : row
      )
    );
  };

  const validateRows = () => {
    setIsValidating(true);

    setTimeout(() => {
      const validatedRows = rows.map((row) => {
        if (
          !row.doctorName ||
          !row.patientName ||
          !row.patientEmail ||
          !row.patientPhone ||
          !row.date ||
          !row.time
        ) {
          return { ...row, status: 'invalid' as const, error: 'All fields required' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.patientEmail)) {
          return { ...row, status: 'invalid' as const, error: 'Invalid email' };
        }

        return { ...row, status: 'valid' as const, error: undefined };
      });

      setRows(validatedRows);
      setIsValidating(false);

      const validCount = validatedRows.filter((r) => r.status === 'valid').length;
      const invalidCount = validatedRows.filter((r) => r.status === 'invalid').length;

      toast({
        title: 'Validation Complete',
        description: `${validCount} valid, ${invalidCount} invalid entries`,
      });
    }, 1000);
  };

  const handleBulkBooking = async () => {
    const validRows = rows.filter((row) => row.status === 'valid');

    if (validRows.length === 0) {
      toast({
        title: 'No Valid Entries',
        description: 'Please validate your data first',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);

    toast({
      title: 'Booking in Progress',
      description: `Processing ${validRows.length} appointments...`,
    });

    // prepare payload expected by backend
    const payload = validRows.map((r) => ({
      doctorName: r.doctorName,
      patientName: r.patientName,
      patientEmail: r.patientEmail,
      patientPhone: r.patientPhone,
      date: r.date,
      time: r.time,
    }));

    try {
      const response = await api.appointments.bulkCreate(payload);

      if (!response || response.success === false) {
        console.error('Bulk booking failed:', response);
        toast({
          title: 'Bulk booking failed',
          description: response?.message || 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      // Check if there are any failures
      const created = response.data?.created?.length || 0;
      const failed = response.data?.failed?.length || 0;

      if (failed > 0) {
        toast({
          title: 'Bulk Booking Partially Complete',
          description: `${created} appointments created, ${failed} failed. Check console for details.`,
          variant: 'default',
        });
        console.log('Failed appointments:', response.data?.failed);
      } else {
        toast({
          title: 'Bulk Booking Complete',
          description: `All ${created} appointments created successfully! Confirmation emails sent.`,
        });
      }

      // reset rows
      setRows([
        {
          id: '1',
          doctorName: '',
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          date: '',
          time: '',
          status: 'pending',
        },
      ]);
    } catch (err) {
      console.error('Bulk booking error:', err);
      toast({
        title: 'Bulk booking failed',
        description: (err as Error)?.message || 'Network or server error',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: 'CSV Uploaded',
        description: 'Processing your CSV file...',
      });

      setTimeout(() => {
        const sampleData: BulkAppointmentRow[] = [
          {
            id: '1',
            doctorName: 'Dr. Saman Perera',
            patientName: 'John Smith',
            patientEmail: 'john@example.com',
            patientPhone: '+94771234567',
            date: '2025-11-15',
            time: '09:00',
            status: 'pending',
          },
          {
            id: '2',
            doctorName: 'Dr. Nimal Fernando',
            patientName: 'Jane Doe',
            patientEmail: 'jane@example.com',
            patientPhone: '+94771234568',
            date: '2025-11-15',
            time: '10:00',
            status: 'pending',
          },
        ];
        setRows(sampleData);
        toast({
          title: 'CSV Loaded',
          description: `${sampleData.length} rows imported`,
        });
      }, 1000);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      'Doctor Name,Patient Name,Patient Email,Patient Phone,Date,Time\nDr. Saman Perera,John Smith,john@example.com,+94771234567,2025-11-15,09:00\nDr. Nimal Fernando,Jane Doe,jane@example.com,+94771234568,2025-11-15,10:00\nDr. Kamala Silva,Bob Wilson,bob@example.com,+94771234569,2025-11-16,11:00\nDr. Rajesh Gupta,Alice Brown,alice@example.com,+94771234570,2025-11-16,14:00';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-booking-template.csv';
    a.click();

    toast({
      title: 'Template Downloaded',
      description: 'CSV template downloaded successfully',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const validCount = rows.filter((r) => r.status === 'valid').length;
  const totalAmount = validCount * 3000;

  return (
    <DashboardLayout
      title="Bulk Appointment Booking"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Bulk Booking' },
      ]}
    >
      <div className="space-y-6">
        {/* Available Doctors Info */}
        <Card className="border-l-4 border-l-cyan-500 bg-cyan-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-100 rounded-full p-2">
                <AlertCircle className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Available Doctors</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Please select from the following available doctors:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDoctors.map((doctor) => (
                    <Badge key={doctor} variant="secondary" className="bg-cyan-100 text-cyan-700">
                      {doctor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-cyan-100 rounded-xl p-4 inline-block mb-3">
                  <Upload className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Upload CSV
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import multiple appointments from CSV
                </p>
                <label htmlFor="csv-upload">
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-4 inline-block mb-3">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Download Template
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get CSV template with sample data
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={downloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-white/20 rounded-xl p-4 inline-block mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Valid Entries</h3>
                <p className="text-3xl font-bold mb-2">{validCount}</p>
                <p className="text-sm opacity-90">
                  Total: Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Appointment Entries</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateRows}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Validate All'}
              </Button>
              <Button
                size="sm"
                onClick={addRow}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 font-semibold text-gray-600">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Doctor Name</Label>
                        <Select
                          value={row.doctorName}
                          onValueChange={(value) =>
                            updateRow(row.id, 'doctorName', value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDoctors.map((doctor) => (
                              <SelectItem key={doctor} value={doctor}>
                                {doctor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Patient Name</Label>
                        <Input
                          placeholder="Patient Name"
                          value={row.patientName}
                          onChange={(e) =>
                            updateRow(row.id, 'patientName', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Patient Email</Label>
                        <Input
                          type="email"
                          placeholder="patient@example.com"
                          value={row.patientEmail}
                          onChange={(e) =>
                            updateRow(row.id, 'patientEmail', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Patient Phone</Label>
                        <Input
                          placeholder="+94 77 123 4567"
                          value={row.patientPhone}
                          onChange={(e) =>
                            updateRow(row.id, 'patientPhone', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            updateRow(row.id, 'date', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Time</Label>
                        <Input
                          type="time"
                          value={row.time}
                          onChange={(e) =>
                            updateRow(row.id, 'time', e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      {getStatusIcon(row.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {row.error && (
                    <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs text-red-600">{row.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
              <div>
                <p className="text-sm text-gray-600">Total Valid Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{validCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-cyan-600">
                  Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleBulkBooking}
                disabled={validCount === 0 || isBooking}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8"
              >
                {isBooking ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Booking...
                  </>
                ) : (
                  'Book All Appointments'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
