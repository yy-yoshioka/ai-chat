/**
 * プラン種類（Prisma の enum PlanType と合わせる）
 */
export type PlanType = 'free' | 'pro' | 'enterprise';

/**
 * 課金間隔
 */
export type BillingInterval = 'month' | 'year';

/**
 * Stripe 連携を想定した課金プラン定義
 */
export interface BillingPlan {
  id: string;
  /** UI 表示名 */
  name: string;
  /** ベース価格 */
  price: number;
  currency: 'JPY' | 'USD' | 'EUR';
  /** month / year */
  interval: BillingInterval;
  /** プラン種別 */
  type: PlanType;
  /** 主要機能ラベル */
  features: string[];
  /** PRO ラベル表示など */
  isPopular?: boolean;
  /** Stripe product / price */
  stripeProductId: string;
  stripePriceId: string;
}
