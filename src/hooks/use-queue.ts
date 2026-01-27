/**
 * Queue Hooks
 * 
 * React Query hooks for queue management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { QUERY_KEYS } from '@/config/react-query.config';
import type {
  JoinQueueRequest,
  JoinQueueResponse,
  UpdateQueueEntryRequest,
  UpdateQueueEntryResponse,
  ListQueueResponse,
  CallNextResponse,
} from '@/types/api.types';
import type { QueueEntry } from '@/types/domain.types';

/**
 * Fetch queue entries with optional filters
 */
export function useQueue(params?: {
  serviceId?: string;
  status?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString();

  return useQuery({
    queryKey: params ? [...QUERY_KEYS.queue, params] : QUERY_KEYS.queue,
    queryFn: () =>
      apiClient.get<ListQueueResponse>(
        `/api/queue${queryString ? `?${queryString}` : ''}`
      ),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

/**
 * Fetch queue entry by ID
 */
export function useQueueEntry(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.queueEntry(id),
    queryFn: () => apiClient.get<{ queueEntry: QueueEntry }>(`/api/queue/${id}`),
    enabled: !!id,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

/**
 * Join queue mutation
 */
export function useJoinQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinQueueRequest) =>
      apiClient.post<JoinQueueResponse>('/api/queue', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queue });
    },
  });
}

/**
 * Update queue entry mutation
 */
export function useUpdateQueueEntry(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQueueEntryRequest) =>
      apiClient.patch<UpdateQueueEntryResponse>(`/api/queue/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queueEntry(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queue });
    },
  });
}

/**
 * Leave queue mutation
 */
export function useLeaveQueue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.delete<{ queueEntry: QueueEntry; message: string }>(`/api/queue/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queueEntry(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queue });
    },
  });
}

/**
 * Call next in queue mutation
 */
export function useCallNext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      apiClient.post<CallNextResponse>('/api/queue/next', { serviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.queue });
    },
  });
}
