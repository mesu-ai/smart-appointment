/**
 * Domain Type Definitions
 * 
 * Application-level types used in business logic and API responses.
 * These are cleaner interfaces without MongoDB-specific fields.
 */

// ============================================
// APPOINTMENT DOMAIN TYPES
// ============================================

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface TimeSlot {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO date string
  timeSlot: TimeSlot;
  duration: number;
  status: AppointmentStatus;
  customerInfo: CustomerInfo;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// QUEUE DOMAIN TYPES
// ============================================

export type QueueStatus = 
  | 'WAITING' 
  | 'CALLED' 
  | 'IN_SERVICE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type QueuePriority = 'NORMAL' | 'HIGH';

export interface QueueEntry {
  id: string;
  serviceId: string;
  serviceName: string;
  position: number;
  status: QueueStatus;
  priority: QueuePriority;
  customerInfo: CustomerInfo;
  estimatedWaitTime: number; // Minutes
  joinedAt: string;
  calledAt?: string;
  completedAt?: string;
}

// ============================================
// SERVICE DOMAIN TYPES
// ============================================

export interface BusinessHours {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  maxDailyAppointments?: number;
  maxQueueSize?: number;
  isActive: boolean;
  businessHours: BusinessHours[];
}

// ============================================
// USER DOMAIN TYPES
// ============================================

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
