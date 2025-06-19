import { NextApiRequest, NextApiResponse } from 'next';
import { CheckoutSessionRequest } from '@/types/billing';

// Stripe設定（環境変数から取得）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// 課金プラン設定
const BILLING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 2980,
    currency: 'jpy',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: ['月間1,000メッセージ', 'ベーシックサポート', 'ウィジェット設置'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 9800,
    currency: 'jpy',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      '月間10,000メッセージ',
      'プライオリティサポート',
      'カスタムブランディング',
      'API アクセス',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29800,
    currency: 'jpy',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: ['無制限メッセージ', '専任サポート', 'オンプレミス対応', 'SLA保証'],
  },
};

// Mock Stripe implementation (実際の実装ではstripeライブラリを使用)
async function createCheckoutSession(
  priceId: string,
  customerId: string | undefined,
  successUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cancelUrl: string
): Promise<{ id: string; url: string }> {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    return {
      id: `cs_mock_${Date.now()}`,
      url: `${successUrl}?session_id=cs_mock_${Date.now()}`,
    };
  }

  // 実際の実装では以下のようになります:
  /*
  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    customer: customerId,
    subscription_data: {
      trial_period_days: 14,
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'pause'
        }
      }
    },
    payment_method_collection: 'always', // カード必須
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    locale: 'ja'
  });

  return { id: session.id, url: session.url };
  */

  throw new Error('Stripe not configured for production');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, successUrl, cancelUrl, customerId }: CheckoutSessionRequest = req.body;

    // バリデーション
    if (!planId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required fields: planId, successUrl, cancelUrl',
      });
    }

    // プラン存在確認
    const plan = BILLING_PLANS[planId as keyof typeof BILLING_PLANS];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // チェックアウトセッション作成
    const session = await createCheckoutSession(
      plan.stripePriceId,
      customerId,
      successUrl,
      cancelUrl
    );

    // セッション情報をログに記録
    console.log(`Checkout session created: ${session.id} for plan: ${planId}`);

    return res.status(200).json({
      sessionId: session.id,
      checkoutUrl: session.url,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
      },
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
