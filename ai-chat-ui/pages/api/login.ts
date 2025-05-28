import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// Mock user database (in a real app, you would query your database)
const USERS = [
  {
    id: '1',
    email: 'user@example.com',
    // In a real app, this would be a hashed password
    password: 'password123',
    name: 'Test User',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user in mock database
    const user = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create token payload (without sensitive information)
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set HTTP cookie
    const cookie = serialize('token', token, {
      httpOnly: true, // Cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      sameSite: 'strict', // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/', // Cookie is available on all paths
    });

    // Set the cookie in the response
    res.setHeader('Set-Cookie', cookie);

    // Return success without exposing the token in the response body
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
