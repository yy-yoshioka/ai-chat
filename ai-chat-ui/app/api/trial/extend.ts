import { NextApiRequest, NextApiResponse } from 'next';
import { OrgTrialExtensionRequest, TrialExtensionResponse } from '@/types/billing';

// JWT token verification for organization admin (実際の実装ではjwtライブラリを使用)
function verifyOrgAdminToken(
  token: string
): { userId: string; orgId: string; isOrgAdmin: boolean } | null {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development' && token === 'dev-org-admin-token') {
    return { userId: 'org-admin-1', orgId: 'org-1', isOrgAdmin: true };
  }

  // 実際の実装では以下のようになります:
  /*
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // ユーザーが指定された組織の管理者かチェック
    const userOrgRole = await getUserOrganizationRole(decoded.userId, orgId);
    
    return {
      userId: decoded.userId,
      orgId: userOrgRole.orgId,
      isOrgAdmin: userOrgRole.role === 'admin' || userOrgRole.role === 'owner'
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
  */

  return null;
}

// Organization Trial延長処理（7日固定）
async function extendOrganizationTrial(
  orgId: string,
  adminUserId: string
): Promise<TrialExtensionResponse> {
  try {
    // 実際の実装では以下のような処理を行います:
    /*
    // 組織のサブスクリプション情報を取得
    const orgSubscription = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true }
    });

    if (!orgSubscription) {
      throw new Error('Organization not found');
    }

    if (!orgSubscription.subscription || orgSubscription.subscription.status !== 'trial') {
      throw new Error('Organization is not in trial period');
    }

    const currentTrialEnd = new Date(orgSubscription.subscription.trialEnd);
    const now = new Date();

    // トライアルが既に終了している場合はエラー
    if (currentTrialEnd < now) {
      throw new Error('Trial period has already ended');
    }

    // 7日延長
    const newTrialEnd = new Date(currentTrialEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

    // データベースを更新
    await prisma.subscription.update({
      where: { id: orgSubscription.subscription.id },
      data: {
        trialEnd: newTrialEnd,
        updatedAt: new Date()
      }
    });

    // 延長ログを記録
    await prisma.trialExtensionLog.create({
      data: {
        organizationId: orgId,
        subscriptionId: orgSubscription.subscription.id,
        adminUserId: adminUserId,
        extensionDays: 7,
        reason: 'Organization admin trial extension',
        previousTrialEnd: currentTrialEnd,
        newTrialEnd: newTrialEnd,
        createdAt: new Date()
      }
    });

    // Stripeのサブスクリプションも更新
    if (orgSubscription.subscription.stripeSubscriptionId) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.update(orgSubscription.subscription.stripeSubscriptionId, {
        trial_end: Math.floor(newTrialEnd.getTime() / 1000)
      });
    }

    // 組織メンバーに通知メール送信
    await sendTrialExtensionNotificationEmail(orgId, {
      extensionDays: 7,
      newTrialEnd: newTrialEnd.toISOString(),
      extendedBy: adminUserId
    });

    return {
      success: true,
      newTrialEndAt: newTrialEnd.toISOString(),
      message: 'Trial extended by 7 days successfully'
    };
    */

    // モック実装
    const currentTrialEnd = new Date();
    currentTrialEnd.setDate(currentTrialEnd.getDate() + 7); // 現在から7日後と仮定

    const newTrialEnd = new Date(currentTrialEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log(`Trial extended for organization ${orgId} by admin ${adminUserId}`);
    console.log(`New trial end: ${newTrialEnd.toISOString()}`);

    return {
      success: true,
      newTrialEndAt: newTrialEnd.toISOString(),
      message: 'Trial extended by 7 days successfully',
    };
  } catch (error) {
    console.error('Failed to extend organization trial:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 認証チェック
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyOrgAdminToken(token);

    if (!user || !user.isOrgAdmin) {
      return res.status(403).json({ error: 'Organization admin access required' });
    }

    const { orgId }: OrgTrialExtensionRequest = req.body;

    // バリデーション
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    // 管理者が自分の組織のトライアルのみ延長できることを確認
    if (user.orgId !== orgId) {
      return res.status(403).json({
        error: 'You can only extend trial for your own organization',
      });
    }

    try {
      const result = await extendOrganizationTrial(orgId, user.userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Organization trial extension failed:', error);
      return res.status(500).json({
        error: 'Failed to extend organization trial period',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
