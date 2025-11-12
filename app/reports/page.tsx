'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Loader2,
  Calendar,
  Trash2,
  Eye,
  DollarSign,
  Users
} from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';

interface Report {
  id: string;
  type: string;
  title: string;
  data: any;
  parameters: any;
  createdAt: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);

  const [reportType, setReportType] = useState('appointments');
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  // Fetch existing reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await api.reports.getAll();
        
        console.log('[REPORTS] Fetched reports:', response);
        
        if (response.success) {
          setReports(response.data || []);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        toast({
          title: 'Error Loading Reports',
          description: 'Failed to load report history',
          variant: 'destructive',
        });
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      
      console.log('[REPORTS] Generating with dates:', { reportType, dateFrom, dateTo });
      
      const response = await api.reports.generate({
        reportType,
        dateFrom,
        dateTo,
        filters: {}
      });

      console.log('[REPORTS] Generated report:', response);

      if (response.success) {
        toast({
          title: 'Report Generated',
          description: 'Your report has been generated successfully',
        });
        
        // Add new report to list
        setReports([response.data, ...reports]);
        setSelectedReport(response.data);
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = (report: Report) => {
    try {
      const data = report.data;
      let csvContent = '';
      let headers: string[] = [];
      let rows: any[] = [];

      if (report.type === 'APPOINTMENTS') {
        headers = ['Patient', 'Doctor', 'Hospital', 'Date', 'Status', 'Amount'];
        rows = data.appointments.map((apt: any) => [
          apt.patientName,
          apt.doctorName,
          apt.hospital,
          new Date(apt.date).toLocaleDateString(),
          apt.status,
          apt.amount
        ]);
      } else if (report.type === 'REVENUE') {
        headers = ['Date', 'Amount', 'Patient', 'Doctor', 'Transaction ID'];
        rows = data.payments.map((pmt: any) => [
          new Date(pmt.date).toLocaleDateString(),
          pmt.amount,
          pmt.patient,
          pmt.doctor,
          pmt.transactionId
        ]);
      } else if (report.type === 'DOCTORS' || report.type === 'DOCTOR_PERFORMANCE') {
        headers = ['Doctor', 'Hospital', 'Specialty', 'Total Appointments', 'Confirmed', 'Total Revenue'];
        rows = data.doctors.map((doc: any) => [
          doc.name,
          doc.hospital,
          doc.specialty,
          doc.totalAppointments,
          doc.confirmed,
          doc.totalRevenue
        ]);
      }

      csvContent = [
        headers.join(','),
        ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '-')}-${report.id.slice(0, 8)}.csv`;
      a.click();

      toast({
        title: 'Export Successful',
        description: 'Report exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const response = await api.reports.delete(id);
      
      if (response.success) {
        setReports(reports.filter(r => r.id !== id));
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
        toast({
          title: 'Report Deleted',
          description: 'Report has been deleted successfully',
        });
      } else {
        throw new Error(response.message || 'Failed to delete report');
      }
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete report',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog(false);
      setReportToDelete(null);
    }
  };

  const reportTypes = [
    {
      id: 'appointments',
      title: 'Appointments Report',
      description: 'Detailed report of all appointments',
      icon: FileText,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Financial summary and revenue analysis',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'doctors',
      title: 'Doctor Performance',
      description: 'Doctor-wise appointment statistics',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout
      title="Reports & Analytics"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reports' },
      ]}
    >
      <div className="space-y-6">
        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  reportType === type.id ? 'ring-2 ring-cyan-500' : ''
                }`}
                onClick={() => setReportType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`bg-gradient-to-r ${type.color} p-3 rounded-xl`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Selected Report Details */}
        {selectedReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedReport.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Generated {formatDate(selectedReport.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(selectedReport)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport.type === 'APPOINTMENTS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{selectedReport.data.totalAppointments}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-emerald-600">{selectedReport.data.confirmed}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-amber-600">{selectedReport.data.pending}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-gray-600">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">{selectedReport.data.cancelled}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.type === 'REVENUE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-sm text-gray-600">Total Revenue (Confirmed)</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedReport.data.totalRevenue || 0)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-gray-600">Pending Revenue</p>
                      <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedReport.data.pendingRevenue || 0)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                      <p className="text-sm text-gray-600">Confirmed Count</p>
                      <p className="text-2xl font-bold">{selectedReport.data.paidCount || 0}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-sm text-gray-600">Average/Appointment</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedReport.data.averagePerAppointment || 0)}</p>
                    </div>
                  </div>
                </div>
              )}

              {(selectedReport.type === 'DOCTORS' || selectedReport.type === 'DOCTOR_PERFORMANCE') && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 mb-4">
                    <p className="text-sm text-gray-600">Total Doctors</p>
                    <p className="text-2xl font-bold">{selectedReport.data.totalDoctors || 0}</p>
                  </div>
                  {selectedReport.data.topPerformers && selectedReport.data.topPerformers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Hospital</TableHead>
                            <TableHead>Appointments</TableHead>
                            <TableHead>Confirmed</TableHead>
                            <TableHead>Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReport.data.topPerformers.map((doctor: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{doctor.name}</div>
                                  <div className="text-xs text-gray-500">{doctor.specialty}</div>
                                </div>
                              </TableCell>
                              <TableCell>{doctor.hospital}</TableCell>
                              <TableCell>{doctor.totalAppointments}</TableCell>
                              <TableCell>{doctor.confirmed}</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(doctor.totalRevenue || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No doctor data available for this period
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Report History */}
        <Card>
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-gray-600">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-500">Generate your first report to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${
                        report.type === 'APPOINTMENTS' ? 'from-cyan-500 to-blue-500' :
                        report.type === 'REVENUE' ? 'from-emerald-500 to-teal-500' :
                        'from-purple-500 to-pink-500'
                      }`}>
                        {report.type === 'APPOINTMENTS' && <FileText className="h-5 w-5 text-white" />}
                        {report.type === 'REVENUE' && <DollarSign className="h-5 w-5 text-white" />}
                        {(report.type === 'DOCTORS' || report.type === 'DOCTOR_PERFORMANCE') && <Users className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(report.createdAt)}
                          </span>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportCSV(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReportToDelete(report.id);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this report. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => reportToDelete && handleDeleteReport(reportToDelete)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
