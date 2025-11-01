'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Key, Save, Copy, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('ABC Corporate Solutions');
  const [email, setEmail] = useState('agent@echannelling.com');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [address, setAddress] = useState('123 Main Street, Colombo');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleUpdateProfile = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully',
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Password Changed',
      description: 'Your password has been changed successfully',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-2"
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
                      />
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
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="text-lg font-bold text-gray-900">
                      January 2025
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">
                      Total Bookings
                    </p>
                    <p className="text-lg font-bold text-gray-900">1,248</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-sm text-gray-600 mb-1">Account Type</p>
                    <p className="text-lg font-bold text-gray-900">Corporate</p>
                  </div>
                </div>
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
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </form>
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
