'use client';

import React from 'react';
import { formatCurrency } from '@/app/_utils/formatters';

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

interface PlanCardProps {
  plan: PlanOption;
  isLoading: boolean;
  selectedPlan: string;
  onSelect: (plan: PlanOption) => void;
}

export function PlanCard({ plan, isLoading, selectedPlan, onSelect }: PlanCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 transition-all ${
        plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            人気プラン
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>

        {plan.price === 0 ? (
          <div className="text-3xl font-bold text-gray-900">無料</div>
        ) : (
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(plan.price, plan.currency)}
            <span className="text-lg font-normal text-gray-600">
              /{plan.interval === 'month' ? '月' : '年'}
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isLoading && selectedPlan === plan.id}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          plan.popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-800 text-white hover:bg-gray-900'
        } ${isLoading && selectedPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading && selectedPlan === plan.id ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            処理中...
          </div>
        ) : plan.id === 'pro' ? (
          '無料トライアルを開始'
        ) : (
          'このプランを選択'
        )}
      </button>
    </div>
  );
}
