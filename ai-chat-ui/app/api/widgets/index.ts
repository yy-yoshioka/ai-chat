import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ai-chat-api:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;

  try {
    // Get cookies from the request and forward them
    const cookies = req.headers.cookie || '';

    const apiUrl = `${API_BASE_URL}/api/widgets${query.companyId ? `?companyId=${query.companyId}` : ''}`;

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      ...(method !== 'GET' && { body: JSON.stringify(body) }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Widgets API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
