import type { EnhancedBillingPlan, EnhancedUsageData } from '@/app/_schemas/billing';

export const mockBillingPlans: EnhancedBillingPlan[] = [
  {
    id: '1',
    name: 'Free',
    description: '個人利用や小規模プロジェクトに最適',
    tier: 'free',
    pricing: { basePrice: 0, currency: 'USD', interval: 'month' },
    limits: {
      messages: 1000,
      users: 3,
      storage: 1,
      apiCalls: 5000,
      knowledgeBases: 1,
      customBranding: false,
      sso: false,
      advancedAnalytics: false,
    },
    overageRates: { messages: 0, users: 0, storage: 0, apiCalls: 0 },
    features: ['基本的なチャット機能', 'コミュニティサポート'],
    isActive: true,
    subscribedUsers: 1250,
  },
  {
    id: '2',
    name: 'Starter',
    description: '小規模チームに最適',
    tier: 'starter',
    pricing: { basePrice: 29, currency: 'USD', interval: 'month' },
    limits: {
      messages: 10000,
      users: 10,
      storage: 10,
      apiCalls: 50000,
      knowledgeBases: 5,
      customBranding: false,
      sso: false,
      advancedAnalytics: false,
    },
    overageRates: { messages: 0.1, users: 5, storage: 0.5, apiCalls: 0.05 },
    features: ['優先サポート', 'カスタムブランディング', 'APIアクセス'],
    isActive: true,
    subscribedUsers: 450,
  },
  {
    id: '3',
    name: 'Pro',
    description: '成長中の企業に最適',
    tier: 'pro',
    pricing: { basePrice: 99, currency: 'USD', interval: 'month' },
    limits: {
      messages: 50000,
      users: 50,
      storage: 100,
      apiCalls: 500000,
      knowledgeBases: 20,
      customBranding: true,
      sso: false,
      advancedAnalytics: true,
    },
    overageRates: { messages: 0.08, users: 4, storage: 0.3, apiCalls: 0.03 },
    features: ['24/7サポート', 'カスタムブランディング', 'APIアクセス', '高度な分析'],
    isActive: true,
    subscribedUsers: 120,
  },
  {
    id: '4',
    name: 'Enterprise',
    description: '大企業向けの完全ソリューション',
    tier: 'enterprise',
    pricing: { basePrice: 299, currency: 'USD', interval: 'month' },
    limits: {
      messages: 200000,
      users: 200,
      storage: 500,
      apiCalls: 2000000,
      knowledgeBases: 100,
      customBranding: true,
      sso: true,
      advancedAnalytics: true,
    },
    overageRates: { messages: 0.05, users: 3, storage: 0.2, apiCalls: 0.02 },
    features: ['専任サポート', 'SSO対応', 'SLA保証', 'カスタム開発'],
    isActive: true,
    subscribedUsers: 35,
  },
];

export function createMockUsageData(organizationId: string, planName: string): EnhancedUsageData {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    organizationId,
    currentPlan: planName,
    billingPeriod: {
      start: now.toISOString(),
      end: nextMonth.toISOString(),
    },
    usage: {
      messages: Math.floor(Math.random() * 5000),
      users: Math.floor(Math.random() * 10),
      storage: Math.random() * 5,
      apiCalls: Math.floor(Math.random() * 25000),
      knowledgeBases: Math.floor(Math.random() * 3),
    },
    overage: {
      messages: 0,
      users: 0,
      storage: 0,
      apiCalls: 0,
      totalCost: 0,
    },
    totalCost: 0,
    nextBillingDate: nextMonth.toISOString(),
  };
}

export const mockAnalyticsData = {
  revenue: {
    monthly: [
      { month: 'Jan', revenue: 12500 },
      { month: 'Feb', revenue: 15200 },
      { month: 'Mar', revenue: 18900 },
      { month: 'Apr', revenue: 22100 },
      { month: 'May', revenue: 25800 },
      { month: 'Jun', revenue: 28500 },
    ],
  },
  planDistribution: [
    { plan: 'Free', count: 1250, percentage: 65 },
    { plan: 'Starter', count: 450, percentage: 23 },
    { plan: 'Pro', count: 120, percentage: 8 },
    { plan: 'Enterprise', count: 35, percentage: 4 },
  ],
  usageTrends: {
    messages: [2500, 3200, 4100, 5300, 6800, 8200],
    storage: [120, 145, 178, 210, 245, 290],
    apiCalls: [45000, 52000, 61000, 73000, 85000, 98000],
  },
};
