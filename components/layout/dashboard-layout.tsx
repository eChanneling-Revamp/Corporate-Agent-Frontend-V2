'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Toaster } from '@/components/ui/toaster';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardLayout({
  children,
  title,
  breadcrumbs,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header title={title} breadcrumbs={breadcrumbs} />
        <main className="p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
