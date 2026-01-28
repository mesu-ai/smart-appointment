import { ApiError } from '@/lib/api/client';

export interface ErrorMessage {
  title: string;
  message: string;
}

export function extractErrorMessage(error: unknown): ErrorMessage {
  if (error instanceof ApiError) {
    // Priority 1: For validation errors, prefer field-level errors
    if ((error.statusCode === 400 || error.statusCode === 422) && error.errors && error.errors.length > 0) {
      const fieldErrors = error.errors.map(e => e.message).join(', ');
      return {
        title: 'Validation Error',
        message: fieldErrors,
      };
    }
    
    // Priority 2: Use the message from backend response (if meaningful)
    if (error.message && error.message !== 'An error occurred' && error.message !== 'Request failed') {
      return {
        title: error.statusCode >= 500 ? 'Server Error' : 'Error',
        message: error.message,
      };
    }
    
    // Priority 3: Status-code-based fallbacks (only if no meaningful message)
    if (error.statusCode === 401) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue',
      };
    }
    
    if (error.statusCode === 403) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action',
      };
    }
    
    if (error.statusCode === 404) {
      return {
        title: 'Not Found',
        message: 'The requested resource was not found',
      };
    }
    
    if (error.statusCode >= 500) {
      return {
        title: 'Server Error',
        message: 'Something went wrong. Please try again later.',
      };
    }
    
    return {
      title: 'Error',
      message: 'Something went wrong. Please try again.',
    };
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }
  
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('network')) {
      return {
        title: 'Network Error',
        message: 'Unable to connect. Please try again.',
      };
    }
    
    return {
      title: 'Error',
      message: error.message,
    };
  }
  
  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
  };
}

export function getErrorMessage(error: unknown): string {
  const { message } = extractErrorMessage(error);
  return message;
}
