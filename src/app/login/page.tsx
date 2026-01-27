/**
 * Login Page
 * 
 * Purpose: User authentication with email/password
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
import { Card } from '@/components/molecules/Card';
import { Alert } from '@/components/molecules/Alert';
import { apiClient } from '@/lib/api/client';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post<{ user: any; message: string }>(
        '/api/auth',
        { email, password }
      );

      // Redirect based on role
      if (response.user.role === 'ADMIN' || response.user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      
      // Force page reload to update navigation
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <Text variant="h2" className="text-gray-900">SmartQueue</Text>
          </Link>
          <Text variant="body" className="text-gray-600">
            Sign in to manage appointments and queues
          </Text>
        </div>

        {/* Login Card */}
        <Card padding="lg">
          <Text variant="h3" className="mb-6 text-center">
            Login
          </Text>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartqueue.com"
              required
              disabled={loading}
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Text variant="small" className="text-gray-700 font-medium mb-2">
              Demo Credentials:
            </Text>
            <Text variant="small" className="text-gray-600">
              Email: admin@smartqueue.com
            </Text>
            <Text variant="small" className="text-gray-600">
              Password: admin123
            </Text>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
