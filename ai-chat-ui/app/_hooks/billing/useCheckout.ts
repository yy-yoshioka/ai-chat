// app/_hooks/billing/useCheckout.ts
'use client';

import { useState } from 'react';

export interface CheckoutState {
  loading: boolean;
  processingId: string | null;
  checkout: (priceId: string) => Promise<void>;
}

export const useCheckout = (): CheckoutState => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkout = async (priceId: string) => {
    // Free プランは page 内でハンドリングするため priceId === '' は呼ばない想定
    setLoading(true);
    setProcessingId(priceId);
    try {
      const orgId = localStorage.getItem('currentOrgId') ?? 'default-org';
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, orgId }),
      });
      if (!res.ok) throw await res.json();

      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl as string;
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  return { loading, processingId, checkout };
};
