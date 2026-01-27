/**
 * React Query Configuration
 * 
 * Default configuration for TanStack Query.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Query keys for cache management
 */
export const QUERY_KEYS = {
  // Appointments
  appointments: ['appointments'] as const,
  appointmentDetail: (id: string) => ['appointments', id] as const,
  appointmentsByDate: (date: string) => ['appointments', 'date', date] as const,
  appointmentsByService: (serviceId: string) => ['appointments', 'service', serviceId] as const,
  
  // Queue
  queue: ['queue'] as const,
  queueByService: (serviceId: string) => ['queue', 'service', serviceId] as const,
  queueEntry: (id: string) => ['queue', id] as const,
  
  // Services
  services: ['services'] as const,
  service: (id: string) => ['services', id] as const,
  availableSlots: (serviceId: string, date: string) => 
    ['services', serviceId, 'slots', date] as const,
  
  // Health
  health: ['health'] as const,
} as const;
