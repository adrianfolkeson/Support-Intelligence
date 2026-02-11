import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { query } from '../../database/connection';

const secretKey = process.env.CLERK_SECRET_KEY;

/**
 * Middleware that verifies Clerk session token and attaches user info to request.
 * Uses the Clerk Backend SDK for proper token verification.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!secretKey) {
    // Clerk not configured — skip auth (development mode)
    req.userId = 'dev-user';
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    // Verify token with Clerk Backend SDK
    const payload = await verifyToken(token, { secretKey });

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Attach user info to request
    (req as any).userId = payload.sub;
    (req as any).clerkUserId = payload.sub; // Alternative name

    next();
  } catch (error: any) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired session token', details: error.message });
  }
}

/**
 * Middleware that checks authenticated user has access to the requested organization.
 * Must be used after requireAuth and on routes with an :id param (organization ID).
 */
export async function requireOrgAccess(req: Request, res: Response, next: NextFunction) {
  if (!secretKey) {
    return next();
  }

  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const orgId = req.params.id;
  if (!orgId) {
    return next();
  }

  try {
    const result = await query(
      'SELECT 1 FROM user_organizations WHERE user_id = $1 AND organization_id = $2',
      [userId, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this organization' });
    }

    next();
  } catch (error: any) {
    console.error('Org access check error:', error);
    return res.status(500).json({ error: 'Failed to verify organization access' });
  }
}
