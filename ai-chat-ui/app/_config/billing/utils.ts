import { TIER_COLORS, USAGE_THRESHOLDS, USAGE_COLORS, CURRENCY_OPTIONS } from './constants';

export function getTierColor(tier: keyof typeof TIER_COLORS): string {
  return TIER_COLORS[tier] || TIER_COLORS.free;
}

export function formatPrice(amount: number, currency: string): string {
  const currencyOption = CURRENCY_OPTIONS.find((opt) => opt.value === currency);
  const symbol = currencyOption?.symbol || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

export function calculateUsagePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100);
}

export function getUsageColor(percentage: number): string {
  if (percentage >= USAGE_THRESHOLDS.high) return USAGE_COLORS.high;
  if (percentage >= USAGE_THRESHOLDS.medium) return USAGE_COLORS.medium;
  return USAGE_COLORS.low;
}
