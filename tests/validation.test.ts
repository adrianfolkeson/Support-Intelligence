describe('Input Validation', () => {
  function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  function sanitizeString(str: string, maxLength: number = 1000): string {
    return str.slice(0, maxLength).replace(/[<>"'&]/g, '');
  }

  describe('UUID validation', () => {
    it('should accept valid UUIDs', () => {
      expect(isValidUUID('71474f1d-e3c0-4b70-8874-d26cb5047cb7')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('71474f1d-e3c0-4b70-8874')).toBe(false);
      expect(isValidUUID('71474f1d-e3c0-4b70-8874-d26cb5047cb7-extra')).toBe(false);
    });

    it('should reject SQL injection attempts', () => {
      expect(isValidUUID("'; DROP TABLE organizations; --")).toBe(false);
      expect(isValidUUID('1 OR 1=1')).toBe(false);
    });
  });

  describe('String sanitization', () => {
    it('should strip dangerous HTML characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString, 1000)).toHaveLength(1000);
    });

    it('should leave safe strings unchanged', () => {
      expect(sanitizeString('Hello world 123')).toBe('Hello world 123');
    });
  });
});
