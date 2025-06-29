'use client';

import React from 'react';
import { PlanCard } from './PlanCard';
import type { EnhancedBillingPlan } from '@/app/_schemas/billing';

interface PlansTabProps {
  plans: EnhancedBillingPlan[];
  onUpgrade: (planId: string) => void;
}

export function PlansTab({ plans, onUpgrade }: PlansTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onUpgrade={onUpgrade} />
      ))}
    </div>
  );
}