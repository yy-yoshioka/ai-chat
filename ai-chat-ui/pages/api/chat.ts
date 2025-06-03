import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'メッセージが必要です',
        message: 'Message is required',
      });
    }

    // Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        error: 'ログインが必要です',
        message: 'Authentication required',
      });
    }

    // Forward request to backend API
    const response = await fetch('http://ai-chat-api:3001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend API error:', data);
      return res.status(response.status).json(data);
    }

    // Forward successful response
    res.status(200).json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: '内部サーバーエラーが発生しました',
      message: 'Internal server error',
    });
  }
}
