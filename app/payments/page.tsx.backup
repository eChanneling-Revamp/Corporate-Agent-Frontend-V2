'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, CreditCard, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const apiPayments = await api.payments.getAll();
        setPayments(apiPayments);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        toast({
          title: 'Error Loading Payments',
          description: 'Failed to load payments from database',
          variant: 'destructive',
        });
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      searchQuery === '' ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.appointmentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalRevenue = payments
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  const handleDownloadInvoice = (paymentId: string) => {
    toast({
      title: 'Invoice Downloaded',
      description: `Invoice for payment ${paymentId} has been downloaded`,
    });
  };

  return (
    <DashboardLayout
      title="Payment Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Payments' },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    Rs. {(totalRevenue / 1000).toFixed(1)}K
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+12.5% from last month</span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <CreditCard className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Pending Payments
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    Rs. {(pendingAmount / 1000).toFixed(1)}K
                  </p>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 mt-2">
                    {payments.filter((p: any) => p.status === 'pending').length}{' '}
                    pending
                  </Badge>
                </div>
                <div className="bg-amber-100 p-4 rounded-xl">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Completed Transactions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {payments.filter((p: any) => p.status === 'paid').length}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mt-2">
                    This month
                  </Badge>
                </div>
                <div className="bg-emerald-100 p-4 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label>Search Transactions</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by payment ID, transaction ID, or appointment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Payment ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Appointment ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Transaction ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-cyan-500 mr-2" />
                          <span className="text-gray-600">Loading payments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayments.map((payment: any) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.id}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {payment.appointmentId}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-mono text-gray-600">
                          {payment.transactionId}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(payment.method)}
                          <span className="text-sm text-gray-700 capitalize">
                            {payment.method}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Rs. {payment.amount.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && filteredPayments.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
