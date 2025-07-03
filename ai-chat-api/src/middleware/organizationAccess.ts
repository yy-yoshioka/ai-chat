import { Request, Response, NextFunction } from 'express';

export interface OrganizationRequest extends Request {
  organizationId: string;
}

export const orgAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(403).json({ message: 'Organization access required' });
  }
  req.organizationId = req.user.organizationId;
  return next();
};

export const requireOrganizationAccess = orgAccessMiddleware;
