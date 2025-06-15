import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { prisma } from '../lib/prisma';
import { PlanType } from '@prisma/client';
import {
  createCheckoutSession,
  createTokenCheckoutSession,
  cancelSubscription,
  stripe,
  PRICING_PLANS,
} from '../lib/stripe';
import Stripe from 'stripe';

const router = Router();

// Get current billing information
router.get(
  '/',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId! },
        include: {
          usage: {
            where: {
              date: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ), // Current month
              },
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get current usage for the month
      const currentUsage = company.usage.reduce(
        (
          acc: { messages: number; tokens: number },
          usage: { messages: number; tokens: number }
        ) => ({
          messages: acc.messages + usage.messages,
          tokens: acc.tokens + usage.tokens,
        }),
        { messages: 0, tokens: 0 }
      );

      // Get plan limits
      const planLimits = PRICING_PLANS[company.plan];

      res.json({
        plan: company.plan,
        planLimits,
        currentUsage,
        stripeCustomerId: company.stripeCustomerId || null,
        subscriptionStatus: company.subscriptionStatus || 'inactive',
      });
    } catch (error) {
      console.error('Get billing info error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create checkout session for subscription
router.post(
  '/checkout/subscription',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { planType } = req.body;

      if (!['pro', 'enterprise'].includes(planType)) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      const successUrl = `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/billing/cancel`;

      const session = await createCheckoutSession(
        req.companyId!,
        planType,
        successUrl,
        cancelUrl
      );

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create checkout session for additional tokens
router.post(
  '/checkout/tokens',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { tokenAmount } = req.body;

      if (!tokenAmount || tokenAmount < 10000) {
        return res
          .status(400)
          .json({ error: 'Minimum token purchase is 10,000' });
      }

      const successUrl = `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/billing/cancel`;

      const session = await createTokenCheckoutSession(
        req.companyId!,
        tokenAmount,
        successUrl,
        cancelUrl
      );

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Create token checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Cancel subscription
router.post(
  '/cancel',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId! },
      });

      if (!company?.subscriptionId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      await cancelSubscription(company.subscriptionId);

      // Update company record
      await prisma.company.update({
        where: { id: req.companyId! },
        data: {
          subscriptionStatus: 'canceled',
          plan: 'free',
        },
      });

      res.json({ message: 'Subscription canceled successfully' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
);

// Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook event handlers
/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  try {
    if (!session.metadata || !session.metadata.companyId) {
      console.error('Missing companyId in session metadata');
      return;
    }

    const { companyId, planType, tokenAmount, type } = session.metadata;

    if (type === 'subscription' && planType) {
      // Handle subscription
      await prisma.company.update({
        where: { id: companyId },
        data: {
          plan: planType as PlanType,
          stripeCustomerId: session.customer as string,
          subscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
        },
      });

      console.log(
        `Subscription activated for company ${companyId}: ${planType}`
      );
    } else if (type === 'tokens' && tokenAmount) {
      // Handle token purchase
      const tokens = parseInt(tokenAmount);
      await prisma.company.update({
        where: { id: companyId },
        data: {
          tokenBalance: {
            increment: tokens,
          },
        },
      });

      console.log(`Added ${tokens} tokens to company ${companyId}`);
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdated(subscription: {
  id: string;
  status: string;
}) {
  const company = await prisma.company.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: subscription.status,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: { id: string }) {
  const company = await prisma.company.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan: 'free',
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      },
    });
  }
}

async function handlePaymentSucceeded(invoice: { id: string }) {
  // Log successful payment
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: { id: string }) {
  // Handle failed payment - could send notification email
  console.log(`Payment failed for invoice: ${invoice.id}`);
}

export { router as billingRoutes };
