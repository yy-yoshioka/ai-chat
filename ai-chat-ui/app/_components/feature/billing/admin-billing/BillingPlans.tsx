'use client';

import { Subscription } from '@/app/_domains/billing';
import { AVAILABLE_PLANS } from '@/app/_config/billing';
import { TrialStatusBanner } from './TrialStatusBanner';
import { PlanCard } from './PlanCard';
import React from 'react';

interface BillingPlansProps {
  currentSubscription?: Subscription | null;
  onPlanSelect: (planId: string) => void;
  loading?: boolean;
}

const getPlanStatus = (
  sub: Subscription | null | undefined,
  planId: string
): 'current' | 'trial' | 'available' => {
  if (!sub) return 'available';
  if (sub.planId !== planId) return 'available';
  return sub.isTrialActive ? 'trial' : 'current';
};

export default function BillingPlans({
  currentSubscription,
  onPlanSelect,
  loading = false,
}: BillingPlansProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">プラン選択</h1>
        <p className="text-xl text-gray-600 mb-8">あなたのビジネスに最適なプランをお選びください</p>

        <TrialStatusBanner currentSubscription={currentSubscription} />
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {AVAILABLE_PLANS.map((plan) => {
          const status = getPlanStatus(currentSubscription, plan.id);
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              status={status}
              onSelect={onPlanSelect}
              loading={loading}
            />
          );
        })}
      </div>

      <div className="text-center mt-16">
        <p className="text-sm text-gray-500">
          すべてのプランには30日間の無料トライアルが含まれています
        </p>
        <p className="text-xs text-gray-400 mt-2">料金は月額制で、いつでもキャンセル可能です</p>
      </div>
    </div>
  );
}
