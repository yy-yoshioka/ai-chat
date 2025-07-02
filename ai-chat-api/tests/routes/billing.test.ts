import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import billingRouter from '../../src/routes/billing';
import { authMiddleware } from '../../src/middleware/auth';
import { 
  testUser, 
  testOrganization,
  generateTestToken
} from '../fixtures/test-data';
import Stripe from 'stripe';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('stripe');

describe('Billing Routes', () => {
  let app: express.Application;
  let mockStripe: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/billing', billingRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...testUser, organization: testOrganization };
      next();
    });

    // Setup Stripe mock
    mockStripe = {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test_new' }),
        retrieve: jest.fn().mockResolvedValue({ 
          id: 'cus_test_123',
          email: testUser.email,
          metadata: { organizationId: testOrganization.id }
        }),
        update: jest.fn().mockResolvedValue({ id: 'cus_test_123' }),
      },
      prices: {
        list: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'price_starter',
              product: 'prod_starter',
              unit_amount: 2900,
              currency: 'usd',
              recurring: { interval: 'month' },
              metadata: { plan: 'STARTER' },
            },
            {
              id: 'price_pro',
              product: 'prod_pro',
              unit_amount: 9900,
              currency: 'usd',
              recurring: { interval: 'month' },
              metadata: { plan: 'PRO' },
            },
            {
              id: 'price_enterprise',
              product: 'prod_enterprise',
              unit_amount: 29900,
              currency: 'usd',
              recurring: { interval: 'month' },
              metadata: { plan: 'ENTERPRISE' },
            },
          ],
        }),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({ 
          id: 'sub_test_new',
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        }),
        retrieve: jest.fn().mockResolvedValue({ 
          id: 'sub_test_123',
          status: 'active',
          items: {
            data: [{
              price: {
                id: 'price_pro',
                unit_amount: 9900,
                metadata: { plan: 'PRO' },
              },
            }],
          },
          current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
          cancel_at_period_end: false,
        }),
        update: jest.fn().mockResolvedValue({ id: 'sub_test_123' }),
        cancel: jest.fn().mockResolvedValue({ 
          id: 'sub_test_123',
          cancel_at_period_end: true,
        }),
      },
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
          }),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            url: 'https://billing.stripe.com/session/test_123',
          }),
        },
      },
      invoices: {
        list: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'inv_test_1',
              amount_paid: 9900,
              status: 'paid',
              created: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
              invoice_pdf: 'https://stripe.com/invoice.pdf',
            },
          ],
        }),
        upcoming: jest.fn().mockResolvedValue({
          amount_due: 9900,
          created: Math.floor(Date.now() / 1000),
        }),
      },
      paymentMethods: {
        list: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'pm_test_123',
              type: 'card',
              card: {
                brand: 'visa',
                last4: '4242',
                exp_month: 12,
                exp_year: 2025,
              },
            },
          ],
        }),
      },
      products: {
        retrieve: jest.fn().mockImplementation((id) => {
          const products: any = {
            'prod_starter': { name: 'Starter Plan', metadata: { features: 'basic' } },
            'prod_pro': { name: 'Pro Plan', metadata: { features: 'advanced' } },
            'prod_enterprise': { name: 'Enterprise Plan', metadata: { features: 'unlimited' } },
          };
          return Promise.resolve(products[id] || { name: 'Unknown' });
        }),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    (Stripe as any).mockImplementation(() => mockStripe);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/billing/plans', () => {
    it('should return available billing plans', async () => {
      const response = await request(app)
        .get('/api/billing/plans')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        plans: expect.arrayContaining([
          expect.objectContaining({
            id: 'price_starter',
            name: 'Starter Plan',
            price: 29,
            currency: 'usd',
            interval: 'month',
            features: 'basic',
          }),
          expect.objectContaining({
            id: 'price_pro',
            name: 'Pro Plan',
            price: 99,
            currency: 'usd',
            interval: 'month',
            features: 'advanced',
          }),
        ]),
      });

      expect(mockStripe.prices.list).toHaveBeenCalled();
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.prices.list.mockRejectedValueOnce(new Error('Stripe API error'));

      const response = await request(app)
        .get('/api/billing/plans')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch billing plans',
      });
    });
  });

  describe('GET /api/billing/subscription', () => {
    it('should return current subscription details', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        subscription: {
          id: 'sub_test_123',
          status: 'active',
          plan: 'PRO',
          price: 99,
          currentPeriodEnd: expect.any(String),
          cancelAtPeriodEnd: false,
        },
      });
    });

    it('should return null for organizations without subscription', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        subscription: null,
      });
    });

    it('should handle canceled subscriptions', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);
      mockStripe.subscriptions.retrieve.mockResolvedValueOnce({
        id: 'sub_test_123',
        status: 'canceled',
        items: { data: [] },
        current_period_end: Math.floor(Date.now() / 1000) - 24 * 60 * 60,
      });

      const response = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.subscription.status).toBe('canceled');
    });
  });

  describe('POST /api/billing/checkout', () => {
    it('should create checkout session for new subscription', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: null,
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);
      (prisma.organization.update as jest.Mock).mockResolvedValue({
        ...mockOrg,
        stripeCustomerId: 'cus_test_new',
      });

      const response = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({
          priceId: 'price_pro',
          successUrl: 'https://app.example.com/billing/success',
          cancelUrl: 'https://app.example.com/billing',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: testUser.email,
        metadata: {
          organizationId: testOrganization.id,
          userId: testUser.id,
        },
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_test_new',
          line_items: [{
            price: 'price_pro',
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: expect.any(String),
          cancel_url: expect.any(String),
        })
      );
    });

    it('should handle upgrade/downgrade for existing subscription', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({
          priceId: 'price_enterprise',
          successUrl: 'https://app.example.com/billing/success',
          cancelUrl: 'https://app.example.com/billing',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          subscription_data: {
            metadata: {
              replaces: 'sub_test_123',
            },
          },
        })
      );
    });

    it('should validate price ID', async () => {
      const response = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .send({
          priceId: '',
          successUrl: 'https://app.example.com/billing/success',
          cancelUrl: 'https://app.example.com/billing',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Price ID is required',
      });
    });
  });

  describe('POST /api/billing/cancel', () => {
    it('should cancel subscription at period end', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Subscription canceled successfully',
        cancelAtPeriodEnd: true,
      });

      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_test_123', {
        cancel_at_period_end: true,
      });
    });

    it('should return 404 if no subscription exists', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: null,
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'No active subscription found',
      });
    });
  });

  describe('POST /api/billing/reactivate', () => {
    it('should reactivate canceled subscription', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);
      mockStripe.subscriptions.retrieve.mockResolvedValueOnce({
        id: 'sub_test_123',
        cancel_at_period_end: true,
      });

      mockStripe.subscriptions.update.mockResolvedValueOnce({
        id: 'sub_test_123',
        cancel_at_period_end: false,
      });

      const response = await request(app)
        .post('/api/billing/reactivate')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Subscription reactivated successfully',
      });

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_test_123', {
        cancel_at_period_end: false,
      });
    });
  });

  describe('GET /api/billing/portal', () => {
    it('should create billing portal session', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/portal')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ returnUrl: 'https://app.example.com/billing' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        portalUrl: 'https://billing.stripe.com/session/test_123',
      });

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://app.example.com/billing',
      });
    });

    it('should return 404 if no Stripe customer exists', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: null,
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/portal')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'No billing account found',
      });
    });
  });

  describe('GET /api/billing/invoices', () => {
    it('should return invoice history', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        invoices: expect.arrayContaining([
          expect.objectContaining({
            id: 'inv_test_1',
            amount: 99,
            status: 'paid',
            date: expect.any(String),
            downloadUrl: 'https://stripe.com/invoice.pdf',
          }),
        ]),
      });

      expect(mockStripe.invoices.list).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        limit: 100,
      });
    });

    it('should include upcoming invoice', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`)
        .query({ includeUpcoming: true });

      expect(response.status).toBe(200);
      expect(response.body.upcoming).toMatchObject({
        amount: 99,
        date: expect.any(String),
      });

      expect(mockStripe.invoices.upcoming).toHaveBeenCalledWith({
        customer: 'cus_test_123',
      });
    });
  });

  describe('GET /api/billing/payment-methods', () => {
    it('should return payment methods', async () => {
      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrg);

      const response = await request(app)
        .get('/api/billing/payment-methods')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        paymentMethods: expect.arrayContaining([
          expect.objectContaining({
            id: 'pm_test_123',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              expMonth: 12,
              expYear: 2025,
            },
          }),
        ]),
      });
    });
  });

  describe('POST /api/billing/webhook', () => {
    it('should handle subscription created webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_new',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [{
                price: {
                  metadata: { plan: 'PRO' },
                },
              }],
            },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);
      (prisma.organization.update as jest.Mock).mockResolvedValue({
        ...mockOrg,
        stripeSubscriptionId: 'sub_test_new',
        plan: 'PRO',
      });

      const response = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookEvent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: mockOrg.id },
        data: {
          stripeSubscriptionId: 'sub_test_new',
          plan: 'PRO',
        },
      });
    });

    it('should handle subscription deleted webhook', async () => {
      const webhookEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
      };

      (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);
      (prisma.organization.update as jest.Mock).mockResolvedValue({
        ...mockOrg,
        stripeSubscriptionId: null,
        plan: 'FREE',
      });

      const response = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookEvent);

      expect(response.status).toBe(200);

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: mockOrg.id },
        data: {
          stripeSubscriptionId: null,
          plan: 'FREE',
        },
      });
    });

    it('should handle payment failed webhook', async () => {
      const webhookEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'inv_test_failed',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      const mockOrg = {
        ...testOrganization,
        stripeCustomerId: 'cus_test_123',
      };

      (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrg);

      // Mock email service
      const { sendEmail } = require('../../src/services/emailService');
      jest.mock('../../src/services/emailService', () => ({
        sendEmail: jest.fn(),
      }));

      const response = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'test_signature')
        .send(webhookEvent);

      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Webhook signature verification failed',
      });
    });
  });

  describe('GET /api/billing/usage', () => {
    it('should return usage statistics', async () => {
      const mockUsage = {
        chats: 1500,
        storage: 2.5, // GB
        users: 25,
        limits: {
          chats: 5000,
          storage: 10,
          users: 50,
        },
      };

      (prisma.chatLog.count as jest.Mock).mockResolvedValue(mockUsage.chats);
      (prisma.knowledgeBase.aggregate as jest.Mock).mockResolvedValue({
        _sum: { fileSize: mockUsage.storage * 1024 * 1024 * 1024 },
      });
      (prisma.user.count as jest.Mock).mockResolvedValue(mockUsage.users);

      const response = await request(app)
        .get('/api/billing/usage')
        .set('Authorization', `Bearer ${generateTestToken(testUser.id, testOrganization.id)}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        usage: {
          chats: {
            used: mockUsage.chats,
            limit: mockUsage.limits.chats,
            percentage: 30,
          },
          storage: {
            used: mockUsage.storage,
            limit: mockUsage.limits.storage,
            percentage: 25,
          },
          users: {
            used: mockUsage.users,
            limit: mockUsage.limits.users,
            percentage: 50,
          },
        },
      });
    });
  });
});