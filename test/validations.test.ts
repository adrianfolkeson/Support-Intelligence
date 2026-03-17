import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  organizationNameSchema,
  createOrganizationSchema,
  createTicketSchema,
  updateTicketSchema,
  userNameSchema,
  validateRequest
} from '../lib/validations';

describe('Validations', () => {
  describe('emailSchema', () => {
    it('should validate correct emails', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid emails', () => {
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });
  });

  describe('organizationNameSchema', () => {
    it('should validate valid organization names', () => {
      const result = organizationNameSchema.safeParse('Acme Corp');
      expect(result.success).toBe(true);
    });

    it('should reject names that are too short', () => {
      const result = organizationNameSchema.safeParse('A');
      expect(result.success).toBe(false);
    });

    it('should reject names that are too long', () => {
      const result = organizationNameSchema.safeParse('A'.repeat(101));
      expect(result.success).toBe(false);
    });
  });

  describe('createOrganizationSchema', () => {
    it('should validate valid organization data', () => {
      const result = createOrganizationSchema.safeParse({
        organizationName: 'Test Organization'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createTicketSchema', () => {
    it('should validate valid ticket', () => {
      const ticket = {
        title: 'Need help with billing',
        description: 'My invoice is wrong',
        category: 'billing'
      };
      const result = createTicketSchema.safeParse(ticket);
      expect(result.success).toBe(true);
    });

    it('should reject short titles', () => {
      const ticket = { title: 'Hi', description: 'Test description here' };
      const result = createTicketSchema.safeParse(ticket);
      expect(result.success).toBe(false);
    });

    it('should reject short descriptions', () => {
      const ticket = { title: 'A valid title', description: 'Short' };
      const result = createTicketSchema.safeParse(ticket);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTicketSchema', () => {
    it('should accept partial updates', () => {
      const update = { title: 'Updated title' };
      const result = updateTicketSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it('should reject invalid priority', () => {
      const update = { priority: 'invalid' };
      const result = updateTicketSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });

  describe('userNameSchema', () => {
    it('should validate valid names', () => {
      const result = userNameSchema.safeParse('John Doe');
      expect(result.success).toBe(true);
    });

    it('should reject names with numbers', () => {
      const result = userNameSchema.safeParse('John123');
      expect(result.success).toBe(false);
    });
  });

  describe('validateRequest', () => {
    it('should return success with data for valid input', () => {
      const result = validateRequest(emailSchema, 'test@example.com');
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      } else {
        throw new Error('Expected success');
      }
    });

    it('should return error for invalid input', () => {
      const result = validateRequest(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
    });
  });
});
