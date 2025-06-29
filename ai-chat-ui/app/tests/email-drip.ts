import { NextApiRequest, NextApiResponse } from 'next';

// Test endpoint for email drip functionality
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulate calling the email drip cron job
    const cronResponse = await fetch(`${req.headers.host}/api/cron/email-drip`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer dev-cron-token',
        'Content-Type': 'application/json',
      },
    });

    if (cronResponse.ok) {
      const result = await cronResponse.json();
      return res.status(200).json({
        success: true,
        message: 'Email drip test completed successfully',
        cronResult: result,
      });
    } else {
      const errorText = await cronResponse.text();
      return res.status(500).json({
        success: false,
        error: 'Failed to call email drip cron job',
        details: errorText,
      });
    }
  } catch (error) {
    console.error('Email drip test failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Email drip test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
