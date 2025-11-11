'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Download, 
  CreditCard, 
  TrendingUp, 
  Loader2, 
  DollarSign,
  Clock,
  CheckCircle2,
  Filter,
  FileText,
  ArrowUpDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface Payment {
  id: string;
  appointmentId: string;
  transactionId: string;
  method: string;
  amount: number;
  status: string;
  date: string;
  processedAt: string | null;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  hospital: string;
  specialty: string;
  notes: string | null;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  averagePayment: number;
  paymentMethods: {
    card: number;
    bankTransfer: number;
    cash: number;
    wallet: number;
  };
}

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

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch payments and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch payments with filters
        const filters: any = {};
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (methodFilter !== 'all') filters.method = methodFilter;
        
        const [paymentsResponse, statsResponse] = await Promise.all([
          api.payments.getAll(filters),
          api.payments.getStats()
        ]);

        console.log('[PAYMENTS] Fetched payments:', paymentsResponse);
        console.log('[PAYMENTS] Fetched stats:', statsResponse);

        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data || []);
        } else {
          setPayments([]);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        toast({
          title: 'Error Loading Data',
          description: 'Failed to load payment information',
          variant: 'destructive',
        });
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, methodFilter, toast]);

  // Filter and sort payments
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        searchQuery === '' ||
        payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMethodBadge = (method: string) => {
    const methodMap: Record<string, { icon: any; label: string; color: string }> = {
      card: { icon: CreditCard, label: 'Card', color: 'bg-blue-100 text-blue-700' },
      bank_transfer: { icon: DollarSign, label: 'Bank', color: 'bg-purple-100 text-purple-700' },
      cash: { icon: DollarSign, label: 'Cash', color: 'bg-green-100 text-green-700' },
      wallet: { icon: DollarSign, label: 'Wallet', color: 'bg-orange-100 text-orange-700' },
    };

    const methodData = methodMap[method.toLowerCase()] || methodMap.card;
    const Icon = methodData.icon;

    return (
      <Badge className={`${methodData.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {methodData.label}
      </Badge>
    );
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'Transaction ID',
        'Patient Name',
        'Doctor Name',
        'Hospital',
        'Amount',
        'Method',
        'Status',
        'Date',
      ];

      const csvData = filteredPayments.map(p => [
        p.transactionId,
        p.patientName,
        p.doctorName,
        p.hospital,
        p.amount.toString(),
        p.method,
        p.status,
        formatDate(p.date),
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast({
        title: 'Export Successful',
        description: 'Payment data exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export payment data',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    toast({
      title: 'Generating Invoice',
      description: `Generating invoice for ${payment.transactionId}...`,
    });

    // Simulate invoice generation
    setTimeout(() => {
      toast({
        title: 'Invoice Ready',
        description: `Invoice for ${payment.transactionId} is ready for download`,
      });
    }, 1500);
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.paidCount} paid transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pendingCount} pending transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averagePayment)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.failedCount} failed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient, doctor, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Payments Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-gray-600">Loading payments...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' || methodFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Payment transactions will appear here'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('amount')}>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.patientName}</div>
                            <div className="text-xs text-gray-500">{payment.patientPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.doctorName}</div>
                            <div className="text-xs text-gray-500">{payment.specialty}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{payment.hospital}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payment.date)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500 text-right">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
