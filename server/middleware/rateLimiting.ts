/**
 * RATE LIMITING MIDDLEWARE
 * 
 * Implements rate limiting for tRPC procedures to prevent abuse and ensure
 * fair resource allocation. Supports per-endpoint and per-user rate limiting.
 */

import { TRPCError } from "@trpc/server";
import type { NextFunction, Request, Response } from "express";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limit store
 * For production, use Redis or similar distributed cache
 */
const rateLimitStores: { [key: string]: RateLimitStore } = {};

/**
 * Create a rate limiting middleware for Express
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later." } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const storeKey = `global`;
    if (!rateLimitStores[storeKey]) {
      rateLimitStores[storeKey] = {};
    }

    const store = rateLimitStores[storeKey];
    const key = getClientKey(req);
    const now = Date.now();

    // Initialize or get existing record
    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    // Reset if window expired
    if (now > store[key].resetTime) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    // Check limit
    if (store[key].count >= maxRequests) {
      res.status(429).json({ error: message });
      return;
    }

    // Increment counter
    store[key].count++;

    // Set headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - store[key].count));
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    next();
  };
}

/**
 * Per-endpoint rate limiter
 */
export function createEndpointRateLimiter(
  endpoint: string,
  config: RateLimitConfig
) {
  const { windowMs, maxRequests } = config;
  const storeKey = `endpoint:${endpoint}`;

  if (!rateLimitStores[storeKey]) {
    rateLimitStores[storeKey] = {};
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const store = rateLimitStores[storeKey];
    const key = getClientKey(req);
    const now = Date.now();

    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    if (now > store[key].resetTime) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    if (store[key].count >= maxRequests) {
      res.status(429).json({
        error: `Too many requests to ${endpoint}. Please try again later.`,
      });
      return;
    }

    store[key].count++;

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - store[key].count));
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    next();
  };
}

/**
 * Per-user rate limiter (requires authentication)
 */
export function createUserRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;
  const storeKey = `user`;

  if (!rateLimitStores[storeKey]) {
    rateLimitStores[storeKey] = {};
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      // Not authenticated, skip user-based rate limiting
      next();
      return;
    }

    const store = rateLimitStores[storeKey];
    const key = `user:${userId}`;
    const now = Date.now();

    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    if (now > store[key].resetTime) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    if (store[key].count >= maxRequests) {
      res.status(429).json({
        error: "You have exceeded the rate limit. Please try again later.",
      });
      return;
    }

    store[key].count++;

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - store[key].count));
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    next();
  };
}

/**
 * Get client identifier from request
 */
function getClientKey(req: Request): string {
  // Try to use user ID if authenticated
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  STRICT: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },

  // Standard: 30 requests per minute
  STANDARD: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },

  // Relaxed: 100 requests per minute
  RELAXED: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // Per-hour: 1000 requests per hour
  PER_HOUR: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1000,
  },

  // Authentication: 5 attempts per 15 minutes
  AUTH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },

  // API: 100 requests per minute
  API: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // File upload: 10 uploads per hour
  UPLOAD: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },
};

/**
 * Endpoint-specific rate limit configurations
 */
export const EndpointRateLimits = {
  // Authentication endpoints
  "/api/auth/login": RateLimitPresets.AUTH,
  "/api/auth/logout": RateLimitPresets.STANDARD,
  "/api/auth/register": RateLimitPresets.AUTH,

  // Project endpoints
  "/api/trpc/projects.create": RateLimitPresets.STANDARD,
  "/api/trpc/projects.update": RateLimitPresets.STANDARD,
  "/api/trpc/projects.delete": RateLimitPresets.STANDARD,
  "/api/trpc/projects.list": RateLimitPresets.RELAXED,
  "/api/trpc/projects.getById": RateLimitPresets.RELAXED,

  // Application endpoints
  "/api/trpc/applications.submit": RateLimitPresets.STANDARD,
  "/api/trpc/applications.updateStatus": RateLimitPresets.STANDARD,

  // Investment endpoints
  "/api/trpc/investments.recordInterest": RateLimitPresets.STANDARD,
  "/api/trpc/investments.updateStatus": RateLimitPresets.STANDARD,

  // Matching endpoints
  "/api/trpc/matching.getRecommendations": RateLimitPresets.RELAXED,
  "/api/trpc/matching.calculateScore": RateLimitPresets.RELAXED,

  // Analytics endpoints
  "/api/trpc/analytics.trackView": RateLimitPresets.RELAXED,
  "/api/trpc/analytics.getProjectAnalytics": RateLimitPresets.RELAXED,
};

/**
 * Clean up expired rate limit records periodically
 */
export function startRateLimitCleanup(intervalMs: number = 60 * 1000) {
  setInterval(() => {
    const now = Date.now();

    Object.keys(rateLimitStores).forEach((storeKey) => {
      const store = rateLimitStores[storeKey];

      Object.keys(store).forEach((key) => {
        if (now > store[key].resetTime) {
          delete store[key];
        }
      });
    });
  }, intervalMs);
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const stats: Record<string, any> = {};

  Object.keys(rateLimitStores).forEach((storeKey) => {
    const store = rateLimitStores[storeKey];
    stats[storeKey] = {
      activeKeys: Object.keys(store).length,
      requests: Object.values(store).reduce((sum, record) => sum + record.count, 0),
    };
  });

  return stats;
}

/**
 * Reset rate limits (for testing)
 */
export function resetRateLimits() {
  Object.keys(rateLimitStores).forEach((key) => {
    rateLimitStores[key] = {};
  });
}
