import { Request, Response, NextFunction } from 'express';

export const orgAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(403).json({ message: 'Organization access required' });
  }
  return next();
};