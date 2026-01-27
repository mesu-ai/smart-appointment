/**
 * Error Response Types
 * 
 * Standardized error response format for API routes.
 */

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  errorCode?: string;
  errors?: Array<{ field: string; message: string }>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Error codes for business rule violations
 */
export enum ErrorCode {
  // Input Validation
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_TIME_SLOT = 'INVALID_TIME_SLOT',
  
  // Business Rules - Appointments
  TIME_SLOT_UNAVAILABLE = 'TIME_SLOT_UNAVAILABLE',
  DAILY_CAPACITY_EXCEEDED = 'DAILY_CAPACITY_EXCEEDED',
  DUPLICATE_APPOINTMENT = 'DUPLICATE_APPOINTMENT',
  BOOKING_TOO_SOON = 'BOOKING_TOO_SOON',
  BOOKING_TOO_FAR = 'BOOKING_TOO_FAR',
  
  // Business Rules - Operating Hours
  BUSINESS_HOURS_CLOSED = 'BUSINESS_HOURS_CLOSED',
  BUSINESS_HOURS_WEEKDAY = 'BUSINESS_HOURS_WEEKDAY',
  BUSINESS_HOURS_SATURDAY = 'BUSINESS_HOURS_SATURDAY',
  
  // Business Rules - Queue
  QUEUE_FULL = 'QUEUE_FULL',
  ALREADY_IN_QUEUE = 'ALREADY_IN_QUEUE',
  QUEUE_CLOSED = 'QUEUE_CLOSED',
  
  // Domain Invariants
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  POSITION_COLLISION = 'POSITION_COLLISION',
  
  // Resources
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
  APPOINTMENT_NOT_FOUND = 'APPOINTMENT_NOT_FOUND',
  QUEUE_ENTRY_NOT_FOUND = 'QUEUE_ENTRY_NOT_FOUND',
}

/**
 * Custom error classes
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public errorCode: ErrorCode,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}

export class DomainInvariantViolationError extends Error {
  constructor(
    message: string,
    public invariant: string
  ) {
    super(message);
    this.name = 'DomainInvariantViolationError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(
    message: string,
    public resourceType: string,
    public resourceId: string
  ) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}
