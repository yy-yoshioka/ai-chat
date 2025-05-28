import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ai-chat-api:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the request to the backend API with cookies
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward the cookie header
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Authentication failed',
      });
    }

    // Return the user data
    return res.status(200).json({ user: data.user });
  } catch (error) {
    console.error('Me API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
