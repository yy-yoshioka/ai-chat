import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : undefined,
    stack: isDevelopment ? err.stack : undefined,
  });
}
