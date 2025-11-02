'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, appointments] = await Promise.all([
          api.dashboard.getStats(),
          api.appointments.getAll()
        ]);
        
        setStats(dashboardStats);
        setRecentAppointments(appointments.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Error Loading Dashboard',
          description: 'Failed to load dashboard data from database',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const kpiCards = stats ? [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments.toLocaleString(),
      change: `+${stats.appointmentsChange}%`,
      trend: 'up',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Pending Confirmations',
      value: stats.pendingConfirmations.toLocaleString(),
      change: 'Requires Action',
      trend: 'neutral',
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(stats.revenue / 1000).toFixed(1)}K`,
      change: `+${stats.revenueChange}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Active Doctors',
      value: stats.activeDoctors.toLocaleString(),
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
  ] : [];

  const quickActions = [
    {
      title: 'Book Doctor',
      description: 'Search and book appointments',
      icon: Calendar,
      href: '/doctors',
      color: 'bg-cyan-500',
    },
    {
      title: 'Bulk Booking',
      description: 'Upload CSV for multiple bookings',
      icon: Users,
      href: '/bulk-booking',
      color: 'bg-blue-500',
    },
    {
      title: 'View Reports',
      description: 'Generate analytics reports',
      icon: TrendingUp,
      href: '/reports',
      color: 'bg-emerald-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            const isPositive = card.trend === 'up';

            return (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div
                  className={`h-1 bg-gradient-to-r ${card.color} transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${card.color}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </div>
                      <div className="flex items-center mt-2 space-x-1">
                        {card.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        )}
                        {card.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isPositive ? 'text-emerald-600' : 'text-gray-500'
                          }`}
                        >
                          {card.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`${action.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Appointments
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/appointments')}
                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                          {appointment.doctorName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {appointment.doctorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.specialty} • {appointment.hospital}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Patient: {appointment.patientName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {appointment.date}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-cyan-500 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Appointment Confirmed
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Dr. Sarah Johnson confirmed for tomorrow at 9:00 AM
                      </p>
                      <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-emerald-500 p-2 rounded-lg">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Payment Received
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Rs. 3,000 payment processed successfully
                      </p>
                      <p className="text-xs text-gray-400 mt-2">5 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Bulk Booking Complete
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        15 appointments created successfully
                      </p>
                      <p className="text-xs text-gray-400 mt-2">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
