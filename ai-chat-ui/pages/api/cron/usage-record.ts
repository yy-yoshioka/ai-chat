import { NextApiRequest, NextApiResponse } from 'next';

// Cron authorization check
function verifyCronToken(token: string): boolean {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    return token === 'dev-cron-token';
  }

  // 実際の実装では専用のCronトークンを検証
  return token === process.env.CRON_SECRET_TOKEN;
}

// 使用量データ集計
async function aggregateUsageData(): Promise<
  Array<{
    subscriptionItemId: string;
    customerId: string;
    quantity: number;
    timestamp: number;
  }>
> {
  // モック実装
  const mockUsageData = [
    {
      subscriptionItemId: 'si_mock_starter_1',
      customerId: 'cus_mock_customer_1',
      quantity: 45,
      timestamp: Math.floor(Date.now() / 1000),
    },
    {
      subscriptionItemId: 'si_mock_pro_2',
      customerId: 'cus_mock_customer_2',
      quantity: 123,
      timestamp: Math.floor(Date.now() / 1000),
    },
    {
      subscriptionItemId: 'si_mock_enterprise_3',
      customerId: 'cus_mock_customer_3',
      quantity: 287,
      timestamp: Math.floor(Date.now() / 1000),
    },
  ];

  return mockUsageData;
}

// Stripe使用量記録送信
async function sendUsageRecordToStripe(
  subscriptionItemId: string,
  quantity: number,
  timestamp: number
): Promise<{ success: boolean; usageRecordId?: string; error?: string }> {
  try {
    // モック実装
    console.log(`Sending usage record to Stripe:`);
    console.log(`- Subscription Item ID: ${subscriptionItemId}`);
    console.log(`- Quantity: ${quantity}`);
    console.log(`- Timestamp: ${timestamp}`);

    // モック処理の遅延
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      usageRecordId: `ur_mock_${Date.now()}`,
    };
  } catch (error) {
    console.error(`Failed to send usage record for ${subscriptionItemId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// メイン処理
async function processUsageRecords(): Promise<{
  success: boolean;
  processed: number;
  errors: number;
}> {
  let processed = 0;
  let errors = 0;

  try {
    // 使用量データ集計
    const usageData = await aggregateUsageData();

    console.log(`Found ${usageData.length} subscription items with usage to report`);

    // 各サブスクリプションアイテムの使用量を送信
    for (const usage of usageData) {
      try {
        const result = await sendUsageRecordToStripe(
          usage.subscriptionItemId,
          usage.quantity,
          usage.timestamp
        );

        if (result.success) {
          processed++;
          console.log(`✅ Successfully processed usage for ${usage.subscriptionItemId}`);
        } else {
          errors++;
          console.error(
            `❌ Failed to process usage for ${usage.subscriptionItemId}: ${result.error}`
          );
        }
      } catch (error) {
        errors++;
        console.error(`❌ Exception processing usage for ${usage.subscriptionItemId}:`, error);
      }
    }

    console.log(`Usage record processing complete: ${processed} successful, ${errors} errors`);

    return {
      success: true,
      processed,
      errors,
    };
  } catch (error) {
    console.error('Failed to process usage records:', error);
    return {
      success: false,
      processed,
      errors: errors + 1,
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
      // 使用量記録処理
      console.log('🔄 Starting usage record processing...');

      const result = await processUsageRecords();
      const processingTime = Date.now() - startTime;

      const response = {
        ...result,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      };

      console.log(`✅ Usage record processing completed in ${processingTime}ms`);

      return res.status(200).json(response);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('Cron job failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Cron job execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    });
  }
}
