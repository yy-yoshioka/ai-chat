import { NextApiRequest, NextApiResponse } from 'next';
import { TrialExtensionRequest } from '@/types/billing';

// JWT token verification (実際の実装ではjwtライブラリを使用)
function verifyAdminToken(token: string): { userId: string; isAdmin: boolean } | null {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development' && token === 'dev-admin-token') {
    return { userId: 'admin-1', isAdmin: true };
  }

  // 実際の実装では以下のようになります:
  /*
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      isAdmin: decoded.role === 'admin' || decoded.role === 'super_admin'
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
  */

  return null;
}

// Trial延長処理
async function extendTrialPeriod(
  userId: string,
  extensionDays: number,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; newTrialEnd: string; message: string }> {
  try {
    // 実際の実装では以下のような処理を行います:
    /*
    // ユーザーのサブスクリプション情報を取得
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'trial'
      }
    });

    if (!subscription) {
      throw new Error('Active trial subscription not found');
    }

    if (!subscription.trialEnd) {
      throw new Error('Trial end date not found');
    }

    // 新しいトライアル終了日を計算
    const currentTrialEnd = new Date(subscription.trialEnd);
    const newTrialEnd = new Date(currentTrialEnd.getTime() + extensionDays * 24 * 60 * 60 * 1000);

    // データベースを更新
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        trialEnd: newTrialEnd,
        updatedAt: new Date()
      }
    });

    // Trial延長ログを記録
    await prisma.trialExtensionLog.create({
      data: {
        userId: userId,
        subscriptionId: subscription.id,
        adminId: adminId,
        extensionDays: extensionDays,
        reason: reason || 'Admin extension',
        previousTrialEnd: currentTrialEnd,
        newTrialEnd: newTrialEnd,
        createdAt: new Date()
      }
    });

    // Stripeのサブスクリプションも更新
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      trial_end: Math.floor(newTrialEnd.getTime() / 1000)
    });

    // ユーザーに通知メール送信
    await sendTrialExtensionEmail(userId, {
      extensionDays,
      newTrialEnd: newTrialEnd.toISOString(),
      reason
    });

    return {
      success: true,
      newTrialEnd: newTrialEnd.toISOString(),
      message: `Trial extended by ${extensionDays} days`
    };
    */

    // モック実装
    const currentTrialEnd = new Date();
    currentTrialEnd.setDate(currentTrialEnd.getDate() + 7); // 現在から7日後と仮定

    const newTrialEnd = new Date(currentTrialEnd.getTime() + extensionDays * 24 * 60 * 60 * 1000);

    console.log(`Trial extended for user ${userId} by ${extensionDays} days by admin ${adminId}`);
    console.log(`New trial end: ${newTrialEnd.toISOString()}`);
    console.log(`Reason: ${reason || 'Admin extension'}`);

    return {
      success: true,
      newTrialEnd: newTrialEnd.toISOString(),
      message: `Trial extended by ${extensionDays} days`,
    };
  } catch (error) {
    console.error('Failed to extend trial:', error);
    throw error;
  }
}

// ユーザー検索（管理者機能）
async function searchUser(
  query: string
): Promise<Array<{ id: string; email: string; name: string }>> {
  // 実際の実装では以下のような処理を行います:
  /*
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true
    },
    take: 10
  });

  return users;
  */

  // モック実装
  const mockUsers = [
    { id: 'user-1', email: 'user1@example.com', name: '田中太郎' },
    { id: 'user-2', email: 'user2@example.com', name: '佐藤花子' },
    { id: 'user-3', email: 'user3@example.com', name: '山田一郎' },
  ];

  return mockUsers.filter(
    (user) => user.email.toLowerCase().includes(query.toLowerCase()) || user.name.includes(query)
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 認証チェック
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyAdminToken(token);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'POST') {
      // Trial延長処理
      const { userId, extensionDays, reason }: TrialExtensionRequest = req.body;

      // バリデーション
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      if (!extensionDays || extensionDays <= 0 || extensionDays > 30) {
        return res.status(400).json({
          error: 'extensionDays must be between 1 and 30',
        });
      }

      try {
        const result = await extendTrialPeriod(userId, extensionDays, user.userId, reason);

        return res.status(200).json(result);
      } catch (error) {
        console.error('Trial extension failed:', error);
        return res.status(500).json({
          error: 'Failed to extend trial period',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else if (req.method === 'GET') {
      // ユーザー検索
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query parameter "q" is required' });
      }

      try {
        const users = await searchUser(q);
        return res.status(200).json({ users });
      } catch (error) {
        console.error('User search failed:', error);
        return res.status(500).json({
          error: 'Failed to search users',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
