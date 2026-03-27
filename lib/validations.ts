/**
 * Input Validation Schemas using Zod
 * Provides type-safe validation for API inputs
 */

import { z } from 'zod';

// ============================================
// Common Validation Patterns
// ============================================

/**
 * Sanitize string input - removes dangerous characters
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .trim();
};

/**
 * Validate and sanitize email
 */
export const emailSchema = z
  .string()
  .max(255, 'Email too long')
  .email('Invalid email address')
  .transform(sanitizeString);

/**
 * Validate URL
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(url => url.startsWith('https://'), 'URL must use HTTPS')
  .transform(sanitizeString);

/**
 * Validate UUID
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

// ============================================
// Organization Validation
// ============================================

/**
 * Organization name validation
 */
export const organizationNameSchema = z
  .string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name must be less than 100 characters')
  .transform(sanitizeString)
  .refine(
    name => /^[a-zA-Z0-9\s\-_.@]+$/.test(name),
    'Organization name contains invalid characters'
  );

/**
 * Create organization schema
 */
export const createOrganizationSchema = z.object({
  organizationName: organizationNameSchema,
});

// ============================================
// Checkout Validation
// ============================================

/**
 * Checkout request validation
 */
export const checkoutSchema = z.object({
  organizationName: organizationNameSchema,
});

// ============================================
// Support Ticket Validation
// ============================================

/**
 * Ticket priority validation
 */
export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Ticket status validation
 */
export const ticketStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);

/**
 * Create ticket schema
 */
export const createTicketSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long')
    .transform(sanitizeString),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long')
    .transform(sanitizeString),
  priority: ticketPrioritySchema.optional().default('medium'),
  category: z
    .string()
    .max(50, 'Category too long')
    .transform(sanitizeString)
    .optional(),
});

/**
 * Update ticket schema
 */
export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long')
    .transform(sanitizeString)
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long')
    .transform(sanitizeString)
    .optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
});

// ============================================
// User Validation
// ============================================

/**
 * User name validation
 */
export const userNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .transform(sanitizeString)
  .refine(
    name => /^[a-zA-Z\s\-']+$/.test(name),
    'Name contains invalid characters'
  );

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  name: userNameSchema.optional(),
  email: emailSchema.optional(),
});

// ============================================
// API Request Validation
// ============================================

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

/**
 * Search query validation
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long')
    .transform(sanitizeString),
  ...paginationSchema.shape,
});

// ============================================
// Webhook Validation
// ============================================

/**
 * Stripe webhook signature validation placeholder
 * Actual validation happens in the route handler
 */
export const webhookSchema = z.object({
  signature: z.string().min(1, 'Webhook signature required'),
  payload: z.any(), // Payload validated by Stripe SDK
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate request body against schema
 * Returns { success: true, data: validatedData } or { success: false, error: z.ZodError }
 */
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
};

/**
 * Format Zod error for API response
 */
export const formatZodError = (error: z.ZodError): {
  error: string;
  details: Array<{ field: string; message: string }>;
} => {
  return {
    error: 'Validation failed',
    details: error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
};
