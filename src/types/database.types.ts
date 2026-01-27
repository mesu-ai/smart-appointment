/**
 * Database Type Definitions
 * 
 * MongoDB document interfaces matching the database schema.
 * These represent the actual structure stored in MongoDB.
 */

import { ObjectId } from 'mongodb';

// ============================================
// APPOINTMENT TYPES
// ============================================

export type AppointmentStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface AppointmentDocument {
  _id: ObjectId;
  serviceId: string;
  serviceName: string;
  date: Date;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  duration: number;  // Minutes
  status: AppointmentStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// QUEUE TYPES
// ============================================

export type QueueStatus = 
  | 'WAITING' 
  | 'CALLED' 
  | 'IN_SERVICE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type QueuePriority = 'NORMAL' | 'HIGH';

export interface QueueEntryDocument {
  _id: ObjectId;
  serviceId: string;
  serviceName: string;
  position: number;
  status: QueueStatus;
  priority: QueuePriority;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  estimatedWaitTime: number; // Minutes
  joinedAt: Date;
  calledAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface BusinessHoursDocument {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  openTime: string;  // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
}

export interface ServiceDocument {
  _id: ObjectId;
  name: string;
  description: string;
  duration: number; // Minutes
  price: number;
  category: string;
  maxDailyAppointments?: number;
  maxQueueSize?: number;
  isActive: boolean;
  businessHours: BusinessHoursDocument[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ============================================
// TIME SLOT LOCK TYPES
// ============================================

export interface TimeSlotLockDocument {
  _id: ObjectId;
  serviceId: string;
  date: Date;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  appointmentId: ObjectId;
  createdAt: Date;
  expiresAt: Date; // TTL index for automatic cleanup
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction = 
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_UPDATED'
  | 'APPOINTMENT_CANCELLED'
  | 'QUEUE_JOINED'
  | 'QUEUE_CALLED'
  | 'QUEUE_COMPLETED'
  | 'QUEUE_CANCELLED';

export interface AuditLogDocument {
  _id: ObjectId;
  action: AuditAction;
  entityType: 'APPOINTMENT' | 'QUEUE_ENTRY' | 'SERVICE' | 'USER';
  entityId: string;
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
