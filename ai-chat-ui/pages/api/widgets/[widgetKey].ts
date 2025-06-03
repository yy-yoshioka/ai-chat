import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ai-chat-api:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { widgetKey } = query;

  if (!widgetKey || typeof widgetKey !== 'string') {
    return res.status(400).json({ error: 'Widget key is required' });
  }

  try {
    // Get cookies from the request and forward them for authenticated requests
    const cookies = req.headers.cookie || '';

    const apiUrl = `${API_BASE_URL}/api/widgets/${widgetKey}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add cookies for authenticated requests (PUT, DELETE)
    if (method === 'PUT' || method === 'DELETE') {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(apiUrl, {
      method,
      headers,
      ...(method !== 'GET' && method !== 'DELETE' && { body: JSON.stringify(body) }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Widget API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
