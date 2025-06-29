'use client';

import React from 'react';
import { formatPrice } from '@/app/_config/billing/utils';
import type { EnhancedUsageData } from '@/app/_schemas/billing';

interface StatsOverviewProps {
  usageData: EnhancedUsageData | null;
}

export function StatsOverview({ usageData }: StatsOverviewProps) {
  const stats = [
    {
      label: '現在のプラン',
      value: usageData?.currentPlan || 'Free',
      change: null,
    },
    {
      label: '今月の請求額',
      value: usageData ? formatPrice(usageData.totalCost, 'USD') : '$0.00',
      change: '+12.5%',
      changeType: 'increase' as const,
    },
    {
      label: '次回請求日',
      value: usageData?.nextBillingDate
        ? new Date(usageData.nextBillingDate).toLocaleDateString('ja-JP')
        : '未設定',
      change: null,
    },
    {
      label: '超過料金',
      value: usageData ? formatPrice(usageData.overage.totalCost, 'USD') : '$0.00',
      change: usageData && usageData.overage.totalCost > 0 ? '発生中' : null,
      changeType: usageData && usageData.overage.totalCost > 0 ? ('warning' as const) : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          {stat.change && (
            <p
              className={`text-sm mt-2 ${
                stat.changeType === 'increase'
                  ? 'text-red-600'
                  : stat.changeType === 'warning'
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}