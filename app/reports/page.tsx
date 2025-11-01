'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('appointments');
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-11-01');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');

  const handleGenerateReport = () => {
    toast({
      title: 'Generating Report',
      description: 'Your report is being generated...',
    });

    setTimeout(() => {
      toast({
        title: 'Report Generated',
        description: 'Your report is ready for download',
      });
    }, 2000);
  };

  const handleExportPDF = () => {
    toast({
      title: 'Exporting to PDF',
      description: 'Report is being exported to PDF...',
    });
  };

  const handleExportCSV = () => {
    toast({
      title: 'Exporting to CSV',
      description: 'Report is being exported to CSV...',
    });
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

  const sampleData = {
    totalAppointments: 1248,
    confirmedAppointments: 1025,
    cancelledAppointments: 98,
    pendingAppointments: 125,
    totalRevenue: 186400,
    averagePerAppointment: 3200,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`border-none shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  reportType === type.id ? 'ring-2 ring-cyan-500' : ''
                }`}
                onClick={() => setReportType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`bg-gradient-to-r ${type.color} p-3 rounded-xl`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div>
                <Label>Filter by Doctor</Label>
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="dr-roberts">Dr. Emily Roberts</SelectItem>
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
                    <SelectItem value="city-general">
                      City General Hospital
                    </SelectItem>
                    <SelectItem value="st-mary">
                      St. Mary Medical Center
                    </SelectItem>
                    <SelectItem value="metropolitan">
                      Metropolitan Hospital
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <Button
                onClick={handleGenerateReport}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                <p className="text-sm text-gray-600 mb-2">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {sampleData.totalAppointments}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="font-medium text-emerald-600">
                      {sampleData.confirmedAppointments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-amber-600">
                      {sampleData.pendingAppointments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-medium text-red-600">
                      {sampleData.cancelledAppointments}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  Rs. {(sampleData.totalRevenue / 1000).toFixed(1)}K
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Per Appointment</span>
                    <span className="font-medium text-emerald-600">
                      Rs. {sampleData.averagePerAppointment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+12.5% from last period</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Top Performing</p>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  Dr. Sarah Johnson
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Appointments</span>
                    <span className="font-medium text-purple-600">342</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium text-purple-600">4.9/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Specialty</span>
                    <span className="font-medium text-purple-600">
                      Cardiology
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Detailed analytics charts and visualizations will appear here
                after generating the report
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
