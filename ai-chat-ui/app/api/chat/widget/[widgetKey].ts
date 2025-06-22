import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ai-chat-api:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { widgetKey } = query;

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!widgetKey || typeof widgetKey !== 'string') {
    return res.status(400).json({ error: 'Widget key is required' });
  }

  if (!body?.message || typeof body.message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const apiUrl = `${API_BASE_URL}/api/chat/widget/${widgetKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: body.message }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Widget chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
