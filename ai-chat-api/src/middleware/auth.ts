import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: UserPayload & {
      roles?: string[];
      organizationId?: string;
    };
  }
}

// Authentication middleware
export const authMiddleware = async (
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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify token and attach user to request
    let user;
    try {
      user = verifyToken(token);
    } catch (error) {
      if (error instanceof Error && error.message === 'jwt expired') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user still exists
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, roles: true, organizationId: true },
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      ...user,
      roles: dbUser.roles,
      organizationId: dbUser.organizationId || undefined,
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
