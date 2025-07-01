'use client';

import React from 'react';
import Link from 'next/link';
import { PLANS } from '../_config/billing/plans';
import { TRIAL_DAYS } from '../_config/billing/trial';
import { PlanCard } from './step-plan/PlanCard';
import { usePlanCheckout } from './step-plan/usePlanCheckout';

export default function StepPlanPage() {
  const { isLoading, selectedPlan, handlePlanSelect } = usePlanCheckout();

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
            <PlanCard
              key={plan.id}
              plan={plan}
              isLoading={isLoading}
              selectedPlan={selectedPlan}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        {/* フッター */}
        <div className="text-center text-gray-600">
          <p className="mb-4">すべてのプランに含まれる機能があります</p>
          <Link href="/profile" className="text-blue-600 hover:underline">
            後でプランを選択する →
          </Link>
        </div>
      </div>
    </div>
  );
}
