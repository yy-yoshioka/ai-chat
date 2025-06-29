import { z } from 'zod';

// Billing Plan types
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

export type BillingPlan = z.infer<typeof BillingPlan>;

// Usage Data types
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

export type UsageData = z.infer<typeof UsageData>;
