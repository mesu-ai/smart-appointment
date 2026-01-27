/**
 * Services Hooks
 * 
 * React Query hooks for service catalog.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { QUERY_KEYS } from '@/config/react-query.config';
import type {
  ListServicesResponse,
  GetServiceResponse,
  GetAvailableSlotsResponse,
} from '@/types/api.types';

/**
 * Fetch all active services
 */
export function useServices() {
  return useQuery({
    queryKey: QUERY_KEYS.services,
    queryFn: () => apiClient.get<ListServicesResponse>('/api/services'),
  });
}

/**
 * Fetch service by ID
 */
export function useService(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.service(id),
    queryFn: () => apiClient.get<GetServiceResponse>(`/api/services/${id}`),
    enabled: !!id,
  });
}

/**
 * Fetch available time slots for a service on a specific date
 */
export function useAvailableSlots(serviceId: string, date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.availableSlots(serviceId, date),
    queryFn: () =>
      apiClient.get<GetAvailableSlotsResponse>(
        `/api/services/${serviceId}/slots?date=${date}`
      ),
    enabled: !!serviceId && !!date,
  });
}
