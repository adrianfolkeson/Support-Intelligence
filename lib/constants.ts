// Rate limiting
export const RATE_LIMITS = {
  PUBLIC: { requests: 20, windowMs: 60000 },
  WEBHOOK: { requests: 100, windowMs: 60000 },
  API: { requests: 1000, windowMs: 60000 },
} as const;

// Validation lengths
export const VALIDATION_LIMITS = {
  EMAIL_MAX: 255,
  NAME_MIN: 2,
  NAME_MAX: 100,
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  CATEGORY_MAX: 50,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
} as const;
