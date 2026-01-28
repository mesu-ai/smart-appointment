/**
 * Signup Page
 * 
 * Purpose: User registration with email/password
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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post<{ user: any; message: string }>(
        '/api/auth/signup',
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        }
      );

      // Redirect based on role (new users are customers, redirect to booking)
      if (response.user.role === 'ADMIN' || response.user.role === 'STAFF') {
        router.push('/dashboard');
      } else {
        router.push('/book');
      }
      
      // Force page reload to update navigation
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
            Create your account to get started
          </Text>
        </div>

        {/* Signup Card */}
        <Card padding="lg">
          <Text variant="h3" className="mb-6 text-center">
            Sign Up
          </Text>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />

            <Input
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              required
              disabled={loading}
            />

            <Input
              type="tel"
              label="Phone (Optional)"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
            />

            <Input
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <Input
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Text variant="small" className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign In
              </Link>
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
