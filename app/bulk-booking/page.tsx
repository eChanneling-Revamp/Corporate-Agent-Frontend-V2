'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
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
  patientNIC: string;
  patientEmail: string;
  patientPhone: string;
  paymentMethod: 'BILL_TO_PHONE' | 'DEDUCT_FROM_SALARY';
  sltPhoneNumber?: string;
  employeeNIC?: string;
  date: string;
  time: string;
  status: 'valid' | 'invalid' | 'pending';
  error?: string;
}

export default function BulkBookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for doctors from API
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);
  
  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const apiDoctors = await api.doctors.search({});
        
        if (apiDoctors && apiDoctors.length > 0) {
          const doctorNames = apiDoctors.map((doctor: any) => doctor.name);
          setAvailableDoctors(doctorNames);
          console.log('[BULK-BOOKING] Loaded doctors:', doctorNames);
        } else {
          // Fallback to default doctors if API returns nothing
          setAvailableDoctors([
            'Dr. Saman Perera',
            'Dr. Nimal Fernando',
            'Dr. Kamala Silva',
            'Dr. Rajesh Gunawardena',
            'Dr. Priya Wickramasinghe',
            'Dr. Anura Jayasinghe'
          ]);
        }
      } catch (error) {
        console.error('[BULK-BOOKING] Failed to fetch doctors:', error);
        // Fallback to default doctors on error
        setAvailableDoctors([
          'Dr. Saman Perera',
          'Dr. Nimal Fernando',
          'Dr. Kamala Silva',
          'Dr. Rajesh Gunawardena',
          'Dr. Priya Wickramasinghe',
          'Dr. Anura Jayasinghe'
        ]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);
  
  // Available time slots (same as doctor search page)
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];
  
  const [rows, setRows] = useState<BulkAppointmentRow[]>([
    {
      id: '1',
      doctorName: '',
      patientName: '',
      patientNIC: '',
      patientEmail: '',
      patientPhone: '',
      paymentMethod: 'BILL_TO_PHONE',
      sltPhoneNumber: '',
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
        patientNIC: '',
        patientEmail: '',
        patientPhone: '',
        paymentMethod: 'BILL_TO_PHONE',
        sltPhoneNumber: '',
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
          !row.patientNIC ||
          !row.patientEmail ||
          !row.patientPhone ||
          !row.date ||
          !row.time
        ) {
          return { ...row, status: 'invalid' as const, error: 'All fields required' };
        }

        if (row.paymentMethod === 'BILL_TO_PHONE' && !row.sltPhoneNumber) {
          return { ...row, status: 'invalid' as const, error: 'SLT phone number required for Bill to Phone' };
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
      patientNIC: r.patientNIC,
      patientEmail: r.patientEmail,
      patientPhone: r.patientPhone,
      paymentMethod: r.paymentMethod,
      sltPhoneNumber: r.sltPhoneNumber,
      employeeNIC: r.employeeNIC,
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
          patientNIC: '',
          patientEmail: '',
          patientPhone: '',
          paymentMethod: 'BILL_TO_PHONE',
          sltPhoneNumber: '',
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
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'CSV Uploaded',
      description: 'Processing your CSV file...',
    });

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: 'Empty CSV',
            description: 'CSV file has no data rows',
            variant: 'destructive',
          });
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate required columns
        const requiredColumns = ['Doctor Name', 'Patient Name', 'Patient NIC', 'Patient Email', 'Patient Phone', 'Payment Method', 'Date', 'Time'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          toast({
            title: 'Invalid CSV Format',
            description: `Missing required columns: ${missingColumns.join(', ')}`,
            variant: 'destructive',
          });
          return;
        }

        // Parse data rows
        const parsedRows: BulkAppointmentRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length < headers.length) continue; // Skip incomplete rows
          
          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Validate payment method
          const paymentMethod = rowData['Payment Method']?.toUpperCase();
          if (paymentMethod !== 'BILL_TO_PHONE' && paymentMethod !== 'DEDUCT_FROM_SALARY') {
            toast({
              title: `Row ${i} Error`,
              description: `Invalid payment method. Must be BILL_TO_PHONE or DEDUCT_FROM_SALARY`,
              variant: 'destructive',
            });
            continue;
          }

          parsedRows.push({
            id: Date.now().toString() + i,
            doctorName: rowData['Doctor Name'],
            patientName: rowData['Patient Name'],
            patientNIC: rowData['Patient NIC'],
            patientEmail: rowData['Patient Email'],
            patientPhone: rowData['Patient Phone'],
            paymentMethod: paymentMethod as 'BILL_TO_PHONE' | 'DEDUCT_FROM_SALARY',
            sltPhoneNumber: rowData['SLT Phone Number'] || '',
            employeeNIC: rowData['Employee NIC'] || '',
            date: rowData['Date'],
            time: rowData['Time'],
            status: 'pending',
          });
        }

        if (parsedRows.length === 0) {
          toast({
            title: 'No Valid Rows',
            description: 'Could not parse any valid rows from CSV',
            variant: 'destructive',
          });
          return;
        }

        setRows(parsedRows);
        toast({
          title: 'CSV Loaded Successfully',
          description: `${parsedRows.length} row${parsedRows.length > 1 ? 's' : ''} imported from CSV file`,
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: 'CSV Parse Error',
          description: 'Failed to parse CSV file. Please check the format.',
          variant: 'destructive',
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: 'File Read Error',
        description: 'Failed to read the CSV file',
        variant: 'destructive',
      });
    };

    reader.readAsText(file);
    
    // Clear the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent =
      'Doctor Name,Patient Name,Patient NIC,Patient Email,Patient Phone,Payment Method,SLT Phone Number,Employee NIC,Date,Time\nDr. Saman Perera,John Smith,912345678V,john@example.com,+94771234567,BILL_TO_PHONE,0112121212,,2025-11-15,09:00 AM\nDr. Nimal Fernando,Jane Doe,887654321V,jane@example.com,+94771234568,DEDUCT_FROM_SALARY,,,2025-11-15,10:00 AM\nDr. Kamala Silva,Bob Wilson,756789012V,bob@example.com,+94771234569,BILL_TO_PHONE,0112345678,,2025-11-16,11:00 AM\nDr. Rajesh Gupta,Alice Brown,651234567V,alice@example.com,+94771234570,DEDUCT_FROM_SALARY,,,2025-11-16,02:00 PM';
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
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="bg-cyan-100 rounded-full p-2 flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Available Doctors</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Please select from the following available doctors:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {availableDoctors.map((doctor) => (
                    <Badge key={doctor} variant="secondary" className="bg-cyan-100 text-cyan-700 text-xs">
                      {doctor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="bg-cyan-100 rounded-xl p-3 sm:p-4 inline-block mb-3">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Upload CSV
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs sm:text-sm"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Upload CSV
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-3 sm:p-4 inline-block mb-3">
                  <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Download Template
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Get CSV template with sample data
                </p>
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm"
                  onClick={downloadTemplate}
                >
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="bg-white/20 rounded-xl p-3 sm:p-4 inline-block mb-3">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Valid Entries</h3>
                <p className="text-2xl sm:text-3xl font-bold mb-2">{validCount}</p>
                <p className="text-xs sm:text-sm opacity-90">
                  Total: Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl">Appointment Entries</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateRows}
                disabled={isValidating}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                {isValidating ? 'Validating...' : 'Validate All'}
              </Button>
              <Button
                size="sm"
                onClick={addRow}
                className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto text-xs sm:text-sm"
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
                  className="p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 font-semibold text-gray-600 text-sm sm:text-base flex-shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                        <Label className="text-xs">Patient NIC</Label>
                        <Input
                          placeholder="e.g., 912345678V"
                          value={row.patientNIC}
                          onChange={(e) =>
                            updateRow(row.id, 'patientNIC', e.target.value)
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
                        <Label className="text-xs">Payment Method</Label>
                        <Select
                          value={row.paymentMethod}
                          onValueChange={(value) =>
                            updateRow(row.id, 'paymentMethod', value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BILL_TO_PHONE">Bill to Phone</SelectItem>
                            <SelectItem value="DEDUCT_FROM_SALARY">Salary Deduction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {row.paymentMethod === 'BILL_TO_PHONE' && (
                        <div>
                          <Label className="text-xs">SLT Phone Number</Label>
                          <Input
                            placeholder="0112121212"
                            value={row.sltPhoneNumber || ''}
                            onChange={(e) =>
                              updateRow(row.id, 'sltPhoneNumber', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      )}

                      {row.paymentMethod === 'DEDUCT_FROM_SALARY' && (
                        <div>
                          <Label className="text-xs">Employee NIC (if booking for someone else)</Label>
                          <Input
                            placeholder="Employee's NIC"
                            value={row.employeeNIC || ''}
                            onChange={(e) =>
                              updateRow(row.id, 'employeeNIC', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            updateRow(row.id, 'date', e.target.value)
                          }
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Time</Label>
                        <Select
                          value={row.time}
                          onValueChange={(value) =>
                            updateRow(row.id, 'time', value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Time" />
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

                    <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 sm:space-y-2 flex-shrink-0">
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
                    <div className="mt-3 p-2 sm:p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs sm:text-sm text-red-600">{row.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600">Total Valid Appointments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{validCount}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-cyan-600">
                  Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleBulkBooking}
                disabled={validCount === 0 || isBooking}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base"
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
