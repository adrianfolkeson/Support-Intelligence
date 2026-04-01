import Redis from 'ioredis';
import { RATE_LIMITS } from './constants';

// Lazy Redis client initialization
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  // Don't create Redis client during build time or on client-side
  if (typeof window !== 'undefined') {
    return null; // Client-side
  }

  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    return null; // No Redis URL configured in production
  }

  if (!redis && process.env.REDIS_URL) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
        // Don't connect immediately - connect on first use
        lazyConnect: true,
      });

      redis.on('error', (err) => {
        // Silently handle Redis errors - fall back to in-memory
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Redis connection error, using fallback:', err.message);
        }
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }

  return redis;
}

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
  const client = getRedisClient();

  // If Redis is not available, use fallback
  if (!client) {
    return rateLimitFallback(identifier, limit, window);
  }

  try {
    const key = `ratelimit:${identifier}`;
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, window);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = await client.ttl(key);

    return {
      success: current <= limit,
      remaining,
      reset: resetTime
    };
  } catch (error) {
    // If Redis fails, fall back to in-memory
    return rateLimitFallback(identifier, limit, window);
  }
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
