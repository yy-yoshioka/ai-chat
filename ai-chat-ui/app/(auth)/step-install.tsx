// app/(auth)/step-plan.tsx
'use client';

import { PLANS, PlanOption } from '@/app/_config/billing/plans';
import { PlanCard } from '@/app/_components/feature/billing/PlanCard';
import { useCheckout } from '@/app/_hooks/billing/useCheckout';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function StepPlanPage() {
  const router = useRouter();
  const { loading, processingId, checkout } = useCheckout();

  const handleSelect = (plan: PlanOption) => {
    if (plan.price === 0) return router.push('/profile');
    checkout(plan.priceId);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* ─ Header ─────────────────────────────────────────────────────────── */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">プランを選択してください</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          あなたのニーズに最適なプランを選んでAIチャットを始めましょう。
          <br />
          <span className="text-blue-600 font-semibold">
            Proプランは14日間無料でお試しいただけます
          </span>
        </p>
      </header>

      {/* ─ Plan Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            busy={loading && processingId === plan.priceId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* ─ Footer Note ───────────────────────────────────────────────────── */}
      <footer className="text-center text-gray-600">
        <p className="mb-2">💳 無料期間中はいつでもキャンセル可能です</p>
        <p className="mb-4">🔒 すべての取引はSSLで暗号化されています</p>
        <p className="text-sm">
          ご質問がございましたら{' '}
          <a href="/help" className="text-blue-600 hover:text-blue-800 underline">
            ヘルプセンター
          </a>{' '}
          をご覧ください
        </p>
      </footer>
    </section>
  );
}
