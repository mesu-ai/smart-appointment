"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { Card } from "@/components/molecules/Card";
import { Alert } from "@/components/molecules/Alert";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/utils/error-handler.utils";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post<{ user: any; message: string }>(
        "/api/auth",
        {
          email: "admin@smartqueue.com",
          password: "admin123",
        },
      );

      if (response.user.role === "ADMIN" || response.user.role === "STAFF") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }

      window.location.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post<{ user: any; message: string }>(
        "/api/auth",
        { email, password },
      );

      if (response.user.role === "ADMIN" || response.user.role === "STAFF") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }

      window.location.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <Text variant="h2" className="text-gray-900">
              SmartQueue
            </Text>
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
              isLoading={loading}
            >
              Sign In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Demo Login (Admin)
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <Text variant="small" className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign Up
              </Link>
            </Text>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Text variant="small" className="text-blue-900 font-semibold mb-2">
              📋 Demo Credentials:
            </Text>
            <div className="space-y-1">
              <Text variant="small" className="text-blue-800">
                <span className="font-medium">Email:</span> admin@smartqueue.com
              </Text>
              <Text variant="small" className="text-blue-800">
                <span className="font-medium">Password:</span> admin123
              </Text>
            </div>
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
