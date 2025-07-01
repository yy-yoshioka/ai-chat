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

// Checkout Response Schema
export const CheckoutResponseSchema = z.object({
  sessionUrl: z.string(),
});

// Billing Plans Array Schema
export const billingPlansArraySchema = z.array(billingPlanSchema);

// Invoice Schema
export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  status: z.enum(['paid', 'pending', 'overdue']),
  invoiceDate: z.string(),
  dueDate: z.string(),
  pdfUrl: z.string().optional(),
});

export const InvoicesResponseSchema = z.object({
  invoices: z.array(InvoiceSchema),
});

// Type exports
export type BillingPlan = z.infer<typeof BillingPlan>;
export type EnhancedBillingPlan = z.infer<typeof billingPlanSchema>;
export type UsageData = z.infer<typeof UsageData>;
export type EnhancedUsageData = z.infer<typeof usageDataSchema>;
export type OverageAlert = z.infer<typeof overageAlertSchema>;
// KPI Metric Schema
export const KpiMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  previousValue: z.union([z.string(), z.number()]).optional(),
  change: z.number().optional(),
  changeType: z.enum(['increase', 'decrease']).optional(),
  unit: z.string().optional(),
});

export const BillingKpiSchema = z.object({
  revenue: KpiMetricSchema,
  activeSubscriptions: KpiMetricSchema,
  churnRate: KpiMetricSchema,
  averageRevenuePerUser: KpiMetricSchema,
  chartData: z
    .object({
      labels: z.array(z.string()),
      revenue: z.array(z.number()),
      subscriptions: z.array(z.number()),
    })
    .optional(),
});

// Billing Request Schemas
export const UpdateBillingPlanSchema = z.object({
  planId: z.string(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type KpiMetric = z.infer<typeof KpiMetricSchema>;
export type BillingKpi = z.infer<typeof BillingKpiSchema>;
export type UpdateBillingPlanRequest = z.infer<typeof UpdateBillingPlanSchema>;
