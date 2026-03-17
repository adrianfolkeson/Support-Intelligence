import Redis from 'ioredis';
import { RATE_LIMITS } from './constants';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

// Rate limit by IP + organization for multi-tenant
export async function rateLimit({
  identifier,  // combination of orgId:ip
  limit = 100,
  window = 60
}: {
  identifier: string;
  limit?: number;
  window?: number;
}) {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  const remaining = Math.max(0, limit - current);
  const resetTime = await redis.ttl(key);

  return {
    success: current <= limit,
    remaining,
    reset: resetTime
  };
}

// Fallback for local dev without Redis
const inMemoryStore = new Map<string, { count: number; reset: number }>();

export function rateLimitFallback(identifier: string, limit = 100, windowSec = 60) {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  const current = inMemoryStore.get(key);

  if (!current || now > current.reset) {
    inMemoryStore.set(key, { count: 1, reset: now + windowSec * 1000 });
    return { success: true, remaining: limit - 1, reset: windowSec };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0, reset: Math.ceil((current.reset - now) / 1000) };
  }

  current.count++;
  return { success: true, remaining: limit - current.count, reset: Math.ceil((current.reset - now) / 1000) };
}

// Per-organization rate limiting
export async function rateLimitByOrg({
  orgId,
  limit = RATE_LIMITS.API.requests,
  windowSec = 60
}: {
  orgId: string;
  limit?: number;
  windowSec?: number;
}) {
  // Use organization-specific prefix
  return rateLimit({
    identifier: `org:${orgId}`,
    limit,
    window: windowSec
  });
}

// Combined IP + Org rate limiting (stricter)
export async function rateLimitOrgIP({
  orgId,
  ip,
  limit = RATE_LIMITS.PUBLIC.requests,
  windowSec = 60
}: {
  orgId: string;
  ip: string;
  limit?: number;
  windowSec?: number;
}) {
  return rateLimit({
    identifier: `org:${orgId}:ip:${ip}`,
    limit,
    window: windowSec
  });
}
