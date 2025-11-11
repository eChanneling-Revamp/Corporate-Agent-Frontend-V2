'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, User, LogOut, Settings, Menu } from 'lucide-react';
import { api } from '@/lib/api';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  appointmentId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.notifications.getAll();
        if (response.success) {
          setNotifications(response.data);
          setUnreadCount(response.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      // Get refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call backend logout endpoint
      if (refreshToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_RECEIVED':
        return 'bg-cyan-50 border-cyan-200';
      case 'APPOINTMENT_CONFIRMED':
        return 'bg-green-50 border-green-200';
      case 'APPOINTMENT_CANCELLED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between min-h-[60px]">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden flex-shrink-0 mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex-1 flex flex-col justify-center min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {crumb.href ? (
                    <button
                      onClick={() => router.push(crumb.href!)}
                      className="hover:text-cyan-600 transition-colors whitespace-nowrap"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 font-medium whitespace-nowrap">
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Search - hidden on mobile, shown on tablet+ */}
          <div className="relative hidden md:flex w-48 lg:w-80 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              type="search"
              placeholder="Search doctors, appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 w-full"
            />
          </div>

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
          >
            <Search className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-2">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs text-cyan-600 hover:text-cyan-700"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2 max-h-[400px] overflow-y-auto">
                {notifications.filter(n => !n.isRead).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => !n.isRead)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${
                          getNotificationColor(notif.type)
                        } ring-2 ring-cyan-400 ring-opacity-50`}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 flex-1">
                            {notif.title}
                          </p>
                          <span className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0 ml-2 mt-1" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 hover:bg-gray-100 h-auto py-2 px-3 flex-shrink-0"
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                    CA
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    Corporate Agent
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    agent@echannelling.com
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
