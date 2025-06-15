import jwt from 'jsonwebtoken';
import { Response } from 'express';

// User interface (simplified)
export interface UserPayload {
  id: string;
  email: string;
  isAdmin?: boolean;
}

// Sign JWT token and store in HTTP-Only Cookie
export const signToken = (user: UserPayload, res: Response): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HTTP-Only cookie
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  return token;
};

// Verify JWT token
export const verifyToken = (token: string): UserPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
