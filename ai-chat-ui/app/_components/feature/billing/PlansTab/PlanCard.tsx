'use client';

import React from 'react';
import { getTierColor, formatPrice } from '@/app/_config/billing/utils';
import type { EnhancedBillingPlan } from '@/app/_schemas/billing';

interface PlanCardProps {
  plan: EnhancedBillingPlan;
  onUpgrade: (planId: string) => void;
}

export function PlanCard({ plan, onUpgrade }: PlanCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(plan.tier)}`}>
          {plan.tier.toUpperCase()}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-900">
          {formatPrice(plan.pricing.basePrice, plan.pricing.currency)}
        </p>
        <p className="text-sm text-gray-600">
          /{plan.pricing.interval === 'month' ? '月' : '年'}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-900">含まれる機能:</h4>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-600">
            <span className="mr-2">•</span>
            メッセージ: {plan.limits.messages.toLocaleString()}/月
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <span className="mr-2">•</span>
            ユーザー: {plan.limits.users}名
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <span className="mr-2">•</span>
            ストレージ: {plan.limits.storage}GB
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <span className="mr-2">•</span>
            API呼び出し: {plan.limits.apiCalls.toLocaleString()}/月
          </li>
          {plan.limits.customBranding && (
            <li className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              カスタムブランディング
            </li>
          )}
          {plan.limits.sso && (
            <li className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              SSO対応
            </li>
          )}
          {plan.limits.advancedAnalytics && (
            <li className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              高度な分析機能
            </li>
          )}
        </ul>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onUpgrade(plan.id)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          このプランを選択
        </button>
        <p className="text-xs text-center text-gray-500">
          現在 {plan.subscribedUsers} 組織が利用中
        </p>
      </div>
    </div>
  );
}