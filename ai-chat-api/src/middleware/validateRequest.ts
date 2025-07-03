import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

interface ValidationOptions {
  body?: z.ZodSchema<unknown>;
  query?: z.ZodSchema<unknown>;
  params?: z.ZodSchema<unknown>;
}

export function validateRequest(schemas: ValidationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        req.query = parsedQuery as any;
      }

      // Validate URL parameters
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        req.params = parsedParams as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          errors,
        });
      }

      console.error('Validation error:', error);
      res.status(500).json({ error: 'Internal validation error' });
    }
  };
}
