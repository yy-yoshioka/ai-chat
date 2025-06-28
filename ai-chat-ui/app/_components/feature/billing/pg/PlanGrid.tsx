'use client';

import React from 'react';
import { PlanOption } from '@/app/_config/billing/plans';
import StatusPill from './StatusPill';
import CurrentBadge from './CurrentBadge';

interface Props {
  plans: readonly PlanOption[];
  currentId?: string;
  onSelect?: (planId: string) => void;
  loading?: boolean;
}

export default function PlanGrid({ plans, currentId, onSelect, loading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentId;
        return (
          <div
            key={plan.id}
            className={`relative rounded-lg border p-6 transition ${
              plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  人気プラン
                </span>
              </div>
            )}

            {isCurrent && <CurrentBadge />}

            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
              <StatusPill price={plan.price} interval={plan.interval} currency={plan.currency} />
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-700 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {onSelect && (
              <button
                disabled={isCurrent || loading}
                onClick={() => onSelect(plan.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${loading ? 'opacity-60 cursor-wait' : ''}`}
              >
                {isCurrent ? '現在のプラン' : 'アップグレード'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
