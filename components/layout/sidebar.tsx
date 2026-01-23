'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Calendar,
  CheckCircle2,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Search Doctors',
    href: '/doctors',
    icon: Search,
  },
  {
    title: 'Bulk Booking',
    href: '/bulk-booking',
    icon: Users,
  },
  {
    title: 'Confirm ACB',
    href: '/confirm-acb',
    icon: CheckCircle2,
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Get refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call backend logout endpoint
      if (refreshToken) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dpdlab1.slt.lk:8645/corp-agent/api';
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
      
      // Clear all auth data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('agent');
      localStorage.removeItem('authToken'); // legacy
      
      console.log('[AUTH] Logged out successfully');
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      // Still clear local data and redirect even if API call fails
      localStorage.clear();
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          // Desktop behavior
          'hidden lg:flex lg:flex-col',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile behavior
          'lg:translate-x-0',
          mobileOpen ? 'flex flex-col translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-3 flex-1">
              <Image
                src="/logo.png"
                alt="eChannelling"
                width={120}
                height={40}
                priority
                className="object-contain w-auto h-auto"
              />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100',
                  collapsed ? 'justify-center' : 'space-x-3'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50',
              collapsed ? 'justify-center' : 'space-x-3'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium truncate">Logout</span>
            )}
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div
            className={cn(
              'bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4',
              collapsed && 'p-2'
            )}
          >
            {!collapsed ? (
              <>
                <p className="text-xs font-semibold text-cyan-700 mb-1">
                  Need Help?
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Contact our support team
                </p>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium py-2 rounded-lg hover:shadow-md transition-all">
                  Get Support
                </button>
              </>
            ) : (
              <div className="text-cyan-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
