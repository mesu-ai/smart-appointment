/**
 * Client-side Authentication Hook
 * 
 * Provides authentication state and utilities for client components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/domain.types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    
    async function fetchAuth() {
      try {
        const response = await apiClient.get<{ user: User }>('/api/auth');
        if (!cancelled) {
          setState({ user: response.user, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ user: null, loading: false, error: null });
        }
      }
    }
    
    fetchAuth();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/api/auth');
      setState({ user: response.user, loading: false, error: null });
    } catch (error) {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  const logout = async () => {
    try {
      await apiClient.delete('/api/auth');
      setState({ user: null, loading: false, error: null });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'ADMIN',
    isStaff: state.user?.role === 'STAFF' || state.user?.role === 'ADMIN',
    logout,
    refetch: checkAuth,
  };
}
