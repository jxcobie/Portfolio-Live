import { NextRequest } from 'next/server';
import { RateLimitInfo } from '@/app/types/portfolio';

/**
 * Simple in-memory rate limiter for API endpoints
 * In production, use Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  GET: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  POST: { requests: 20, windowMs: 15 * 60 * 1000 }, // 20 requests per 15 minutes
  PUT: { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  DELETE: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
} as const;

/**
 * Get client identifier from request
 *
 * @param request - Next.js request object
 * @returns Client identifier string
 */
function getClientId(request: NextRequest): string {
  // In production, you might want to use a more sophisticated identifier
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

  // Include user agent in the identifier to prevent basic spoofing
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 10);

  return `${clientIp}_${userAgentHash}`;
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if request is within rate limit
 *
 * @param request - Next.js request object
 * @param method - HTTP method
 * @returns Rate limit information
 */
export function checkRateLimit(
  request: NextRequest,
  method: keyof typeof RATE_LIMITS
): RateLimitInfo & { allowed: boolean } {
  cleanupExpiredEntries();

  const clientId = getClientId(request);
  const key = `${clientId}_${method}`;
  const limit = RATE_LIMITS[method];
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry) {
    // First request from this client for this method
    entry = {
      count: 1,
      resetTime: now + limit.windowMs,
      firstRequest: now,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      limit: limit.requests,
      remaining: limit.requests - 1,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }

  if (now > entry.resetTime) {
    // Reset window has passed
    entry.count = 1;
    entry.resetTime = now + limit.windowMs;
    entry.firstRequest = now;

    return {
      allowed: true,
      limit: limit.requests,
      remaining: limit.requests - 1,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }

  // Within the current window
  entry.count++;

  if (entry.count > limit.requests) {
    // Rate limit exceeded
    return {
      allowed: false,
      limit: limit.requests,
      remaining: 0,
      reset: Math.ceil(entry.resetTime / 1000),
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    limit: limit.requests,
    remaining: limit.requests - entry.count,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}

/**
 * Add rate limit headers to response
 *
 * @param rateLimitInfo - Rate limit information
 * @returns Headers object
 */
export function getRateLimitHeaders(rateLimitInfo: RateLimitInfo): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': rateLimitInfo.reset.toString(),
  };

  if (rateLimitInfo.retryAfter) {
    headers['Retry-After'] = rateLimitInfo.retryAfter.toString();
  }

  return headers;
}
