import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ai-chat-api:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Development mock - admin login
    if (
      process.env.NODE_ENV === 'development' &&
      email === 'admin@example.com' &&
      password === 'admin123'
    ) {
      // Set development admin cookie
      res.setHeader('Set-Cookie', [
        'dev-admin=true; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax',
        'auth-token=dev-admin-token; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax',
      ]);

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-1',
          name: '管理者',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Login failed',
      });
    }

    // Forward the Set-Cookie header from the backend API if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: data.message,
      user: data.user,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
