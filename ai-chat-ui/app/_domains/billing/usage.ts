/**
 * Stripe Usage Record (Prisma model Usage 相当)
 */
export interface UsageRecord {
  subscriptionItemId: string;
  quantity: number;
  /** Unix 秒 */
  timestamp: number;
  action?: 'increment' | 'set';
}

/**
 * 組織別の当月 Usage サマリ
 */
export interface UsageSummary {
  orgId: string;
  intervalStart: string;
  intervalEnd: string;
  messages: number;
  tokens: number;
  apiCalls: number;
}
