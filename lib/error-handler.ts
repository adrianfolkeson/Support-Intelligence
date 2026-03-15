/**
 * Centralized Error Handler
 * Provides consistent error responses across the application
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger, logError, logRequest, logSecurityEvent } from './logger';

// Re-export logging functions for convenience
export { logRequest, logSecurityEvent };

// ============================================
// Custom Error Classes
// ============================================

/**
 * API Error - Base class for all API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Validation Error - For input validation failures
 */
export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - For auth failures
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - For permission issues
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - For missing resources
 */
export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error - For rate limiting
 */
export class RateLimitError extends APIError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * External Service Error - For third-party API failures
 */
export class ExternalServiceError extends APIError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      503,
      'EXTERNAL_SERVICE_ERROR'
    );
    this.name = 'ExternalServiceError';
  }
}

// ============================================
// Error Handler Functions
// ============================================

/**
 * Format error for API response
 * Ensures sensitive information is not leaked
 */
const formatErrorResponse = (
  error: Error | APIError | ZodError,
  includeDetails: boolean = false
): { error: string; code?: string; details?: unknown; stack?: string } => {
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof ZodError) {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  if (error instanceof APIError) {
    const response: Record<string, unknown> = {
      error: error.message,
      code: error.code,
    };

    // Include stack trace in development
    if (isDevelopment && includeDetails) {
      response.stack = error.stack;
    }

    return response as { error: string; code?: string; stack?: string };
  }

  // Generic error - don't leak details
  return {
    error: isDevelopment ? error.message : 'An unexpected error occurred',
    ...(isDevelopment && includeDetails && { stack: error.stack }),
  };
};

/**
 * Handle API errors and return appropriate NextResponse
 */
export const handleAPIError = (
  error: Error | APIError | ZodError,
  context?: {
    method?: string;
    path?: string;
    userId?: string;
    duration?: number;
  }
): NextResponse => {
  // Log the error
  if (error instanceof APIError) {
    logError({
      method: context?.method || 'UNKNOWN',
      path: context?.path || 'unknown',
      error: error.message,
      duration: context?.duration,
      userId: context?.userId,
      stack: error.stack,
      context: { code: error.code },
    });
  } else if (error instanceof ZodError) {
    logger.warn({
      type: 'validation_error',
      method: context?.method,
      path: context?.path,
      errors: error.errors,
    });
  } else {
    logError({
      method: context?.method || 'UNKNOWN',
      path: context?.path || 'unknown',
      error: error.message,
      duration: context?.duration,
      userId: context?.userId,
      stack: error.stack,
    });
  }

  // Determine status code
  let statusCode = 500;

  if (error instanceof APIError) {
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
  }

  // Format error response
  const errorResponse = formatErrorResponse(error);

  // Add rate limit headers if applicable
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (error instanceof RateLimitError && error.retryAfter) {
    headers['Retry-After'] = error.retryAfter.toString();
  }

  return NextResponse.json(errorResponse, { status: statusCode, headers });
};

/**
 * Async handler wrapper that catches errors
 * Use this to wrap all API route handlers
 */
export const withErrorHandler = <T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
  context?: { method?: string; path?: string }
): T => {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error as Error, context);
    }
  }) as T;
};

/**
 * Safe async function wrapper for non-API functions
 * Catches and logs errors without sending HTTP responses
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: { operation?: string }
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logger.error({
      type: 'async_error',
      operation: context?.operation || 'unknown',
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    return fallback;
  }
};

// ============================================
// Specific Error Handlers
// ============================================

/**
 * Handle fetch errors with retry logic
 */
export const fetchWithErrorHandling = async (
  url: string,
  options?: RequestInit,
  maxRetries: number = 3
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new ExternalServiceError(
          'fetch',
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (except 429)
      if (
        error instanceof ExternalServiceError &&
        (error as ExternalServiceError).statusCode &&
        (error as ExternalServiceError).statusCode! >= 400 &&
        (error as ExternalServiceError).statusCode! < 500 &&
        (error as ExternalServiceError).statusCode! !== 429
      ) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
        );
      }
    }
  }

  throw new ExternalServiceError(
    'fetch',
    lastError?.message || 'Max retries exceeded'
  );
};

/**
 * Validate environment variable
 * Throws error if required variable is missing
 */
export const requireEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new APIError(
      `Required environment variable ${key} is not set`,
      500,
      'CONFIGURATION_ERROR'
    );
  }

  return value;
};

/**
 * Validate multiple environment variables
 */
export const requireEnvVars = (keys: string[]): void => {
  const missing = keys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new APIError(
      `Missing required environment variables: ${missing.join(', ')}`,
      500,
      'CONFIGURATION_ERROR'
    );
  }
};
