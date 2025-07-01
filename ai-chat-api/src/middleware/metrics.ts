import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { metricsCollector } from '../lib/sentry';
import { customMetrics, recordMetric } from '../lib/telemetry';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Add request context to Sentry
  Sentry.setTag('route', req.route?.path || req.path);
  Sentry.setTag('method', req.method);

  // Increment active connections
  recordMetric(customMetrics.activeConnections, 1);

  // Capture response time when request finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    // Record response time
    metricsCollector.recordResponseTime(responseTime);

    // Record response time in OpenTelemetry
    recordMetric(customMetrics.httpRequestDuration, responseTime, {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });

    // Decrement active connections
    recordMetric(customMetrics.activeConnections, -1);

    // Store metric in database for system health monitoring
    if (responseTime > 100) {
      // Only store significant response times
      prisma.systemMetric
        .create({
          data: {
            service: 'api',
            metricType: 'response_time',
            value: responseTime,
            unit: 'ms',
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
            },
          },
        })
        .catch((error) => {
          logger.error('Failed to store response time metric', error);
        });
    }

    // Record error if status code indicates error
    if (res.statusCode >= 400) {
      metricsCollector.recordError();

      // Record error in OpenTelemetry
      recordMetric(customMetrics.errors, 1, {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });

      // Capture error context in Sentry
      Sentry.setContext('response', {
        status: res.statusCode,
        responseTime,
        path: req.path,
        method: req.method,
      });
    }

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(
        `Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`
      );
      Sentry.addBreadcrumb({
        message: 'Slow request',
        level: 'warning',
        data: {
          method: req.method,
          path: req.path,
          responseTime,
          statusCode: res.statusCode,
        },
      });
    }
  });

  next();
}

export function errorTrackingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Capture exception in Sentry
  Sentry.captureException(error, {
    tags: {
      route: req.route?.path || req.path,
      method: req.method,
    },
    contexts: {
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
    },
  });

  // Record error metric
  metricsCollector.recordError();

  // Log error
  console.error('Unhandled error:', error);

  // Send error response
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  next(error);
}
