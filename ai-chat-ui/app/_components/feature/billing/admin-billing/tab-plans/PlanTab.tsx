'use client';

import React from 'react';
import { PLANS } from '@/app/_config/billing/plans';
import PlanGrid from './PlanGrid';
import { UsageData, BillingPlan } from '@/app/_schemas';
import { usePlanCheckout } from '@/app/_hooks/billing/useCheckout';

interface Props {
  billing: {
    plans: BillingPlan[];
    usage: UsageData;
  };
  orgId: string;
}

export default function PlanTab({ billing, orgId }: Props) {
  const { mutate: selectPlan, isPending } = usePlanCheckout();

  const handleSelect = async (planId: string) => {
    selectPlan({ orgId, planId });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">プランを選択</h3>
      <PlanGrid
        plans={PLANS}
        currentId={billing.plans[0].id}
        onSelect={handleSelect}
        loading={isPending}
      />
    </div>
  );
}
