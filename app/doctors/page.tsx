'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { mockDoctors } from '@/lib/mock-data';
import { Doctor } from '@/lib/types';

export default function DoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'loading' | 'api' | 'mock'>('loading');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DashboardLayout
      title="Search Doctors"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Search Doctors' }]}
    >
      <div className="space-y-6">

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
            {doctors.map((doctor) => (
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
                    <Button className="ml-4">
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


      </div>
    </DashboardLayout>
  );
}