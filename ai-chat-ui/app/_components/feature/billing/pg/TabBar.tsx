'use client';

import React from 'react';

export type BillingTab = 'plan' | 'usage' | 'invoices';

interface TabBarProps {
  value: BillingTab;
  onChange: (next: BillingTab) => void;
}

const tabs: { id: BillingTab; label: string; icon: string }[] = [
  { id: 'plan', label: 'プラン', icon: '💳' },
  { id: 'usage', label: '利用状況', icon: '📊' },
  { id: 'invoices', label: '請求書', icon: '📄' },
];

export default function TabBar({ value, onChange }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              value === t.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
