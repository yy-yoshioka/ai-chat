'use client';

import React from 'react';
import { PLANS } from '@/app/_config/billing/plans';
import PlanGrid from './PlanGrid';
import { UsageData, BillingPlan } from '@/app/_schemas';

interface Props {
  billing: {
    plans: BillingPlan[];
    usage: UsageData;
  };
  orgId: string;
}

export default function PlanTab({ billing, orgId }: Props) {
  const [loading, setLoading] = React.useState(false);

  const handleSelect = async (planId: string) => {
    setLoading(true);
    // ここで checkout API など呼び出し
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ orgId, planId }),
      });
      if (res.ok) {
        const { sessionUrl } = await res.json();
        window.location.href = sessionUrl;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">プランを選択</h3>
      <PlanGrid
        plans={PLANS}
        currentId={billing.plans[0].id}
        onSelect={handleSelect}
        loading={loading}
      />
    </div>
  );
}
