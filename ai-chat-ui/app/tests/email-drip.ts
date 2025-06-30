import { NextApiRequest, NextApiResponse } from 'next';
import { fetchPost, FetchError } from '../_utils/fetcher';

// Test endpoint for email drip functionality
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulate calling the email drip cron job
    const result = await fetchPost(`${req.headers.host}/api/cron/email-drip`, undefined, {
      headers: {
        Authorization: 'Bearer dev-cron-token',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Email drip test completed successfully',
      cronResult: result,
    });
  } catch (error) {
    console.error('Email drip test failed:', error);
    if (error instanceof FetchError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to call email drip cron job',
        details: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Email drip test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
