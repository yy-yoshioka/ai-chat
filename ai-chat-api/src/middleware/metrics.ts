import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { metricsCollector } from '../lib/sentry';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Add request context to Sentry
  Sentry.setTag('route', req.route?.path || req.path);
  Sentry.setTag('method', req.method);

  // Capture response time when request finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    // Record response time
    metricsCollector.recordResponseTime(responseTime);

    // Record error if status code indicates error
    if (res.statusCode >= 400) {
      metricsCollector.recordError();

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
