import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    monthlyMessages: 100,
    monthlyTokens: 10000,
    features: ['Basic chat widget', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    monthlyMessages: 1000,
    monthlyTokens: 100000,
    features: [
      'Advanced chat widget',
      'Custom branding',
      'Analytics',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    monthlyMessages: 10000,
    monthlyTokens: 1000000,
    features: [
      'Unlimited messages',
      'White-label solution',
      'API access',
      'Dedicated support',
    ],
  },
};

// Additional token pricing
export const TOKEN_PRICING = {
  pricePerThousandTokens: 0.01, // $0.01 per 1000 tokens
  minimumPurchase: 10000, // Minimum 10k tokens
};

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  companyId: string,
  planType: 'pro' | 'enterprise',
  successUrl: string,
  cancelUrl: string
) {
  const plan = PRICING_PLANS[planType];

  if (!plan.priceId) {
    throw new Error(`Price ID not configured for ${planType} plan`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      companyId,
      planType,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a checkout session for additional tokens
 */
export async function createTokenCheckoutSession(
  companyId: string,
  tokenAmount: number,
  successUrl: string,
  cancelUrl: string
) {
  if (tokenAmount < TOKEN_PRICING.minimumPurchase) {
    throw new Error(
      `Minimum token purchase is ${TOKEN_PRICING.minimumPurchase}`
    );
  }

  const priceInCents = Math.round(
    (tokenAmount / 1000) * TOKEN_PRICING.pricePerThousandTokens * 100
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tokenAmount.toLocaleString()} AI Tokens`,
            description: 'Additional tokens for AI chat responses',
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      companyId,
      tokenAmount: tokenAmount.toString(),
      type: 'token_purchase',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Get customer's current subscription
 */
export async function getCustomerSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
}
