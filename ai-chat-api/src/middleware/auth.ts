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
    let token: string | undefined;

    // Try to get token from Authorization header first (for API calls)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // If no token in header, try cookies (for direct browser calls)
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token and attach user to request
    const user = verifyToken(token);
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};
