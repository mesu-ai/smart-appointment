/**
 * Validation Schemas - Appointment
 * 
 * Zod schemas for appointment-related requests.
 */

import { z } from 'zod';
import {
  EmailSchema,
  PhoneSchema,
  NameSchema,
  DateStringSchema,
  TimeSlotSchema,
  NotesSchema,
  UuidSchema,
} from './value-objects.schema';

/**
 * Customer info schema
 */
export const CustomerInfoSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  phone: PhoneSchema,
  notes: NotesSchema,
});

/**
 * Create appointment request schema
 */
export const CreateAppointmentSchema = z.object({
  serviceId: UuidSchema,
  date: DateStringSchema,
  timeSlot: TimeSlotSchema,
  customerInfo: CustomerInfoSchema,
});

/**
 * Update appointment request schema
 */
export const UpdateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
});

/**
 * List appointments query schema
 */
export const ListAppointmentsQuerySchema = z.object({
  serviceId: UuidSchema.optional(),
  date: DateStringSchema.optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  customerEmail: EmailSchema.optional(),
});

// Type exports
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof ListAppointmentsQuerySchema>;
