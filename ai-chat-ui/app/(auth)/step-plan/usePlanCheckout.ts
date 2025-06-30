'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPost, FetchError } from '../../_utils/fetcher';

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

      const data = await fetchPost<{ sessionUrl: string }>('/api/billing/checkout', {
        priceId: plan.priceId,
        orgId: orgId,
      });

      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      if (error instanceof FetchError) {
        const errorData = error.data as { error?: string } | undefined;
        alert(`支払い処理の開始に失敗しました: ${errorData?.error || 'エラーが発生しました'}`);
      } else {
        alert('エラーが発生しました。もう一度お試しください。');
      }
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
