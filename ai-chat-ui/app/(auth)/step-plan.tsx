'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS } from '../_config/billing/plans';
import { TRIAL_DAYS } from '../_config/billing/trial';
import { formatCurrency } from '../_utils/formatters';

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

export default function StepPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handlePlanSelect = async (plan: PlanOption) => {
    if (plan.id === 'free') {
      // Free プランの場合は直接プロフィールへ
      router.push('/profile');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Get current organization ID (you may need to adjust this based on your auth system)
      const orgId = localStorage.getItem('currentOrgId') || 'default-org'; // or get from auth context

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          orgId: orgId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.sessionUrl;
      } else {
        const error = await response.json();
        console.error('Checkout failed:', error);
        alert(`支払い処理の開始に失敗しました: ${error.error || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">プランを選択してください</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            あなたのニーズに最適なプランを選んでAIチャットを始めましょう。
            <br />
            <span className="text-blue-600 font-semibold">
              Proプランは{TRIAL_DAYS}日間無料でお試しいただけます
            </span>
          </p>
        </div>

        {/* プランカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
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
                onClick={() => handlePlanSelect(plan)}
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
                ) : plan.id === 'free' ? (
                  '無料で始める'
                ) : (
                  `${TRIAL_DAYS}日無料で試す`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 追加情報 */}
        <div className="text-center text-gray-600">
          <p className="mb-2">💳 無料期間中はいつでもキャンセル可能です</p>
          <p className="mb-4">🔒 すべての取引はSSLで暗号化されています</p>
          <div className="text-sm">
            ご質問がございましたら{' '}
            <Link href="/help" className="text-blue-600 hover:text-blue-800 underline">
              ヘルプセンター
            </Link>{' '}
            をご覧ください
          </div>
        </div>
      </div>
    </div>
  );
}
