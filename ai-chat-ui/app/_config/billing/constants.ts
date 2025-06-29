// Time constants
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MILLISECONDS_PER_DAY =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

// Trial period constants
export const TRIAL_WARNING_DAYS = 3;
export const DEFAULT_TRIAL_DAYS = 7;

// Plan price IDs
export const PRICE_IDS = {
  PRO_MONTHLY: 'price_pro_monthly',
  PRO_YEARLY: 'price_pro_yearly',
  ENTERPRISE_MONTHLY: 'price_enterprise_monthly',
  ENTERPRISE_YEARLY: 'price_enterprise_yearly',
} as const;

// Invoice status
export const INVOICE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
} as const;
