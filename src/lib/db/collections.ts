/**
 * MongoDB Collection Names
 * 
 * Centralized constants for collection names to ensure consistency
 * across the application and prevent typos.
 */

export const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  QUEUE_ENTRIES: 'queue_entries',
  SERVICES: 'services',
  USERS: 'users',
  TIME_SLOT_LOCKS: 'time_slot_locks',
  AUDIT_LOGS: 'audit_logs',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
