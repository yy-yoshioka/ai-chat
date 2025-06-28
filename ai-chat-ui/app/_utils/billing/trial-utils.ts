import { TRIAL_DAYS } from '@/app/_config/billing/trial';
import type { Subscription } from '@/app/_domains/billing';

/** 残り日数と次回課金日を返すユーティリティ */
export function calcTrialInfo(sub: Subscription | null) {
  const today = new Date();

  // 1) 既に Stripe から trialEnd が返っているなら最優先
  const trialEnd = sub?.trialEnd ? new Date(sub.trialEnd) : addDays(today, TRIAL_DAYS);

  const diffDays = Math.max(0, Math.ceil((trialEnd.getTime() - today.getTime()) / 86_400_000));

  const nextBilling = sub?.isTrialActive
    ? trialEnd
    : sub?.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd)
      : null;

  return {
    trialDaysRemaining: sub?.isTrialActive ? diffDays : null,
    nextBillingDate: nextBilling?.toLocaleDateString('ja-JP') ?? null,
  };
}

/* --- 小さなヘルパー --- */
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
