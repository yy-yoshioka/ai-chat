'use client';

import React from 'react';
import { calculateUsagePercentage, getUsageColor, formatPrice } from '@/app/_config/billing/utils';
import type { EnhancedUsageData } from '@/app/_schemas/billing';

interface UsageTabProps {
  usageData: EnhancedUsageData | null;
}

export function UsageTab({ usageData }: UsageTabProps) {
  if (!usageData) {
    return <div className="text-gray-500">利用データが取得できません</div>;
  }

  const usageItems = [
    {
      name: 'メッセージ',
      used: usageData.usage.messages,
      limit: 10000, // This should come from the plan limits
      unit: '件',
    },
    {
      name: 'ユーザー',
      used: usageData.usage.users,
      limit: 10,
      unit: '名',
    },
    {
      name: 'ストレージ',
      used: usageData.usage.storage,
      limit: 10,
      unit: 'GB',
    },
    {
      name: 'API呼び出し',
      used: usageData.usage.apiCalls,
      limit: 50000,
      unit: '回',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の利用状況</h3>
        <div className="space-y-4">
          {usageItems.map((item) => {
            const percentage = calculateUsagePercentage(item.used, item.limit);
            const color = getUsageColor(percentage);

            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  <span className={`font-medium ${color}`}>
                    {item.used.toLocaleString()} / {item.limit.toLocaleString()} {item.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percentage >= 90
                        ? 'bg-red-500'
                        : percentage >= 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{percentage}% 使用中</p>
              </div>
            );
          })}
        </div>
      </div>

      {usageData.overage.totalCost > 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">超過料金</h3>
          <div className="space-y-2">
            {usageData.overage.messages > 0 && (
              <div className="flex justify-between text-sm">
                <span>メッセージ超過分</span>
                <span className="font-medium">{formatPrice(usageData.overage.messages, 'USD')}</span>
              </div>
            )}
            {usageData.overage.users > 0 && (
              <div className="flex justify-between text-sm">
                <span>ユーザー超過分</span>
                <span className="font-medium">{formatPrice(usageData.overage.users, 'USD')}</span>
              </div>
            )}
            {usageData.overage.storage > 0 && (
              <div className="flex justify-between text-sm">
                <span>ストレージ超過分</span>
                <span className="font-medium">{formatPrice(usageData.overage.storage, 'USD')}</span>
              </div>
            )}
            {usageData.overage.apiCalls > 0 && (
              <div className="flex justify-between text-sm">
                <span>API呼び出し超過分</span>
                <span className="font-medium">{formatPrice(usageData.overage.apiCalls, 'USD')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-yellow-300">
              <div className="flex justify-between text-sm font-semibold">
                <span>超過料金合計</span>
                <span>{formatPrice(usageData.overage.totalCost, 'USD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}