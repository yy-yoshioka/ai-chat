import type { BillingPlan } from './plan';

/** フロント側で保持する Stripe 公開キー・プラン表など */
export interface BillingConfig {
  stripePublishableKey: string;
  trialPeriodDays: number;
  defaultPlan: string;
  plans: BillingPlan[];
}
