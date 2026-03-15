/**
 * Structured Logger using Pino
 * Provides consistent logging format across the application
 */

import pino from 'pino';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Logger configuration
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Create logger instance
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  // In development, use pretty print
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // In production, use JSON format
  // Redact sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.apiKey',
      'req.body.apiKey',
      'req.body.secret',
      'res.headers.authorization',
    ],
    remove: true,
  },
  // Add timestamp and error fields
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Base context
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'support-intelligence',
  },
});

/**
 * API request logger
 */
export const logRequest = (data: {
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
}): void => {
  logger.info({
    type: 'api_request',
    ...data,
  });
};

/**
 * API error logger
 */
export const logError = (data: {
  method: string;
  path: string;
  error: string;
  duration?: number;
  userId?: string;
  stack?: string;
  context?: Record<string, unknown>;
}): void => {
  logger.error({
    type: 'api_error',
    ...data,
  });
};

/**
 * Security event logger
 */
export const logSecurityEvent = (data: {
  event: 'rate_limit_exceeded' | 'auth_failure' | 'suspicious_activity' | 'unauthorized_access';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, unknown>;
}): void => {
  logger.warn({
    type: 'security_event',
    ...data,
  });
};

/**
 * Database query logger
 */
export const logQuery = (data: {
  query: string;
  duration: number;
  rows?: number;
}): void => {
  if (isDevelopment) {
    logger.debug({
      type: 'database_query',
      ...data,
    });
  }
};

/**
 * Background job logger
 */
export const logJob = (data: {
  job: string;
  status: 'started' | 'completed' | 'failed';
  duration?: number;
  details?: Record<string, unknown>;
}): void => {
  const level = data.status === 'failed' ? 'error' : 'info';

  logger[level]({
    type: 'background_job',
    ...data,
  });
};

/**
 * Create child logger with additional context
 */
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

/**
 * Express/Next.js middleware logger
 */
export const logMiddleware = (req: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  ip?: string;
}) => {
  return {
    method: req.method || 'UNKNOWN',
    path: req.url || 'unknown',
    ip: req.ip || req.headers?.['x-forwarded-for'] as string || 'unknown',
    userAgent: req.headers?.['user-agent'] || 'unknown',
  };
};

/**
 * Performance logger
 */
export const logPerformance = (data: {
  operation: string;
  duration: number;
  metadata?: Record<string, unknown>;
}): void => {
  const threshold = 1000; // 1 second threshold
  const level = data.duration > threshold ? 'warn' : 'debug';

  logger[level]({
    type: 'performance',
    ...data,
    threshold,
  });
};

/**
 * Audit log for sensitive operations
 */
export const logAudit = (data: {
  action: string;
  userId?: string;
  target?: string;
  details: Record<string, unknown>;
}): void => {
  logger.info({
    type: 'audit_log',
    ...data,
  });
};

/**
 * Rate limit logger
 */
export const logRateLimit = (data: {
  identifier: string;
  limit: number;
  remaining: number;
  resetTime: number;
}): void => {
  logger.warn({
    type: 'rate_limit',
    ...data,
  });
};

// Export default logger
export default logger;
