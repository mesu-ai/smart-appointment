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
  if (error instanceof ValidationError) {
    return createErrorResponse(
      400,
      'Validation Failed',
      error.message,
      undefined,
      error.errors
    );
  }

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

  // For generic errors, extract the most meaningful message
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check if it's a MongoDB error
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      errorMessage = 'Database error occurred. Please try again.';
    }
    
    // Check for timeout errors
    if (error.message.toLowerCase().includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    }
  }

  return createErrorResponse(
    500,
    'Internal Server Error',
    errorMessage
  );
}
