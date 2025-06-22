import { NextApiRequest, NextApiResponse } from 'next';

// Import the email drip functionality (would normally import from jobs/email-drip.ts)
// For simplicity, we'll implement a simplified version here

// Cron authorization check
function verifyCronToken(token: string): boolean {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    return token === 'dev-cron-token';
  }

  // 実際の実装では専用のCronトークンを検証
  return token === process.env.CRON_SECRET_TOKEN;
}

// Simplified email drip processing
async function processEmailDrip(): Promise<{
  success: boolean;
  processed: number;
  errors: number;
  details: Array<{ email: string; day: number; status: string; error?: string }>;
}> {
  let processed = 0;
  let errors = 0;
  const details: Array<{ email: string; day: number; status: string; error?: string }> = [];

  try {
    // モック実装 - 実際の実装では jobs/email-drip.ts の processEmailDrip() を呼び出し
    console.log('📧 Processing trial user emails...');

    // シミュレート：4つのメール送信
    const mockEmailTasks = [
      { email: 'user1@example.com', day: 1, shouldSend: true },
      { email: 'user2@example.com', day: 3, shouldSend: true },
      { email: 'user3@example.com', day: 7, shouldSend: false }, // 今日は対象外
      { email: 'user4@example.com', day: 12, shouldSend: true },
    ];

    for (const task of mockEmailTasks) {
      try {
        if (task.shouldSend) {
          // メール送信シミュレート
          await new Promise((resolve) => setTimeout(resolve, 100));

          console.log(`📧 Sent Day-${task.day} email to ${task.email}`);
          processed++;
          details.push({
            email: task.email,
            day: task.day,
            status: 'sent',
          });
        } else {
          details.push({
            email: task.email,
            day: task.day,
            status: 'skipped',
          });
        }
      } catch (error) {
        errors++;
        details.push({
          email: task.email,
          day: task.day,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`📧 Email drip processing complete: ${processed} sent, ${errors} errors`);

    return {
      success: true,
      processed,
      errors,
      details,
    };
  } catch (error) {
    console.error('Failed to process email drip:', error);
    return {
      success: false,
      processed,
      errors: errors + 1,
      details,
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cron認証チェック
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  if (!verifyCronToken(token)) {
    return res.status(403).json({ error: 'Invalid cron token' });
  }

  const startTime = Date.now();

  try {
    if (req.method === 'POST') {
      console.log('📧 Starting daily email drip campaign...');

      const result = await processEmailDrip();
      const processingTime = Date.now() - startTime;

      const response = {
        ...result,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        jobType: 'email-drip',
      };

      console.log(`✅ Email drip cron job completed in ${processingTime}ms`);

      return res.status(200).json(response);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('Email drip cron job failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Email drip cron job execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
      jobType: 'email-drip',
    });
  }
}
