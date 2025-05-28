import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

// User type definition
interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  // Add other JWT payload properties as needed
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the JWT from cookies
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify the JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Return user data
    const user: User = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      // Map other user properties from JWT payload
    };

    // Return the user data
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
