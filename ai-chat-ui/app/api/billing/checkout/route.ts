import { NextRequest, NextResponse } from 'next/server';
import { BillingCheckoutRequest, BillingCheckoutResponse } from '@/app/_domains/billing';

// Stripe設定（環境変数から取得）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Mock Stripe implementation (実際の実装ではstripeライブラリを使用)
async function createStripeCheckoutSession(
  priceId: string,
  orgId: string
): Promise<{ sessionId: string; sessionUrl: string }> {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    console.log(`Creating checkout session for priceId: ${priceId}, orgId: ${orgId}`);

    const sessionId = `cs_mock_${Date.now()}`;
    const sessionUrl = `https://checkout.stripe.com/c/pay/cs_test_${sessionId}#fidkdWxOYHwnPyd1blpxYHZxWjA0VE5gckc3SmFBNzRqN3dhT2FsM3VQSDBFNU5sT2hMRXNiYkZsdz09fGBucHVrM3VvQmJyN3VqNG1hMkpQQ3VNMW9nVDFNMXFTYz0%3D`;

    return { sessionId, sessionUrl };
  }

  // 実際の実装では以下のようになります:
  /*
  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  
  // 組織の情報を取得（実際の実装では）
  const organization = await getOrganizationById(orgId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  // Stripeカスタマーを取得または作成
  let customerId = organization.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: organization.email,
      name: organization.name,
      metadata: {
        orgId: orgId
      }
    });
    customerId = customer.id;
    
    // 組織にStripeカスタマーIDを保存
    await updateOrganization(orgId, { stripeCustomerId: customerId });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
      },
      metadata: {
        orgId: orgId
      }
    },
    payment_method_collection: 'always',
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/onboarding/step-plan?canceled=true`,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    locale: 'ja',
    metadata: {
      orgId: orgId,
      priceId: priceId
    }
  });

  return { sessionId: session.id, sessionUrl: session.url };
  */

  throw new Error('Stripe not configured for production');
}

export async function POST(req: NextRequest) {
  try {
    const body: BillingCheckoutRequest = await req.json();
    const { priceId, orgId } = body;

    // バリデーション
    if (!priceId || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, orgId' },
        { status: 400 }
      );
    }

    // Stripe価格IDの基本バリデーション
    if (!priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid priceId format' }, { status: 400 });
    }

    // 組織IDの基本バリデーション
    if (typeof orgId !== 'string' || orgId.length < 1) {
      return NextResponse.json({ error: 'Invalid orgId' }, { status: 400 });
    }

    // チェックアウトセッション作成
    const { sessionId, sessionUrl } = await createStripeCheckoutSession(priceId, orgId);

    // セッション情報をログに記録
    console.log(`Checkout session created: ${sessionId} for org: ${orgId}, price: ${priceId}`);

    const response: BillingCheckoutResponse = {
      sessionId,
      sessionUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
