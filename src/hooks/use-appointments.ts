/**
 * Appointments Hooks
 * 
 * React Query hooks for appointment management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { QUERY_KEYS } from '@/config/react-query.config';
import type {
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UpdateAppointmentRequest,
  UpdateAppointmentResponse,
  ListAppointmentsResponse,
} from '@/types/api.types';
import type { Appointment } from '@/types/domain.types';

/**
 * Fetch all appointments with optional filters
 */
export function useAppointments(params?: {
  serviceId?: string;
  date?: string;
  status?: string;
  customerEmail?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useQuery({
    queryKey: params ? [...QUERY_KEYS.appointments, params] : QUERY_KEYS.appointments,
    queryFn: () =>
      apiClient.get<ListAppointmentsResponse>(
        `/api/appointments${queryString ? `?${queryString}` : ''}`
      ),
  });
}

/**
 * Fetch appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.appointmentDetail(id),
    queryFn: () => apiClient.get<{ appointment: Appointment }>(`/api/appointments/${id}`),
    enabled: !!id,
  });
}

/**
 * Create appointment mutation
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      apiClient.post<CreateAppointmentResponse>('/api/appointments', data),
    onSuccess: () => {
      // Invalidate appointments list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}

/**
 * Update appointment mutation
 */
export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAppointmentRequest) =>
      apiClient.patch<UpdateAppointmentResponse>(`/api/appointments/${id}`, data),
    onSuccess: () => {
      // Invalidate specific appointment and list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointmentDetail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}

/**
 * Cancel appointment mutation
 */
export function useCancelAppointment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.delete<{ appointment: Appointment; message: string }>(`/api/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointmentDetail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}
