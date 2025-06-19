// 課金プランの型定義
export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  stripeProductId: string;
  stripePriceId: string;
}

// サブスクリプション状態
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

// サブスクリプション情報
export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planId: string;
  customerId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  isTrialActive: boolean;
  trialDaysRemaining?: number;
}

// Stripe Checkout セッション作成リクエスト
export interface CheckoutSessionRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  trial?: boolean;
}

// Stripe Webhook イベント型
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  created: number;
}

// 使用量記録
export interface UsageRecord {
  subscriptionItemId: string;
  quantity: number;
  timestamp: number;
  action?: 'increment' | 'set';
}

// KPI データ
export interface BillingKPI {
  trialToePaidConversionRate: number;
  monthlyChurnRate: number;
  averageLTV: number;
  totalActiveSubscriptions: number;
  totalTrialUsers: number;
  monthlyRecurringRevenue: number;
}

// Trial 延長リクエスト
export interface TrialExtensionRequest {
  userId: string;
  extensionDays: number;
  reason?: string;
}

// 課金設定
export interface BillingConfig {
  stripePublishableKey: string;
  trialPeriodDays: number;
  defaultPlan: string;
  plans: BillingPlan[];
}
