/**
 * Application Constants
 * 
 * Centralized constants for business rules and configuration.
 */

// ============================================
// BUSINESS HOURS
// ============================================

export const BUSINESS_HOURS = {
  WEEKDAY: {
    OPEN: '09:00',
    CLOSE: '17:00',
  },
  SATURDAY: {
    OPEN: '10:00',
    CLOSE: '14:00',
  },
  SUNDAY_CLOSED: true,
} as const;

// ============================================
// QUEUE SETTINGS
// ============================================

export const QUEUE_SETTINGS = {
  DEFAULT_WAIT_TIME_PER_POSITION: 15, // minutes
  MAX_WAIT_TIME_HOURS: 2,
  AUTO_CANCEL_AFTER_HOURS: 2,
} as const;

// ============================================
// APPOINTMENT SETTINGS
// ============================================

export const APPOINTMENT_SETTINGS = {
  MIN_ADVANCE_BOOKING_DAYS: 1,
  MAX_ADVANCE_BOOKING_DAYS: 90,
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 480,
  DURATION_INCREMENT_MINUTES: 15,
} as const;

// ============================================
// VALIDATION LIMITS
// ============================================

export const VALIDATION_LIMITS = {
  NAME: {
    MIN: 2,
    MAX: 100,
  },
  EMAIL: {
    MIN: 5,
    MAX: 100,
  },
  PHONE: {
    MIN: 10,
    MAX: 15,
  },
  NOTES: {
    MAX: 500,
  },
  DESCRIPTION: {
    MAX: 1000,
  },
} as const;

// ============================================
// STATUS ENUMS
// ============================================

export const APPOINTMENT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export const QUEUE_STATUSES = [
  'WAITING',
  'CALLED',
  'IN_SERVICE',
  'COMPLETED',
  'CANCELLED',
] as const;

export const QUEUE_PRIORITIES = [
  'NORMAL',
  'HIGH',
] as const;

// ============================================
// API SETTINGS
// ============================================

export const API_SETTINGS = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;
