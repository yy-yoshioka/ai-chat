import { prisma } from '@shared/database/prisma';
import { PlanType, Company } from '@prisma/client';
import { stripe, PRICING_PLANS, TOKEN_PRICING } from '@shared/payment/stripe';
import { webhookService } from '../../webhooks/services/webhookService';
import Stripe from 'stripe';

interface TrialSettings {
  durationDays: number;
  includedMessages: number;
  includedTokens: number;
}

const TRIAL_SETTINGS: Record<PlanType, TrialSettings | null> = {
  free: null,
  pro: {
    durationDays: 14,
    includedMessages: 500,
    includedTokens: 50000,
  },
  enterprise: {
    durationDays: 30,
    includedMessages: 2000,
    includedTokens: 200000,
  },
};

export class BillingService {
  /**
   * Start a trial for a company
   */
  async startTrial(companyId: string, planType: PlanType, userId: string) {
    const trialSettings = TRIAL_SETTINGS[planType];
    if (!trialSettings) {
      throw new Error(`No trial available for ${planType} plan`);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    if (company.trialStartedAt) {
      throw new Error('Trial already started for this company');
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialSettings.durationDays);

    // Update company with trial information
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        plan: planType,
        trialStartedAt: new Date(),
        trialEndsAt: trialEndDate,
        subscriptionStatus: 'trialing',
      },
    });

    // Log audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId: company.organizationId!,
        userId,
        action: 'trial_started',
        resource: 'billing',
        resourceId: companyId,
        success: true,
        details: {
          plan: planType,
          duration: trialSettings.durationDays,
          endsAt: trialEndDate,
        },
      },
    });

    // Trigger webhook
    if (company.organizationId) {
      await webhookService.triggerWebhook(
        company.organizationId,
        'billing.trial_started',
        {
          companyId,
          plan: planType,
          trialDuration: trialSettings.durationDays,
          trialEndsAt: trialEndDate.toISOString(),
          startedBy: userId,
          timestamp: new Date().toISOString(),
        }
      );
    }

    return updatedCompany;
  }

  /**
   * Check and handle trial expiration
   */
  async checkTrialExpiration(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || !company.trialEndsAt) {
      return null;
    }

    const now = new Date();
    const trialExpired = company.trialEndsAt < now;

    if (trialExpired && company.subscriptionStatus === 'trialing') {
      // Trial expired without conversion
      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          plan: 'free',
          subscriptionStatus: 'inactive',
          trialExpired: true,
        },
      });

      // Trigger webhook
      if (company.organizationId) {
        await webhookService.triggerWebhook(
          company.organizationId,
          'billing.trial_expired',
          {
            companyId,
            previousPlan: company.plan,
            timestamp: new Date().toISOString(),
          }
        );
      }

      return updatedCompany;
    }

    return company;
  }

  /**
   * Get trial status for a company
   */
  async getTrialStatus(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        usage: {
          where: {
            date: {
              gte: company.trialStartedAt || new Date(0),
            },
          },
        },
      },
    });

    if (!company || !company.trialStartedAt || !company.trialEndsAt) {
      return null;
    }

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const trialSettings = TRIAL_SETTINGS[company.plan];
    const usedMessages = company.usage.reduce((sum, u) => sum + u.messages, 0);
    const usedTokens = company.usage.reduce((sum, u) => sum + u.tokens, 0);

    return {
      isActive: company.subscriptionStatus === 'trialing' && daysRemaining > 0,
      daysRemaining,
      startedAt: company.trialStartedAt,
      endsAt: company.trialEndsAt,
      plan: company.plan,
      usage: {
        messages: usedMessages,
        messagesLimit: trialSettings?.includedMessages || 0,
        tokens: usedTokens,
        tokensLimit: trialSettings?.includedTokens || 0,
      },
    };
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrialToSubscription(
    companyId: string,
    paymentMethodId: string,
    userId: string
  ) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    if (company.subscriptionStatus !== 'trialing') {
      throw new Error('Company is not in trial period');
    }

    const plan = PRICING_PLANS[company.plan];
    if (!plan.priceId) {
      throw new Error('Cannot convert free plan trial to subscription');
    }

    // Create or get Stripe customer
    let customerId = company.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { companyId },
        email: company.email,
      });
      customerId = customer.id;
    }

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      metadata: { companyId },
      trial_end: Math.floor(company.trialEndsAt!.getTime() / 1000), // Honor remaining trial period
    });

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        stripeCustomerId: customerId,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
    });

    // Log audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId: company.organizationId!,
        userId,
        action: 'trial_converted',
        resource: 'billing',
        resourceId: companyId,
        success: true,
        details: {
          plan: company.plan,
          subscriptionId: subscription.id,
        },
      },
    });

    // Trigger webhook
    if (company.organizationId) {
      await webhookService.triggerWebhook(
        company.organizationId,
        'billing.trial_converted',
        {
          companyId,
          plan: company.plan,
          subscriptionId: subscription.id,
          convertedBy: userId,
          timestamp: new Date().toISOString(),
        }
      );
    }

    return updatedCompany;
  }

  /**
   * Get billing overview for a company
   */
  async getBillingOverview(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        usage: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Calculate current usage
    const currentUsage = company.usage.reduce(
      (acc, usage) => ({
        messages: acc.messages + usage.messages,
        tokens: acc.tokens + usage.tokens,
      }),
      { messages: 0, tokens: 0 }
    );

    // Get plan limits
    const planLimits = PRICING_PLANS[company.plan];

    // Calculate overage if applicable
    const messageOverage = Math.max(
      0,
      currentUsage.messages - planLimits.monthlyMessages
    );
    const tokenOverage = Math.max(
      0,
      currentUsage.tokens - planLimits.monthlyTokens
    );

    // Get upcoming invoice if subscription exists
    let upcomingInvoice = null;
    if (company.stripeCustomerId && company.subscriptionId) {
      try {
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: company.stripeCustomerId,
        });
        upcomingInvoice = {
          amount: invoice.total / 100,
          dueDate: new Date(invoice.period_end * 1000),
        };
      } catch (error) {
        console.error('Failed to retrieve upcoming invoice:', error);
      }
    }

    // Get trial status
    const trialStatus = await this.getTrialStatus(companyId);

    return {
      plan: company.plan,
      planLimits,
      currentUsage,
      overage: {
        messages: messageOverage,
        tokens: tokenOverage,
        estimatedCost:
          (tokenOverage / 1000) * TOKEN_PRICING.pricePerThousandTokens,
      },
      subscription: {
        id: company.subscriptionId,
        status: company.subscriptionStatus,
        customerId: company.stripeCustomerId,
      },
      trial: trialStatus,
      upcomingInvoice,
      tokenBalance: company.tokenBalance,
    };
  }

  /**
   * Handle subscription lifecycle events
   */
  async handleSubscriptionEvent(
    event: Stripe.Event,
    subscription: Stripe.Subscription
  ) {
    const companyId = subscription.metadata.companyId;
    if (!companyId) {
      console.error('No companyId in subscription metadata');
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      console.error(`Company ${companyId} not found`);
      return;
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.updateSubscriptionStatus(company, subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(company);
        break;

      case 'customer.subscription.trial_will_end':
        await this.handleTrialEndingSoon(company);
        break;
    }
  }

  /**
   * Update subscription status
   */
  private async updateSubscriptionStatus(
    company: Company,
    subscription: Stripe.Subscription
  ) {
    // Determine plan from subscription items
    let plan: PlanType = 'free';
    const priceId = subscription.items.data[0]?.price.id;

    if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      plan = 'pro';
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      plan = 'enterprise';
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
      },
    });

    if (company.organizationId) {
      await webhookService.triggerWebhook(
        company.organizationId,
        'billing.subscription_updated',
        {
          companyId: company.id,
          plan,
          status: subscription.status,
          subscriptionId: subscription.id,
          timestamp: new Date().toISOString(),
        }
      );
    }
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionCancellation(company: Company) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan: 'free',
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      },
    });

    if (company.organizationId) {
      await webhookService.triggerWebhook(
        company.organizationId,
        'billing.subscription_canceled',
        {
          companyId: company.id,
          previousPlan: company.plan,
          timestamp: new Date().toISOString(),
        }
      );
    }
  }

  /**
   * Handle trial ending soon notification
   */
  private async handleTrialEndingSoon(company: Company) {
    if (company.organizationId) {
      await webhookService.triggerWebhook(
        company.organizationId,
        'billing.trial_ending_soon',
        {
          companyId: company.id,
          plan: company.plan,
          trialEndsAt: company.trialEndsAt?.toISOString(),
          timestamp: new Date().toISOString(),
        }
      );
    }

    // Create notification for organization users
    const orgUsers = await prisma.user.findMany({
      where: {
        organizationId: company.organizationId,
        roles: { hasSome: ['owner', 'org_admin'] },
      },
    });

    for (const user of orgUsers) {
      await prisma.notification.create({
        data: {
          organizationId: company.organizationId!,
          userId: user.id,
          type: 'trial_ending',
          title: 'Trial Ending Soon',
          message: `Your ${company.plan} plan trial will end in 3 days. Add a payment method to continue enjoying premium features.`,
          data: {
            companyId: company.id,
            trialEndsAt: company.trialEndsAt,
          },
        },
      });
    }
  }

  /**
   * Process usage-based billing
   */
  async processUsageCharges(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        usage: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    if (!company || !company.stripeCustomerId) {
      return;
    }

    // Calculate current usage
    const currentUsage = company.usage.reduce(
      (acc, usage) => ({
        messages: acc.messages + usage.messages,
        tokens: acc.tokens + usage.tokens,
      }),
      { messages: 0, tokens: 0 }
    );

    const planLimits = PRICING_PLANS[company.plan];
    const tokenOverage = Math.max(
      0,
      currentUsage.tokens - planLimits.monthlyTokens
    );

    if (tokenOverage > 0 && company.tokenBalance < tokenOverage) {
      // Create usage record for overage tokens
      const overageAmount = Math.ceil(
        ((tokenOverage - company.tokenBalance) / 1000) *
          TOKEN_PRICING.pricePerThousandTokens *
          100
      );

      if (overageAmount > 0) {
        await stripe.invoiceItems.create({
          customer: company.stripeCustomerId,
          amount: overageAmount,
          currency: 'usd',
          description: `Token overage: ${tokenOverage.toLocaleString()} tokens`,
          metadata: {
            companyId: company.id,
            type: 'token_overage',
            tokens: tokenOverage.toString(),
          },
        });
      }
    }
  }
}

export const billingService = new BillingService();
