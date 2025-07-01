'use client';

import React from 'react';
import type { EnhancedUsageData } from '@/app/_schemas/billing';
import { UsageItem } from './UsageItem';
import { OverageSection } from './OverageSection';

interface UsageTabProps {
  usageData: EnhancedUsageData | null;
}

export function UsageTab({ usageData }: UsageTabProps) {
  if (!usageData) {
    return <div className="text-gray-500">利用データが取得できません</div>;
  }

  const usageItems = [
    { name: 'メッセージ', used: usageData.usage.messages, limit: 10000, unit: '件' },
    { name: 'ユーザー', used: usageData.usage.users, limit: 10, unit: '名' },
    { name: 'ストレージ', used: usageData.usage.storage, limit: 10, unit: 'GB' },
    { name: 'API呼び出し', used: usageData.usage.apiCalls, limit: 50000, unit: '回' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の利用状況</h3>
        <div className="space-y-4">
          {usageItems.map((item) => (
            <UsageItem key={item.name} {...item} />
          ))}
        </div>
      </div>

      <OverageSection overage={usageData.overage} />
    </div>
  );
}
