import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  handleAPIError,
  requireEnv,
  requireEnvVars,
} from '../lib/error-handler';
import { ZodError } from 'zod';

describe('Error Handling', () => {
  beforeEach(() => {
    // Reset environment before each test
    process.env.NODE_ENV = 'test';
  });

  describe('APIError', () => {
    it('should create APIError with correct properties', () => {
      const error = new APIError('Test error', 400, 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('APIError');
    });

    it('should use default status code and code', () => {
      const error = new APIError('Test');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should use default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Auth failed');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError('No permission');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with 429 status', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.retryAfter).toBe(60);
    });

    it('should use default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBeUndefined();
    });
  });

  describe('ExternalServiceError', () => {
    it('should create ExternalServiceError with 503 status', () => {
      const error = new ExternalServiceError('Stripe', 'Service down');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toBe('Service down');
    });

    it('should use default message', () => {
      const error = new ExternalServiceError('Stripe');
      expect(error.message).toBe('External service Stripe is unavailable');
    });
  });

  describe('handleAPIError', () => {
    it('should handle APIError correctly', () => {
      const error = new APIError('Test error', 400, 'TEST_ERROR');
      const response = handleAPIError(error, {
        method: 'GET',
        path: '/test',
      });

      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle ZodError correctly', () => {
      // Create a ZodError with a proper issues array
      const { ZodError } = require('zod');
      const mockIssues = [
        {
          code: 'too_small',
          path: ['email'],
          message: 'Email is required',
        },
      ];
      const zodError = new ZodError(mockIssues);

      // Verify the error has the issues property
      expect(zodError.issues).toBeDefined();
      expect(zodError.issues).toEqual(mockIssues);

      const response = handleAPIError(zodError);
      expect(response.status).toBe(400);
    });

    it('should handle generic Error correctly', () => {
      const error = new Error('Generic error');
      const response = handleAPIError(error);
      expect(response.status).toBe(500);
    });
  });

  describe('requireEnv', () => {
    it('should return env value if exists', () => {
      process.env.TEST_VAR = 'test_value';
      const value = requireEnv('TEST_VAR');
      expect(value).toBe('test_value');
    });

    it('should throw error if env var missing', () => {
      delete process.env.MISSING_VAR;
      expect(() => requireEnv('MISSING_VAR')).toThrow();
    });
  });

  describe('requireEnvVars', () => {
    it('should not throw if all vars exist', () => {
      process.env.VAR1 = 'value1';
      process.env.VAR2 = 'value2';
      expect(() => requireEnvVars(['VAR1', 'VAR2'])).not.toThrow();
    });

    it('should throw if any var missing', () => {
      process.env.VAR1 = 'value1';
      delete process.env.VAR2;
      expect(() => requireEnvVars(['VAR1', 'VAR2'])).toThrow();
    });
  });
});
