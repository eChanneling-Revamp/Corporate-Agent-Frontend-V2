'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('[AUTH] Attempting login for:', email);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dpdlab1.slt.lk:8645/corp-agent/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        if (data.data.agent) {
          localStorage.setItem('agent', JSON.stringify(data.data.agent));
        }

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.data.agent?.name || data.data.user.email}!`,
        });
        
        console.log('[SUCCESS] Login successful, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.log('[ERROR] Login failed:', data.message);
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[ERROR] Login error:', error);
      toast({
        title: 'Error',
        description: 'Unable to connect to server. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="eChannelling"
                  width={120}
                  height={60}
                  priority
                  className="object-contain w-auto h-auto"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Corporate Agent Portal
            </h1>
            <p className="text-cyan-100 text-sm">
              Manage appointments, doctors, and reports
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="corporateagent@slt.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Demo credentials:{' '}
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  corporateagent@slt.lk / ABcd123#
                </span>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 eChannelling. All rights reserved.
        </p>
      </div>
    </div>
  );
}
