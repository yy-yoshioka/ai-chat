'use client';

import React from 'react';
import { formatCurrencyJP } from '@/app/_utils/formatters';
import type { PlanInterval } from '@/app/_config/billing/plans';

interface Props {
  price: number;
  currency: 'JPY' | 'USD';
  interval: PlanInterval;
}

export default function StatusPill({ price, interval }: Props) {
  const priceLabel =
    price === 0 ? '無料' : formatCurrencyJP(price) + (interval === 'month' ? '/月' : '/年');

  return (
    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold rounded-full px-3 py-1">
      {priceLabel}
    </span>
  );
}
