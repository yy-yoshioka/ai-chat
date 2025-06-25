import { useState, useEffect } from 'react';
import { BillingPlan, Subscription } from '@/app/_domains/billing';

interface BillingPlansProps {
  currentSubscription?: Subscription | null;
  onPlanSelect: (planId: string) => void;
  loading?: boolean;
}

const AVAILABLE_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2980,
    currency: 'JPY',
    type: 'subscription',
    interval: 'month',
    stripeProductId: 'prod_starter',
    stripePriceId: 'price_starter',
    features: [
      '月間1,000メッセージ',
      'ベーシックサポート',
      'ウィジェット設置',
      'FAQ管理',
      '基本レポート',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 9800,
    currency: 'JPY',
    type: 'subscription',
    interval: 'month',
    stripeProductId: 'prod_professional',
    stripePriceId: 'price_professional',
    isPopular: true,
    features: [
      '月間10,000メッセージ',
      'プライオリティサポート',
      'カスタムブランディング',
      'API アクセス',
      '詳細レポート・分析',
      'カスタム応答設定',
      'Webhook連携',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29800,
    currency: 'JPY',
    type: 'subscription',
    interval: 'month',
    stripeProductId: 'prod_enterprise',
    stripePriceId: 'price_enterprise',
    features: [
      '無制限メッセージ',
      '専任サポート',
      'オンプレミス対応',
      'SLA保証',
      'カスタム統合',
      '高度なセキュリティ',
      '専用インフラ',
      'CSM（Customer Success Manager）',
    ],
  },
];

export default function BillingPlans({
  currentSubscription,
  onPlanSelect,
  loading = false,
}: BillingPlansProps) {
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);

  useEffect(() => {
    if (currentSubscription) {
      calculateTrialInfo(currentSubscription);
    }
  }, [currentSubscription]);

  const calculateTrialInfo = (subscription: Subscription) => {
    const now = new Date();

    if (subscription.isTrialActive && subscription.trialEnd) {
      const trialEndDate = new Date(subscription.trialEnd);
      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setTrialDaysRemaining(Math.max(0, diffDays));
      setNextBillingDate(trialEndDate.toLocaleDateString('ja-JP'));
    } else if (subscription.currentPeriodEnd) {
      const nextBilling = new Date(subscription.currentPeriodEnd);
      setNextBillingDate(nextBilling.toLocaleDateString('ja-JP'));
      setTrialDaysRemaining(null);
    }
  };

  const isCurrentPlan = (planId: string): boolean => {
    return currentSubscription?.planId === planId;
  };

  const getPlanStatus = (planId: string): 'current' | 'trial' | 'available' => {
    if (!currentSubscription) return 'available';

    if (isCurrentPlan(planId)) {
      return currentSubscription.isTrialActive ? 'trial' : 'current';
    }

    return 'available';
  };

  const getButtonText = (planId: string): string => {
    const status = getPlanStatus(planId);

    switch (status) {
      case 'current':
        return '現在のプラン';
      case 'trial':
        return 'トライアル中';
      case 'available':
        return '14日間無料トライアル開始';
    }
  };

  const getButtonStyle = (planId: string): string => {
    const status = getPlanStatus(planId);
    const baseClasses = 'w-full py-3 px-4 rounded-lg font-medium transition-colors';

    switch (status) {
      case 'current':
        return `${baseClasses} bg-gray-100 text-gray-500 cursor-not-allowed`;
      case 'trial':
        return `${baseClasses} bg-green-100 text-green-700 cursor-not-allowed`;
      case 'available':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">プラン選択</h1>
        <p className="text-xl text-gray-600 mb-8">あなたのビジネスに最適なプランをお選びください</p>

        {/* Trial Status Banner */}
        {currentSubscription?.isTrialActive && trialDaysRemaining !== null && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-500"
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
              </div>
              <div className="ml-3 text-center">
                <p className="text-sm text-blue-800">
                  <strong>無料トライアル残り: {trialDaysRemaining}日</strong>
                </p>
                {nextBillingDate && (
                  <p className="text-xs text-blue-600">
                    {nextBillingDate} に初回課金が開始されます
                  </p>
                )}
              </div>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {AVAILABLE_PLANS.map((plan) => {
          const status = getPlanStatus(plan.id);
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
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    人気プラン
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
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

                {/* Status Badge */}
                {status !== 'available' && (
                  <div className="text-center mb-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'trial'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {status === 'trial' ? 'トライアル中' : '現在のプラン'}
                    </span>
                  </div>
                )}

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
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
                      </div>
                      <span className="ml-3 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => !isDisabled && onPlanSelect(plan.id)}
                  disabled={isDisabled}
                  className={getButtonStyle(plan.id)}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      処理中...
                    </div>
                  ) : (
                    getButtonText(plan.id)
                  )}
                </button>

                {/* Trial Info */}
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

      {/* Additional Info */}
      <div className="text-center">
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💳 14日間無料トライアル</h3>
          <p className="text-blue-800 text-sm">
            すべてのプランで14日間の無料トライアルをご利用いただけます。
            <br />
            トライアル期間中はいつでもキャンセル可能で、課金は発生しません。
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <p>• プランはいつでも変更・キャンセル可能です</p>
          <p>• 使用量に応じた従量課金オプションもございます</p>
          <p>• 企業向けカスタムプランもご相談ください</p>
        </div>
      </div>
    </div>
  );
}
