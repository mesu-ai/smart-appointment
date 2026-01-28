import type { ErrorResponse } from '@/types/error.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode?: string,
    public errors?: Array<{ field: string; message: string }>,
    public metadata?: Record<string, unknown>,
    message?: string
  ) {
    super(message || 'An error occurred');
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorResponse;
    
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        response.status,
        undefined,
        undefined,
        { statusText: response.statusText },
        response.statusText || 'Request failed'
      );
    }
    
    throw new ApiError(
      errorData.statusCode,
      errorData.errorCode,
      errorData.errors,
      errorData.metadata,
      errorData.message
    );
  }

  return response.json();
}

async function makeFetchRequest<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'same-origin',
    });
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        undefined,
        { originalError: error.message },
        'Network error. Please check your connection.'
      );
    }
    
    throw new ApiError(
      500,
      'UNKNOWN_ERROR',
      undefined,
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      'Something went wrong. Please try again.'
    );
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    return makeFetchRequest<T>(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return makeFetchRequest<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return makeFetchRequest<T>(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return makeFetchRequest<T>(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
