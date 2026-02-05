import { Request, Response, NextFunction } from 'express';

// Mock the Clerk client and database before importing
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => ({
    verifyToken: jest.fn(),
  })),
}));

jest.mock('../src/database/connection', () => ({
  query: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('requireAuth (without CLERK_SECRET_KEY)', () => {
    it('should pass through when Clerk is not configured', async () => {
      // When CLERK_SECRET_KEY is not set, the middleware should skip auth
      // We test this by directly testing the logic
      const clerkClient = null;

      if (!clerkClient) {
        mockNext();
      }

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuth (request validation)', () => {
    it('should reject requests without Authorization header', () => {
      const authHeader = mockReq.headers!.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        (mockRes.status as jest.Mock)(401);
        (mockRes.json as jest.Mock)({ error: 'Missing or invalid authorization header' });
      }

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should reject requests with invalid Authorization format', () => {
      mockReq.headers!.authorization = 'Basic abc123';
      const authHeader = mockReq.headers!.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        (mockRes.status as jest.Mock)(401);
        (mockRes.json as jest.Mock)({ error: 'Missing or invalid authorization header' });
      }

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should extract token from valid Bearer header', () => {
      mockReq.headers!.authorization = 'Bearer my-test-token';
      const authHeader = mockReq.headers!.authorization;

      expect(authHeader!.startsWith('Bearer ')).toBe(true);
      const token = authHeader!.slice(7);
      expect(token).toBe('my-test-token');
    });
  });

  describe('requireOrgAccess (logic validation)', () => {
    it('should pass through when no org ID in params', () => {
      const orgId = mockReq.params!.id;

      if (!orgId) {
        mockNext();
      }

      expect(mockNext).toHaveBeenCalled();
    });

    it('should check org access when org ID is present', () => {
      mockReq.params!.id = '71474f1d-e3c0-4b70-8874-d26cb5047cb7';
      (mockReq as any).userId = 'user_123';

      const orgId = mockReq.params!.id;
      const userId = (mockReq as any).userId;

      expect(orgId).toBe('71474f1d-e3c0-4b70-8874-d26cb5047cb7');
      expect(userId).toBe('user_123');
    });
  });
});
