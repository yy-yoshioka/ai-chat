import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}

// Authentication middleware
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token and attach user to request
    const user = verifyToken(token);
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
};
