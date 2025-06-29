'use client';

import { getUsagePercentage } from '@/app/_utils/billing/usage-utils';
import React from 'react';

interface Props {
  usage: {
    usage: { apiCalls: number; messages: number; tokens: number };
    limits: { apiCalls: number; messages: number; tokens: number };
    period: { start: string; end: string };
  };
}

export default function UsageTab({ usage }: Props) {
  const { usage: u, limits } = usage;

  const bar = (value: number, limit: number, color: string) => (
    <div>
      <div className="flex justify-between text-sm">
        <span>{value.toLocaleString()}</span>
        <span>{limit === -1 ? '無制限' : limit.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${getUsagePercentage(value, limit)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">利用状況</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bar(u.apiCalls, limits.apiCalls, 'bg-blue-600')}
        {bar(u.messages, limits.messages, 'bg-green-600')}
        {bar(u.tokens, limits.tokens, 'bg-purple-600')}
      </div>
    </div>
  );
}
