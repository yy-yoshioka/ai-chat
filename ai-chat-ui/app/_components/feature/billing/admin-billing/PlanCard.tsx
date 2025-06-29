import { BillingPlan } from '@/app/_domains/billing';
import { PLAN_STATUS_LABEL } from '@/app/_config/billing/ui';

interface PlanCardProps {
  plan: BillingPlan;
  status: 'current' | 'trial' | 'available';
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export function PlanCard({ plan, status, onSelect, loading = false }: PlanCardProps) {
  const isPopular = plan.id === 'pro';
  const isCurrent = status === 'current' || status === 'trial';

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
        isPopular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
      }`}
    >
      {isPopular && (
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
              <span className="text-sm text-gray-600 ml-3">{feature}</span>
            </li>
          ))}
        </ul>

        {/* アクションボタン */}
        <button
          onClick={() => onSelect(plan.id)}
          disabled={loading || isCurrent}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            isCurrent
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isPopular
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {loading
            ? '処理中...'
            : isCurrent
              ? PLAN_STATUS_LABEL[status]
              : `${plan.name}を選択`}
        </button>

        {plan.id === 'free' && (
          <p className="text-xs text-gray-500 text-center mt-3">
            クレジットカードの登録は不要です
          </p>
        )}
      </div>
    </div>
  );
}
