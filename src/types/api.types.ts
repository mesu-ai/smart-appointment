/**
 * API Request/Response Types
 * 
 * Types for API endpoints request and response payloads.
 */

import type { Appointment, QueueEntry, Service, AppointmentStatus, QueueStatus, QueuePriority } from './domain.types';

// ============================================
// APPOINTMENT API TYPES
// ============================================

export interface CreateAppointmentRequest {
  serviceId: string;
  date: string; // YYYY-MM-DD
  timeSlot: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
}

export interface CreateAppointmentResponse {
  appointment: Appointment;
  message: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentResponse {
  appointment: Appointment;
  message: string;
}

export interface ListAppointmentsQuery {
  serviceId?: string;
  date?: string;
  status?: AppointmentStatus;
  customerEmail?: string;
}

export interface ListAppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

// ============================================
// QUEUE API TYPES
// ============================================

export interface JoinQueueRequest {
  serviceId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  priority?: QueuePriority;
}

export interface JoinQueueResponse {
  queueEntry: QueueEntry;
  message: string;
}

export interface UpdateQueueEntryRequest {
  status?: QueueStatus;
  position?: number;
}

export interface UpdateQueueEntryResponse {
  queueEntry: QueueEntry;
  message: string;
}

export interface ListQueueQuery {
  serviceId?: string;
  status?: QueueStatus;
}

export interface ListQueueResponse {
  queue: QueueEntry[];
  total: number;
}

export interface CallNextResponse {
  queueEntry: QueueEntry | null;
  message: string;
}

// ============================================
// SERVICE API TYPES
// ============================================

export interface ListServicesResponse {
  services: Service[];
  total: number;
}

export interface GetServiceResponse {
  service: Service;
}

export interface GetAvailableSlotsQuery {
  date: string; // YYYY-MM-DD
}

export interface GetAvailableSlotsResponse {
  slots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  date: string;
}
