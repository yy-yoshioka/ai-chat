export const BILLING_TABS = [
  { id: 'plans', label: 'プラン管理' },
  { id: 'usage', label: '利用状況' },
  { id: 'overage', label: '超過料金設定' },
  { id: 'analytics', label: '分析' },
] as const;

export const TIER_COLORS = {
  free: 'text-gray-600 bg-gray-100',
  starter: 'text-blue-600 bg-blue-100',
  pro: 'text-purple-600 bg-purple-100',
  enterprise: 'text-indigo-600 bg-indigo-100',
  custom: 'text-pink-600 bg-pink-100',
} as const;

export const USAGE_THRESHOLDS = {
  low: 50,
  medium: 80,
  high: 90,
} as const;

export const USAGE_COLORS = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
} as const;

export const DEFAULT_PLAN_LIMITS = {
  messages: 10000,
  users: 10,
  storage: 10,
  apiCalls: 50000,
  knowledgeBases: 5,
  customBranding: false,
  sso: false,
  advancedAnalytics: false,
} as const;

export const DEFAULT_OVERAGE_RATES = {
  messages: 0.1,
  users: 5,
  storage: 0.5,
  apiCalls: 0.05,
} as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: '$', symbol: '$' },
  { value: 'JPY', label: '¥', symbol: '¥' },
  { value: 'EUR', label: '€', symbol: '€' },
] as const;

export const INTERVAL_OPTIONS = [
  { value: 'month', label: '月額' },
  { value: 'year', label: '年額' },
] as const;
