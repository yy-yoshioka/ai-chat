import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { logSecurityEvent } from '../services/securityService';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  remaining: number;
  limit: number;
}

class ChatRateLimiter {
  private redis: Redis | null = null;
  private memoryStore: Map<string, { count: number; resetTime: number }> =
    new Map();

  // Default rate limit configurations
  private readonly ipLimitConfig: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'chat_rl_ip:',
    message: 'Too many requests from this IP address',
  };

  private readonly orgLimitConfig: RateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    keyPrefix: 'chat_rl_org:',
    message: 'Organization rate limit exceeded',
  };

  constructor() {
    // Initialize Redis connection if available
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
        });

        this.redis.on('connect', () => {
          console.log('✅ Chat rate limiter connected to Redis');
        });

        this.redis.on('error', (error) => {
          console.error('❌ Chat rate limiter Redis error:', error);
          // Don't set redis to null here, let it retry
        });
      } catch (error) {
        console.error(
          '❌ Failed to initialize Redis for chat rate limiter:',
          error
        );
        this.redis = null;
      }
    }

    // Clean up memory store periodically
    setInterval(() => this.cleanupMemoryStore(), 60 * 1000); // Every minute
  }

  /**
   * Middleware for IP-based rate limiting
   */
  ipRateLimit() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIp(req);
      const key = `${this.ipLimitConfig.keyPrefix}${ip}`;

      try {
        const limitInfo = await this.checkRateLimit(key, this.ipLimitConfig);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limitInfo.limit.toString());
        res.setHeader('X-RateLimit-Remaining', limitInfo.remaining.toString());
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(limitInfo.resetTime).toISOString()
        );

        if (limitInfo.remaining < 0) {
          // Log security event for rate limit violation
          await logSecurityEvent({
            userId: req.user?.id,
            organizationId: req.organizationId,
            action: 'chat_rate_limit_exceeded',
            resource: req.path,
            success: false,
            ipAddress: ip,
            userAgent: req.get('User-Agent'),
            details: {
              type: 'ip',
              limit: limitInfo.limit,
              count: limitInfo.count,
            },
            risk_level: 'medium',
          });

          res.setHeader(
            'Retry-After',
            Math.ceil((limitInfo.resetTime - Date.now()) / 1000).toString()
          );
          return res.status(429).json({
            error: this.ipLimitConfig.message,
            retryAfter: Math.ceil((limitInfo.resetTime - Date.now()) / 1000),
          });
        }

        next();
      } catch (error) {
        console.error('Error in IP rate limiting:', error);
        // Don't block on error, let the request through
        next();
      }
    };
  }

  /**
   * Middleware for organization-based rate limiting
   */
  organizationRateLimit() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.organizationId) {
        return next();
      }

      const key = `${this.orgLimitConfig.keyPrefix}${req.organizationId}`;

      try {
        const limitInfo = await this.checkRateLimit(key, this.orgLimitConfig);

        // Set organization rate limit headers
        res.setHeader('X-RateLimit-Org-Limit', limitInfo.limit.toString());
        res.setHeader(
          'X-RateLimit-Org-Remaining',
          limitInfo.remaining.toString()
        );
        res.setHeader(
          'X-RateLimit-Org-Reset',
          new Date(limitInfo.resetTime).toISOString()
        );

        if (limitInfo.remaining < 0) {
          // Log security event for rate limit violation
          await logSecurityEvent({
            userId: req.user?.id,
            organizationId: req.organizationId,
            action: 'chat_rate_limit_exceeded',
            resource: req.path,
            success: false,
            ipAddress: this.getClientIp(req),
            userAgent: req.get('User-Agent'),
            details: {
              type: 'organization',
              limit: limitInfo.limit,
              count: limitInfo.count,
            },
            risk_level: 'high',
          });

          res.setHeader(
            'Retry-After',
            Math.ceil((limitInfo.resetTime - Date.now()) / 1000).toString()
          );
          return res.status(429).json({
            error: this.orgLimitConfig.message,
            retryAfter: Math.ceil((limitInfo.resetTime - Date.now()) / 1000),
          });
        }

        next();
      } catch (error) {
        console.error('Error in organization rate limiting:', error);
        // Don't block on error, let the request through
        next();
      }
    };
  }

  /**
   * Combined middleware that applies both IP and organization rate limits
   */
  combined() {
    const ipLimit = this.ipRateLimit();
    const orgLimit = this.organizationRateLimit();

    return async (req: Request, res: Response, next: NextFunction) => {
      // First check IP limit
      ipLimit(req, res, (err?: unknown) => {
        if (err || res.headersSent) {
          return;
        }
        // Then check organization limit
        orgLimit(req, res, next);
      });
    };
  }

  /**
   * Check rate limit using Redis or memory store
   */
  private async checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const resetTime = now + config.windowMs;

    if (this.redis) {
      try {
        return await this.checkRedisRateLimit(
          key,
          config,
          now,
          windowStart,
          resetTime
        );
      } catch (error) {
        console.error(
          'Redis rate limit check failed, falling back to memory:',
          error
        );
        // Fall back to memory store
      }
    }

    return this.checkMemoryRateLimit(key, config, now, resetTime);
  }

  /**
   * Check rate limit using Redis with sliding window
   */
  private async checkRedisRateLimit(
    key: string,
    config: RateLimitConfig,
    now: number,
    windowStart: number,
    resetTime: number
  ): Promise<RateLimitInfo> {
    const multi = this.redis!.multi();

    // Remove old entries outside the window
    multi.zremrangebyscore(key, '-inf', windowStart);

    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);

    // Count requests in window
    multi.zcard(key);

    // Set expiry
    multi.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    if (!results) {
      throw new Error('Redis transaction failed');
    }

    const count = (results[2][1] as number) || 0;
    const remaining = config.maxRequests - count;

    return {
      count,
      resetTime,
      remaining,
      limit: config.maxRequests,
    };
  }

  /**
   * Check rate limit using in-memory store
   */
  private checkMemoryRateLimit(
    key: string,
    config: RateLimitConfig,
    now: number,
    resetTime: number
  ): RateLimitInfo {
    const entry = this.memoryStore.get(key);

    if (!entry || entry.resetTime <= now) {
      // New window or expired entry
      this.memoryStore.set(key, { count: 1, resetTime });
      return {
        count: 1,
        resetTime,
        remaining: config.maxRequests - 1,
        limit: config.maxRequests,
      };
    }

    // Increment count
    entry.count++;
    const remaining = config.maxRequests - entry.count;

    return {
      count: entry.count,
      resetTime: entry.resetTime,
      remaining,
      limit: config.maxRequests,
    };
  }

  /**
   * Extract client IP address from request
   */
  private getClientIp(req: Request): string {
    // Check various headers for the real IP
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips =
        typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
      return ips[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return typeof realIp === 'string' ? realIp : realIp[0];
    }

    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  /**
   * Clean up expired entries from memory store
   */
  private cleanupMemoryStore(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.resetTime <= now) {
        this.memoryStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitInfo | null> {
    try {
      const now = Date.now();
      const windowStart = now - config.windowMs;

      if (this.redis) {
        const count = await this.redis.zcount(key, windowStart, '+inf');
        const remaining = config.maxRequests - count;

        return {
          count,
          resetTime: now + config.windowMs,
          remaining,
          limit: config.maxRequests,
        };
      } else {
        const entry = this.memoryStore.get(key);
        if (!entry || entry.resetTime <= now) {
          return null;
        }

        return {
          count: entry.count,
          resetTime: entry.resetTime,
          remaining: config.maxRequests - entry.count,
          limit: config.maxRequests,
        };
      }
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return null;
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }
}

// Export singleton instance
export const chatRateLimiter = new ChatRateLimiter();

// Export middleware functions
export const ipRateLimit = () => chatRateLimiter.ipRateLimit();
export const organizationRateLimit = () =>
  chatRateLimiter.organizationRateLimit();
export const combinedRateLimit = () => chatRateLimiter.combined();
