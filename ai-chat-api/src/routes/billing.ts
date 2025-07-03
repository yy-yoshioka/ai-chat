import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { requirePermission } from '../middleware/permissions';
import { validateRequest } from '../middleware/validateRequest';
import { Permission, PlanType } from '@prisma/client';
import { z } from 'zod';
import { billingService } from '../services/billingService';
import {
  createCheckoutSession,
  createTokenCheckoutSession,
  cancelSubscription,
  stripe,
} from '../lib/stripe';
import Stripe from 'stripe';

const router = Router();

// Input validation schemas
const startTrialSchema = z.object({
  planType: z.nativeEnum(PlanType).refine((val) => val !== 'free', {
    message: 'Cannot start trial for free plan',
  }),
});

const convertTrialSchema = z.object({
  paymentMethodId: z.string(),
});

const checkoutSchema = z.object({
  planType: z.enum(['pro', 'enterprise']),
});

const tokenPurchaseSchema = z.object({
  tokenAmount: z.number().min(10000),
});

// Get billing overview including trial status
router.get(
  '/',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_READ),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const overview = await billingService.getBillingOverview(req.companyId!);
      res.json(overview);
    } catch (error) {
      console.error('Get billing overview error:', error);
      res.status(500).json({
        error: 'Failed to fetch billing information',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Start a trial
router.post(
  '/trial/start',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_WRITE),
  validateRequest({ body: startTrialSchema }),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { planType } = req.body;
      const userId = req.user!.id;

      const company = await billingService.startTrial(
        req.companyId!,
        planType,
        userId
      );

      res.json({
        success: true,
        trial: {
          plan: company.plan,
          startedAt: company.trialStartedAt,
          endsAt: company.trialEndsAt,
        },
      });
    } catch (error) {
      console.error('Start trial error:', error);
      const status =
        error instanceof Error && error.message.includes('already') ? 409 : 500;
      res.status(status).json({
        error: error instanceof Error ? error.message : 'Failed to start trial',
      });
    }
  }
);

// Get trial status
router.get(
  '/trial/status',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_READ),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const status = await billingService.getTrialStatus(req.companyId!);

      if (!status) {
        res.json({
          hasTrialHistory: false,
        });
        return;
      }

      res.json(status);
    } catch (error) {
      console.error('Get trial status error:', error);
      res.status(500).json({
        error: 'Failed to fetch trial status',
      });
    }
  }
);

// Convert trial to subscription
router.post(
  '/trial/convert',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_WRITE),
  validateRequest({ body: convertTrialSchema }),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user!.id;

      const company = await billingService.convertTrialToSubscription(
        req.companyId!,
        paymentMethodId,
        userId
      );

      res.json({
        success: true,
        subscription: {
          id: company.subscriptionId,
          status: company.subscriptionStatus,
        },
      });
    } catch (error) {
      console.error('Convert trial error:', error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to convert trial',
      });
    }
  }
);

// Create checkout session for subscription
router.post(
  '/checkout/subscription',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_WRITE),
  validateRequest({ body: checkoutSchema }),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { planType } = req.body;

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
  requirePermission(Permission.BILLING_WRITE),
  validateRequest({ body: tokenPurchaseSchema }),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { tokenAmount } = req.body;

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
  requirePermission(Permission.BILLING_WRITE),
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

// Get invoices
router.get(
  '/invoices',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_READ),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId! },
      });

      if (!company?.stripeCustomerId) {
        return res.json({ invoices: [] });
      }

      const invoices = await stripe.invoices.list({
        customer: company.stripeCustomerId,
        limit: 10,
      });

      const formattedInvoices = invoices.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.total / 100,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
      }));

      res.json({ invoices: formattedInvoices });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  }
);

// Get payment methods
router.get(
  '/payment-methods',
  authMiddleware,
  requireOrganizationAccess,
  requirePermission(Permission.BILLING_READ),
  async (req: OrganizationRequest, res: Response) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId! },
      });

      if (!company?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: company.stripeCustomerId,
        type: 'card',
      });

      const formattedMethods = paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card!.brand,
        last4: method.card!.last4,
        expMonth: method.card!.exp_month,
        expYear: method.card!.exp_year,
        isDefault:
          method.id === company.stripeCustomerId ||
          method.metadata?.default === 'true',
      }));

      res.json({ paymentMethods: formattedMethods });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({ error: 'Failed to fetch payment methods' });
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

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    // Handle subscription events through billing service
    if (event.type.startsWith('customer.subscription.')) {
      await billingService.handleSubscriptionEvent(
        event,
        event.data.object as Stripe.Subscription
      );
    }

    // Handle other events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
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

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  console.log(`Payment succeeded for invoice: ${invoice.id}`);

  // Check if this is for token overage
  const overageItem = invoice.lines.data.find(
    (item) => item.metadata?.type === 'token_overage'
  );

  if (overageItem && invoice.customer) {
    const company = await prisma.company.findFirst({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (company && company.organizationId) {
      // Send notification
      await prisma.notification.create({
        data: {
          organizationId: company.organizationId,
          type: 'billing',
          title: 'Token Overage Charge',
          message: `You have been charged $${(invoice.total / 100).toFixed(
            2
          )} for token overage usage.`,
          data: {
            invoiceId: invoice.id,
            amount: invoice.total,
            tokens: overageItem.metadata?.tokens,
          },
        },
      });
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`);

  if (invoice.customer) {
    const company = await prisma.company.findFirst({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (company && company.organizationId) {
      // Send notification
      await prisma.notification.create({
        data: {
          organizationId: company.organizationId,
          type: 'alert',
          title: 'Payment Failed',
          message:
            'Your payment method was declined. Please update your payment information.',
          data: {
            invoiceId: invoice.id,
            amount: invoice.total,
          },
        },
      });
    }
  }
}

// Import prisma after to avoid circular dependency
import { prisma } from '../lib/prisma';

export { router as billingRoutes };
export default router;
