import { z } from 'zod';

// Enhanced Billing Plan types
export const billingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tier: z.enum(['free', 'starter', 'pro', 'enterprise', 'custom']),
  pricing: z.object({
    basePrice: z.number(),
    currency: z.enum(['USD', 'JPY', 'EUR']),
    interval: z.enum(['month', 'year']),
  }),
  limits: z.object({
    messages: z.number(),
    users: z.number(),
    storage: z.number(), // GB
    apiCalls: z.number(),
    knowledgeBases: z.number(),
    customBranding: z.boolean(),
    sso: z.boolean(),
    advancedAnalytics: z.boolean(),
  }),
  overageRates: z.object({
    messages: z.number(), // price per 1000 messages
    users: z.number(), // price per user
    storage: z.number(), // price per GB
    apiCalls: z.number(), // price per 1000 calls
  }),
  features: z.array(z.string()),
  isActive: z.boolean(),
  subscribedUsers: z.number(),
  stripePriceId: z.string().optional(),
  popular: z.boolean().optional(),
});

// Legacy BillingPlan for backwards compatibility
export const BillingPlan = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  interval: z.enum(['month', 'year']),
  features: z.array(z.string()),
  stripePriceId: z.string().optional(),
  popular: z.boolean().optional(),
});

export const BillingPlans = z.array(BillingPlan);

// Enhanced Usage Data types
export const usageDataSchema = z.object({
  organizationId: z.string(),
  currentPlan: z.string(),
  billingPeriod: z.object({
    start: z.string(),
    end: z.string(),
  }),
  usage: z.object({
    messages: z.number(),
    users: z.number(),
    storage: z.number(),
    apiCalls: z.number(),
    knowledgeBases: z.number(),
  }),
  overage: z.object({
    messages: z.number(),
    users: z.number(),
    storage: z.number(),
    apiCalls: z.number(),
    totalCost: z.number(),
  }),
  totalCost: z.number(),
  nextBillingDate: z.string(),
});

// Legacy UsageData for backwards compatibility
export const UsageData = z.object({
  currentPlan: z.string().optional(),
  usage: z.object({
    messages: z.number(),
    tokens: z.number(),
    apiCalls: z.number(),
  }),
  limits: z.object({
    messages: z.number(),
    tokens: z.number(),
    apiCalls: z.number(),
  }),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

// Overage Alert types
export const overageAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['messages', 'users', 'storage', 'apiCalls']),
  threshold: z.number(), // percentage
  isEnabled: z.boolean(),
  notifications: z.array(z.string()), // email addresses
});

// Type exports
export type BillingPlan = z.infer<typeof BillingPlan>;
export type EnhancedBillingPlan = z.infer<typeof billingPlanSchema>;
export type UsageData = z.infer<typeof UsageData>;
export type EnhancedUsageData = z.infer<typeof usageDataSchema>;
export type OverageAlert = z.infer<typeof overageAlertSchema>;
