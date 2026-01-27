/**
 * Error Utility Functions
 * 
 * Helpers for formatting error responses.
 */

import { NextResponse } from 'next/server';
import type { ErrorResponse } from '@/types/error.types';
import { 
  ValidationError, 
  BusinessRuleViolationError, 
  DomainInvariantViolationError,
  ResourceNotFoundError 
} from '@/types/error.types';

/**
 * Create standardized error response
 */
export function createErrorResponse(
  statusCode: number,
  error: string,
  message: string,
  errorCode?: string,
  errors?: Array<{ field: string; message: string }>,
  metadata?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    statusCode,
    error,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errorCode) response.errorCode = errorCode;
  if (errors) response.errors = errors;
  if (metadata) response.metadata = metadata;

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // Validation errors (400)
  if (error instanceof ValidationError) {
    return createErrorResponse(
      400,
      'Validation Failed',
      error.message,
      undefined,
      error.errors
    );
  }

  // Business rule violations (422)
  if (error instanceof BusinessRuleViolationError) {
    return createErrorResponse(
      422,
      'Business Rule Violation',
      error.message,
      error.errorCode,
      undefined,
      error.metadata
    );
  }

  // Domain invariant violations (409)
  if (error instanceof DomainInvariantViolationError) {
    return createErrorResponse(
      409,
      'Domain Invariant Violation',
      error.message,
      undefined,
      undefined,
      { invariant: error.invariant }
    );
  }

  // Resource not found (404)
  if (error instanceof ResourceNotFoundError) {
    return createErrorResponse(
      404,
      'Resource Not Found',
      error.message,
      undefined,
      undefined,
      { resourceType: error.resourceType, resourceId: error.resourceId }
    );
  }

  // Generic errors (500)
  return createErrorResponse(
    500,
    'Internal Server Error',
    error instanceof Error ? error.message : 'An unexpected error occurred'
  );
}
