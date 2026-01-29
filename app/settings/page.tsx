'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Key, Save, Copy, Eye, EyeOff, Loader2, Database, Download, Trash2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(''); // Single email for both login and contact
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Backup state
  const [backups, setBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('=== SETTINGS PAGE: Starting Profile Fetch ===');
        console.log('API Base URL:', 'http://localhost:3001/api');
        
        const [profileResponse, appointmentsResponse] = await Promise.all([
          api.profile.get(),
          api.appointments.getAll()
        ]);

        console.log('=== RAW API RESPONSES ===');
        console.log('Profile Response (RAW):', JSON.stringify(profileResponse, null, 2));
        console.log('Appointments Response (RAW):', appointmentsResponse);

        // Handle profile response - backend returns {success: true, data: {...}}
        const profileData: any = profileResponse;
        const profile = profileData.data || profileData;
        
        console.log('=== EXTRACTED DATA ===');
        console.log('Profile Object:', JSON.stringify(profile, null, 2));
        
        console.log('=== SETTING STATE VALUES ===');
        console.log('Setting agentName to:', profile.name);
        console.log('Setting companyName to:', profile.companyName);
        console.log('Setting email to:', profile.email);
        console.log('Setting phone to:', profile.phone);
        console.log('Setting address to:', profile.address);
        
        setAgentName(profile.name || '');
        setCompanyName(profile.companyName || '');
        // Use loginEmail from backend if available, fallback to agent email
        setEmail(profile.loginEmail || profile.email || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
        
        if (profile.createdAt) {
          const memberDate = new Date(profile.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });
          setMemberSince(memberDate);
          console.log('Setting memberSince to:', memberDate);
        }

        // Count total appointments for this agent
        const appointments: any = appointmentsResponse;
        if (Array.isArray(appointments)) {
          setTotalBookings(appointments.length);
          console.log('Setting totalBookings to:', appointments.length);
        } else if (appointments.data && Array.isArray(appointments.data)) {
          setTotalBookings(appointments.data.length);
          console.log('Setting totalBookings to:', appointments.data.length);
        }
        
        console.log('=== STATE UPDATE COMPLETE ===');
      } catch (error) {
        console.error('=== ERROR FETCHING PROFILE ===', error);
        toast({
          title: 'Error Loading Profile',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        console.log('=== PROFILE FETCH FINISHED ===');
      }
    };

    fetchProfile();
  }, [toast]);

  // Fetch backups when the Database tab is selected
  useEffect(() => {
    // Only fetch backups if user might use the Database tab
    // We'll fetch on demand when they click refresh or create backup
  }, []);

  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_51J3kX2K...',
      created: '2025-01-15',
      lastUsed: '2 hours ago',
    },
    {
      id: '2',
      name: 'Testing API Key',
      key: 'sk_test_51J3kX2K...',
      created: '2025-01-10',
      lastUsed: 'Never',
    },
  ];

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: agentName,
        companyName,
        email,
        phone,
        address
      };

      console.log('Updating profile with:', updateData);
      const response: any = await api.profile.update(updateData);
      console.log('Update response:', response);

      if (response.success) {
        // Update local state with the returned data
        if (response.data) {
          const newEmail = response.data.loginEmail || response.data.email;
          
          setAgentName(response.data.name || agentName);
          setCompanyName(response.data.companyName || companyName);
          setEmail(newEmail || email);
          setPhone(response.data.phone || phone);
          setAddress(response.data.address || address);

          // Update localStorage with the new agent data
          try {
            localStorage.setItem('agent', JSON.stringify(response.data));
            
            // Also update the user email in localStorage (login email)
            const userData = localStorage.getItem('user');
            if (userData && newEmail) {
              const user = JSON.parse(userData);
              user.email = newEmail;
              localStorage.setItem('user', JSON.stringify(user));
              console.log('[SETTINGS] Updated user login email in localStorage:', newEmail);
            }
            
            // Dispatch custom event to notify header component
            window.dispatchEvent(new Event('agentUpdated'));
            console.log('[SETTINGS] Updated agent in localStorage:', response.data);
          } catch (error) {
            console.error('[SETTINGS] Failed to update localStorage:', error);
          }
        }
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully. Use this email to login next time.',
        });
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: 'Weak Password',
        description: 'Password must contain uppercase, lowercase, and numbers',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);

      console.log('Changing password...');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (response.ok && data.success) {
        toast({
          title: 'Password Changed',
          description: data.message || 'Your password has been changed successfully',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password. Please check your current password.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'API Key Copied',
      description: 'API key has been copied to clipboard',
    });
  };

  const handleGenerateNewKey = () => {
    toast({
      title: 'New API Key Generated',
      description: 'A new API key has been generated successfully',
    });
  };

  // Backup handlers
  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const response = await fetch('http://localhost:4012/api/backup/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBackups(data.data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch backups',
        variant: 'destructive',
      });
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const token = localStorage.getItem('accessToken');
      console.log('[BACKUP] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      const response = await fetch('http://localhost:4012/api/backup/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('[BACKUP] API Response:', data);
      
      if (data.success) {
        toast({
          title: 'Backup Created',
          description: `Database backup created successfully (${(data.data.size / (1024 * 1024)).toFixed(2)} MB)`,
        });
        fetchBackups(); // Refresh the list
      } else {
        throw new Error(data.message || data.error || 'Backup failed');
      }
    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to create database backup',
        variant: 'destructive',
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:4012/api/backup/download/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download backup file',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBackup = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    
    try {
      const response = await fetch(`http://localhost:4012/api/backup/${fileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Backup Deleted',
          description: 'Backup file deleted successfully',
        });
        fetchBackups(); // Refresh the list
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete backup',
        variant: 'destructive',
      });
    }
  };

  // Debug render values
  if (typeof window !== 'undefined') {
    console.log('=== RENDER: Current State Values ===');
    console.log('agentName:', agentName);
    console.log('companyName:', companyName);
    console.log('email:', email);
    console.log('phone:', phone);
    console.log('address:', address);
    console.log('memberSince:', memberSince);
    console.log('totalBookings:', totalBookings);
    console.log('===================================');
  }

  return (
    <DashboardLayout
      title="Settings"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings' },
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    <span className="ml-2 text-gray-600">Loading profile...</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateProfile();
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="agentName">Agent Name</Label>
                        <Input
                          id="agentName"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className="mt-2"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="mt-2"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2"
                          placeholder="your.email@company.com"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Used for both login and business communications
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                      <div>
                        <Label htmlFor="address">Business Address</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-2"
                          placeholder="Enter business address"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="text-lg font-bold text-gray-900">
                        {memberSince || 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Bookings
                      </p>
                      <p className="text-lg font-bold text-gray-900">{totalBookings.toLocaleString()}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-sm text-gray-600 mb-1">Account Type</p>
                      <p className="text-lg font-bold text-gray-900">Corporate Agent</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase,
                      and numbers
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Database Backups</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      if (backups.length === 0 && !loadingBackups) {
                        fetchBackups();
                      } else {
                        fetchBackups();
                      }
                    }}
                    variant="outline"
                    disabled={loadingBackups}
                    className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingBackups ? 'animate-spin' : ''}`} />
                    {backups.length === 0 && !loadingBackups ? 'Load Backups' : 'Refresh'}
                  </Button>
                  <Button
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    {creatingBackup ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Note:</strong> Database backups are created automatically every week. You can also create manual backups here.
                    </p>
                    <p className="text-xs text-blue-600">
                      Backups include all data from your NeonDB PostgreSQL database. Keep backups secure and download them to a safe location.
                    </p>
                  </div>

                  {loadingBackups ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                      <span className="ml-2 text-gray-600">Loading backups...</span>
                    </div>
                  ) : backups.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No backups found</p>
                      <p className="text-sm">Create your first backup to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {backups.map((backup, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1 font-mono text-sm">
                                {backup.fileName}
                              </h3>
                              <div className="flex items-center space-x-4 text-xs text-gray-600">
                                <span>Size: {backup.sizeFormatted}</span>
                                <span>•</span>
                                <span>Created: {new Date(backup.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadBackup(backup.fileName)}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBackup(backup.fileName)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>API Keys</CardTitle>
                <Button
                  onClick={handleGenerateNewKey}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Generate New Key
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {apiKey.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Created on {apiKey.created}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Last used</p>
                          <p className="text-sm font-medium text-gray-900">
                            {apiKey.lastUsed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-1 p-3 rounded-lg bg-gray-100 font-mono text-sm text-gray-700">
                          {apiKey.key}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Keep your API keys secure and never
                    share them publicly. If you believe a key has been
                    compromised, generate a new one immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
