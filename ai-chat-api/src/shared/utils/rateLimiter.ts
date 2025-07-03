import Redis from 'ioredis';

interface RateLimitOptions {
  widgetId: string;
  limit: number;
  period: number; // in seconds
}

interface RateLimitResult {
  allowed: boolean;
  count: number;
  resetTime: number;
}

class RateLimiter {
  private redis: Redis | null = null;
  private memoryStore: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor() {
    // Only try to connect to Redis if URL is provided
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true, // Don't connect immediately
        });

        this.redis.on('connect', () => {
          console.log('✅ Connected to Redis for rate limiting');
        });

        this.redis.on('error', (error) => {
          console.warn(
            '⚠️ Redis connection error, falling back to memory store:',
            error.message
          );
          this.redis = null; // Fallback to memory store
        });
      } catch (error) {
        console.warn(
          '⚠️ Failed to initialize Redis, using in-memory store:',
          error
        );
        this.redis = null;
      }
    } else {
      console.log('ℹ️ No Redis URL provided, using in-memory rate limiter');
    }
  }

  async incrementAndCheck(options: RateLimitOptions): Promise<RateLimitResult> {
    const { widgetId, limit, period } = options;
    const key = `rate_limit:${widgetId}`;
    const now = Math.floor(Date.now() / 1000);
    const resetTime = now + period;

    if (this.redis) {
      return this.incrementRedis(key, limit, period, resetTime);
    } else {
      return this.incrementMemory(key, limit, period, resetTime);
    }
  }

  private async incrementRedis(
    key: string,
    limit: number,
    period: number,
    resetTime: number
  ): Promise<RateLimitResult> {
    const multi = this.redis!.multi();
    multi.incr(key);
    multi.expire(key, period);

    const results = await multi.exec();
    const count = (results?.[0]?.[1] as number) || 0;

    return {
      allowed: count <= limit,
      count,
      resetTime,
    };
  }

  private incrementMemory(
    key: string,
    limit: number,
    period: number,
    resetTime: number
  ): RateLimitResult {
    const now = Math.floor(Date.now() / 1000);
    const existing = this.memoryStore.get(key);

    // Clean up expired entries
    if (existing && existing.resetTime <= now) {
      this.memoryStore.delete(key);
    }

    const current = this.memoryStore.get(key) || { count: 0, resetTime };
    current.count += 1;

    if (!this.memoryStore.has(key)) {
      current.resetTime = resetTime;
    }

    this.memoryStore.set(key, current);

    return {
      allowed: current.count <= limit,
      count: current.count,
      resetTime: current.resetTime,
    };
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
export { RateLimitOptions, RateLimitResult };
