import { prisma } from '@shared/database/prisma';
import { SystemMetric, HealthCheck } from '@prisma/client';
import { logger } from '@shared/logger';
import { Client } from 'pg';
import Redis from 'ioredis';

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface MetricData {
  service: string;
  metricType: string;
  value: number;
  unit: string;
  metadata?: Record<string, unknown>;
}

export class HealthMonitorService {
  private static instance: HealthMonitorService;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): HealthMonitorService {
    if (!HealthMonitorService.instance) {
      HealthMonitorService.instance = new HealthMonitorService();
    }
    return HealthMonitorService.instance;
  }

  startMonitoring(intervalMs: number = 30000): void {
    logger.info('Starting health monitoring', { intervalMs });

    // Start health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks().catch((error) => {
        logger.error('Health check failed', error);
      });
    }, intervalMs);

    // Start metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics().catch((error) => {
        logger.error('Metrics collection failed', error);
      });
    }, intervalMs);

    // Perform initial checks
    this.performHealthChecks();
    this.collectMetrics();
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private async performHealthChecks(): Promise<void> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkVectorDB(),
      this.checkExternalAPI(),
    ]);

    const results = checks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const services = ['database', 'redis', 'vector_db', 'external_api'];
        return {
          service: services[index],
          status: 'unhealthy' as const,
          responseTime: 0,
          message: 'Health check failed',
          details: { error: result.reason?.message || 'Unknown error' },
        };
      }
    });

    // Store health check results
    await Promise.all(
      results.map((result) =>
        this.storeHealthCheck(result).catch((error) => {
          logger.error('Failed to store health check', {
            service: result.service,
            error,
          });
        })
      )
    );
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      const redis = new Redis(redisUrl);
      await redis.ping();
      const responseTime = Date.now() - start;
      redis.disconnect();

      return {
        service: 'redis',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        message: 'Redis connection successful',
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'Redis connection failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async checkVectorDB(): Promise<ServiceHealth> {
    const start = Date.now();
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      await pgClient.connect();
      await pgClient.query(
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'embeddings'"
      );
      const responseTime = Date.now() - start;
      await pgClient.end();

      return {
        service: 'vector_db',
        status: responseTime < 500 ? 'healthy' : 'degraded',
        responseTime,
        message: 'Vector DB accessible',
      };
    } catch (error) {
      return {
        service: 'vector_db',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'Vector DB check failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async checkExternalAPI(): Promise<ServiceHealth> {
    const start = Date.now();
    const openaiUrl = 'https://api.openai.com/v1/models';

    try {
      const response = await fetch(openaiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      const responseTime = Date.now() - start;

      return {
        service: 'external_api',
        status: response.ok && responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        message: 'External API accessible',
        details: { statusCode: response.status },
      };
    } catch (error) {
      return {
        service: 'external_api',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'External API check failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async collectMetrics(): Promise<void> {
    const metrics: MetricData[] = [
      {
        service: 'api',
        metricType: 'memory',
        value: process.memoryUsage().heapUsed / 1024 / 1024,
        unit: 'mb',
      },
      {
        service: 'api',
        metricType: 'cpu',
        value: process.cpuUsage().user / 1000000,
        unit: 'percent',
      },
    ];

    await Promise.all(
      metrics.map((metric) =>
        this.storeMetric(metric).catch((error) => {
          logger.error('Failed to store metric', { metric, error });
        })
      )
    );
  }

  private async storeHealthCheck(health: ServiceHealth): Promise<HealthCheck> {
    return prisma.healthCheck.create({
      data: {
        service: health.service,
        status: health.status,
        responseTime: health.responseTime,
        message: health.message,
        details: health.details,
      },
    });
  }

  private async storeMetric(metric: MetricData): Promise<SystemMetric> {
    return prisma.systemMetric.create({
      data: {
        service: metric.service,
        metricType: metric.metricType,
        value: metric.value,
        unit: metric.unit,
        metadata: metric.metadata,
      },
    });
  }

  async getLatestHealthStatus(): Promise<Record<string, ServiceHealth>> {
    const services = ['api', 'database', 'redis', 'vector_db', 'external_api'];
    const status: Record<string, ServiceHealth> = {};

    await Promise.all(
      services.map(async (service) => {
        const latest = await prisma.healthCheck.findFirst({
          where: { service },
          orderBy: { timestamp: 'desc' },
        });

        if (latest) {
          status[service] = {
            service,
            status: latest.status as 'healthy' | 'degraded' | 'unhealthy',
            responseTime: latest.responseTime,
            message: latest.message || undefined,
            details: latest.details || undefined,
          };
        } else {
          status[service] = {
            service,
            status: 'unhealthy',
            responseTime: 0,
            message: 'No health check data available',
          };
        }
      })
    );

    // Add API service status (always healthy if we can respond)
    status.api = {
      service: 'api',
      status: 'healthy',
      responseTime: 0,
      message: 'API is responding',
    };

    return status;
  }

  async getMetrics(
    service?: string,
    metricType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<SystemMetric[]> {
    const where: {
      service?: string;
      metricType?: string;
      timestamp?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (service) where.service = service;
    if (metricType) where.metricType = metricType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return prisma.systemMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000, // Limit to prevent excessive data
    });
  }

  async cleanupOldData(daysToKeep: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await Promise.all([
      prisma.systemMetric.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
      prisma.healthCheck.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
    ]);
  }
}

export const healthMonitorService = HealthMonitorService.getInstance();
