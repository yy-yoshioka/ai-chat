'use client';

import { Subscription } from '@/app/_domains/billing';
import { AVAILABLE_PLANS } from '@/app/_config/billing';
import { PLAN_STATUS_LABEL, PLAN_STATUS_STYLE } from '@/app/_config/billing/ui';
import { calcTrialInfo } from '@/app/_utils/billing/trial-utils';
import React from 'react';

interface BillingPlansProps {
  currentSubscription?: Subscription | null;
  onPlanSelect: (planId: string) => void;
  loading?: boolean;
}

/** current / trial / available を求める共通ルール */
const getPlanStatus = (
  sub: Subscription | null | undefined,
  planId: string
): 'current' | 'trial' | 'available' => {
  if (!sub) return 'available';
  if (sub.planId !== planId) return 'available';
  return sub.isTrialActive ? 'trial' : 'current';
};

export default function BillingPlans({
  currentSubscription,
  onPlanSelect,
  loading = false,
}: BillingPlansProps) {
  /* ── 試用期間の残り日数と次回課金日をヘルパーで計算 ─────────────────────── */
  const { trialDaysRemaining, nextBillingDate } = calcTrialInfo(currentSubscription ?? null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header ─────────────────────────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">プラン選択</h1>
        <p className="text-xl text-gray-600 mb-8">あなたのビジネスに最適なプランをお選びください</p>

        {/* Trial Status Banner */}
        {currentSubscription?.isTrialActive && trialDaysRemaining !== null && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-blue-800">
                <strong>無料トライアル残り: {trialDaysRemaining}日</strong>
                {nextBillingDate && (
                  <>
                    <br />
                    <span className="text-xs">{nextBillingDate} に初回課金が開始されます</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Next Billing Info */}
        {currentSubscription && !currentSubscription.isTrialActive && nextBillingDate && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>次回課金日: {nextBillingDate}</strong>
            </p>
            {currentSubscription.cancelAtPeriodEnd && (
              <p className="text-xs text-orange-600 mt-1">プランは期間終了時にキャンセルされます</p>
            )}
          </div>
        )}
      </div>

      {/* Plans Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {AVAILABLE_PLANS.map((plan) => {
          const status = getPlanStatus(currentSubscription, plan.id);
          const isDisabled = status === 'current' || status === 'trial' || loading;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                plan.isPopular
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isDisabled ? 'opacity-75' : ''}`}
            >
              {/* 人気ラベル */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    人気プラン
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* プランヘッダ */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-1">/月</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">税込価格</p>
                </div>

                {/* ステータスバッジ */}
                {status !== 'available' && (
                  <div className="text-center mb-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'trial'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {PLAN_STATUS_LABEL[status]}
                    </span>
                  </div>
                )}

                {/* 機能リスト */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 flex-shrink-0"
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
                      <span className="ml-3 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 申込ボタン */}
                <button
                  onClick={() => !isDisabled && onPlanSelect(plan.id)}
                  disabled={isDisabled}
                  className={PLAN_STATUS_STYLE[status]}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></span>
                      処理中...
                    </span>
                  ) : (
                    PLAN_STATUS_LABEL[status]
                  )}
                </button>

                {/* Trial 説明 */}
                {status === 'available' && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    14日間無料、その後月額課金開始
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* フッター的な注意書き */}
      <div className="text-center">
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💳 14日間無料トライアル</h3>
          <p className="text-blue-800 text-sm">
            すべてのプランで14日間の無料トライアルをご利用いただけます。
            <br />
            トライアル期間中はいつでもキャンセル可能で、課金は発生しません。
          </p>
        </div>

        <ul className="space-y-2 text-sm text-gray-500">
          <li>• プランはいつでも変更・キャンセル可能です</li>
          <li>• 使用量に応じた従量課金オプションもございます</li>
          <li>• 企業向けカスタムプランもご相談ください</li>
        </ul>
      </div>
    </div>
  );
}
