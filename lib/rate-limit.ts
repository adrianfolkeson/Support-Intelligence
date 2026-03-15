/**
 * Rate Limiter - In-memory implementation
 * For production, consider using Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Object with success flag and remaining requests
   */
  limit(identifier: string): { success: boolean; remaining: number; resetTime?: number } {
    const now = Date.now();

    // Get or create entry for this identifier
    let entry = this.requests.get(identifier);

    // If no entry exists or window has expired, create new entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
      this.requests.set(identifier, entry);
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    return {
      success: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get current statistics
   */
  getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.requests.values()) {
      if (now <= entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.requests.size,
      activeEntries,
    };
  }
}

// Pre-configured limiters for different use cases
export const rateLimit = {
  // API endpoints: 10 requests per minute
  api: new RateLimiter(10, 60000),

  // Authentication endpoints: 5 requests per minute (stricter)
  auth: new RateLimiter(5, 60000),

  // Public endpoints: 20 requests per minute (more lenient)
  public: new RateLimiter(20, 60000),

  // Webhook endpoints: 100 requests per minute (very lenient)
  webhook: new RateLimiter(100, 60000),
};

// Default rate limiter
export const defaultRateLimiter = rateLimit.api;
