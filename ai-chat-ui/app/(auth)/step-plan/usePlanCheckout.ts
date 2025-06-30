'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlanOption {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export function usePlanCheckout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handlePlanSelect = async (plan: PlanOption) => {
    if (plan.id === 'free') {
      router.push('/profile');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan.id);

    try {
      const orgId = localStorage.getItem('currentOrgId') || 'default-org';

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          orgId: orgId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.sessionUrl;
      } else {
        const error = await response.json();
        console.error('Checkout failed:', error);
        alert(`支払い処理の開始に失敗しました: ${error.error || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  return {
    isLoading,
    selectedPlan,
    handlePlanSelect,
  };
}
