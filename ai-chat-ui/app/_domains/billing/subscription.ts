export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  /** 紐づく BillingPlan.id */
  planId: string;
  /** Stripe customerId */
  customerId: string;
  /** ISO 文字列 */
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  /** trial 中 or paused かのフラグ */
  isTrialActive: boolean;
  /** trial 残日数（UI 用） */
  trialDaysRemaining?: number;
}
