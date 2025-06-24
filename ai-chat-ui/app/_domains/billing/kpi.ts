/**
 * 課金 KPI ダッシュボード用
 */
export interface BillingKPI {
  trialToPaidConversionRate: number; // %
  monthlyChurnRate: number; // %
  averageLTV: number; // 平均顧客生涯価値
  totalActiveSubscriptions: number;
  totalTrialUsers: number;
  monthlyRecurringRevenue: number; // MRR
}
