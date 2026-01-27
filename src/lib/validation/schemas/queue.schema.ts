/**
 * Validation Schemas - Queue
 * 
 * Zod schemas for queue-related requests.
 */

import { z } from 'zod';
import {
  UuidSchema,
  NotesSchema,
} from './value-objects.schema';
import { CustomerInfoSchema } from './appointment.schema';

/**
 * Join queue request schema
 */
export const JoinQueueSchema = z.object({
  serviceId: UuidSchema,
  customerInfo: CustomerInfoSchema,
  priority: z.enum(['NORMAL', 'HIGH']).default('NORMAL'),
});

/**
 * Update queue entry request schema
 */
export const UpdateQueueEntrySchema = z.object({
  status: z.enum(['WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED']).optional(),
  position: z.number().int().positive().optional(),
});

/**
 * List queue query schema
 */
export const ListQueueQuerySchema = z.object({
  serviceId: UuidSchema.optional(),
  status: z.enum(['WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED']).optional(),
});

// Type exports
export type JoinQueueInput = z.infer<typeof JoinQueueSchema>;
export type UpdateQueueEntryInput = z.infer<typeof UpdateQueueEntrySchema>;
export type ListQueueQuery = z.infer<typeof ListQueueQuerySchema>;
