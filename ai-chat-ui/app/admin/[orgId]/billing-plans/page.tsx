'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
  pricing: {
    basePrice: number;
    currency: 'USD' | 'JPY' | 'EUR';
    interval: 'month' | 'year';
  };
  limits: {
    messages: number;
    users: number;
    storage: number; // GB
    apiCalls: number;
    knowledgeBases: number;
    customBranding: boolean;
    sso: boolean;
    advancedAnalytics: boolean;
  };
  overageRates: {
    messages: number; // price per 1000 messages
    users: number; // price per user
    storage: number; // price per GB
    apiCalls: number; // price per 1000 calls
  };
  features: string[];
  isActive: boolean;
  subscribedUsers: number;
}

interface UsageData {
  organizationId: string;
  currentPlan: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  usage: {
    messages: number;
    users: number;
    storage: number;
    apiCalls: number;
    knowledgeBases: number;
  };
  overage: {
    messages: number;
    users: number;
    storage: number;
    apiCalls: number;
    totalCost: number;
  };
  totalCost: number;
  nextBillingDate: string;
}

interface OverageAlert {
  id: string;
  type: 'messages' | 'users' | 'storage' | 'apiCalls';
  threshold: number; // percentage
  isEnabled: boolean;
  notifications: string[]; // email addresses
}

// Trial Alert Component
function TrialAlert() {
  // Mock trial data - replace with actual trial data from your API/context
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

  const today = new Date();
  const timeDiff = trialEndDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Don't show alert if trial period is over or not in trial
  if (daysLeft <= 0) return null;

  const handleUpgradeClick = async () => {
    try {
      // Get current organization ID from URL
      const orgId = window.location.pathname.split('/')[3]; // Extract from /admin/org/[id]/billing-plans

      if (!orgId) {
        alert('組織IDが見つかりません');
        return;
      }

      // Use Pro plan as default upgrade option
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_pro_monthly',
          orgId: orgId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.sessionUrl;
      } else {
        const error = await response.json();
        alert(`アップグレードに失敗しました: ${error.error || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('Failed to start upgrade:', error);
      alert('アップグレード中にエラーが発生しました');
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            <span className="text-2xl">⏰</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900">Proプラン無料トライアル中</h3>
            <p className="text-orange-800">
              トライアル終了まで <span className="font-bold">{daysLeft}日</span> です。 終了日:{' '}
              {trialEndDate.toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleUpgradeClick}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
          >
            プランをアップグレード
          </button>
          <button className="px-3 py-2 text-orange-700 hover:text-orange-900 text-sm">✕</button>
        </div>
      </div>
    </div>
  );
}

const BillingPlansPage = () => {
  const params = useParams();
  const orgId = params.orgId as string;
  const [selectedTab, setSelectedTab] = useState<'plans' | 'usage' | 'overage' | 'analytics'>(
    'plans'
  );
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [overageAlerts, setOverageAlerts] = useState<OverageAlert[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const loadBillingData = useCallback(async () => {
    try {
      const [plansResponse, usageResponse, alertsResponse] = await Promise.all([
        fetch(`/api/organizations/${orgId}/billing/plans`),
        fetch(`/api/organizations/${orgId}/billing/usage`),
        fetch(`/api/organizations/${orgId}/billing/overage-alerts`),
      ]);

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setBillingPlans(plansData);
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageData(usageData);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setOverageAlerts(alertsData);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
    }
  }, [orgId]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const createBillingPlan = () => {
    const newPlan: BillingPlan = {
      id: `plan-${Date.now()}`,
      name: 'New Plan',
      description: 'Custom billing plan',
      tier: 'custom',
      pricing: {
        basePrice: 0,
        currency: 'USD',
        interval: 'month',
      },
      limits: {
        messages: 10000,
        users: 100,
        storage: 10,
        apiCalls: 50000,
        knowledgeBases: 5,
        customBranding: false,
        sso: false,
        advancedAnalytics: false,
      },
      overageRates: {
        messages: 0.01,
        users: 5,
        storage: 2,
        apiCalls: 0.005,
      },
      features: [],
      isActive: false,
      subscribedUsers: 0,
    };

    setBillingPlans((prev) => [...prev, newPlan]);
    setIsCreatingPlan(false);
  };

  const upgradePlan = async (plan: BillingPlan) => {
    try {
      // Get current organization ID
      if (!orgId) {
        alert('組織IDが見つかりません');
        return;
      }

      // Use the new checkout API
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.tier === 'pro' ? 'price_pro_monthly' : 'price_enterprise_monthly',
          orgId: orgId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.sessionUrl;
      } else {
        const error = await response.json();
        alert(`プラン変更に失敗しました: ${error.error || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      alert('プラン変更中にエラーが発生しました');
    }
  };

  const updateOverageAlert = (alertId: string, updates: Partial<OverageAlert>) => {
    setOverageAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, ...updates } : alert))
    );
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-700';
      case 'starter':
        return 'bg-blue-100 text-blue-700';
      case 'pro':
        return 'bg-purple-100 text-purple-700';
      case 'enterprise':
        return 'bg-green-100 text-green-700';
      case 'custom':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(price);
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">課金プラン管理 + Overage課金</h1>
          <p className="text-gray-600 mt-1">料金プラン・使用量追跡・従量課金・分析</p>
        </div>
        <button
          onClick={() => setIsCreatingPlan(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + プラン作成
        </button>
      </div>

      {/* Trial Alert */}
      <TrialAlert />

      {/* 統計概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">月間収益</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData ? formatPrice(usageData.totalCost, 'USD') : '$0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overage収益</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData ? formatPrice(usageData.overage.totalCost, 'USD') : '$0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブプラン</p>
              <p className="text-2xl font-bold text-gray-900">{billingPlans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">使用量アラート</p>
              <p className="text-2xl font-bold text-gray-900">
                {overageAlerts.filter((a) => a.isEnabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'plans', label: '💳 プラン', desc: '料金プラン管理' },
            { key: 'usage', label: '📊 使用量', desc: '使用量追跡・監視' },
            { key: 'overage', label: '⚡ Overage', desc: '従量課金設定' },
            { key: 'analytics', label: '📈 分析', desc: '課金分析・レポート' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as 'plans' | 'usage' | 'overage' | 'analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div>{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* プランタブ */}
      {selectedTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {billingPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTierColor(plan.tier)}`}>
                      {plan.tier}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(plan.pricing.basePrice, plan.pricing.currency)}
                    </div>
                    <div className="text-sm text-gray-600">/{plan.pricing.interval}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-gray-900">制限</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">メッセージ</span>
                      <span className="font-medium">{plan.limits.messages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ユーザー</span>
                      <span className="font-medium">{plan.limits.users.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ストレージ</span>
                      <span className="font-medium">{plan.limits.storage} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API呼び出し</span>
                      <span className="font-medium">{plan.limits.apiCalls.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-gray-900">Overage料金</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">メッセージ</span>
                      <span className="font-medium">
                        {formatPrice(plan.overageRates.messages, plan.pricing.currency)}/1K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ユーザー</span>
                      <span className="font-medium">
                        {formatPrice(plan.overageRates.users, plan.pricing.currency)}/user
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ストレージ</span>
                      <span className="font-medium">
                        {formatPrice(plan.overageRates.storage, plan.pricing.currency)}/GB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-gray-900">機能</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.limits.customBranding && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        カスタムブランド
                      </span>
                    )}
                    {plan.limits.sso && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        SSO
                      </span>
                    )}
                    {plan.limits.advancedAnalytics && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        高度な分析
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">{plan.subscribedUsers} 契約者</div>
                  <button
                    onClick={() => upgradePlan(plan)}
                    disabled={plan.isActive}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      plan.isActive
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {plan.isActive ? '有効' : 'アップグレード'}
                  </button>
                </div>
              </div>
            ))}

            {billingPlans.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">💳</span>
                <p className="text-lg">課金プランが設定されていません</p>
                <p className="text-sm">「プラン作成」から設定してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用量タブ */}
      {selectedTab === 'usage' && (
        <div className="space-y-6">
          {usageData && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">現在の使用量</h3>
                    <p className="text-sm text-gray-600">
                      請求期間: {new Date(usageData.billingPeriod.start).toLocaleDateString()} -{' '}
                      {new Date(usageData.billingPeriod.end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(usageData.totalCost, 'USD')}
                    </div>
                    <div className="text-sm text-gray-600">
                      次回請求: {new Date(usageData.nextBillingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(usageData.usage).map(([key, value]) => {
                    const currentPlan = billingPlans.find((p) => p.isActive);
                    const limit =
                      (currentPlan?.limits[key as keyof typeof currentPlan.limits] as number) || 0;
                    const percentage = calculateUsagePercentage(value, limit);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </span>
                          <span className="text-sm text-gray-600">
                            {value.toLocaleString()} / {limit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}% 使用中</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overage料金</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(usageData.overage).map(([key, value]) => {
                    if (key === 'totalCost') return null;

                    return (
                      <div key={key} className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-red-600 capitalize">{key}</p>
                        <p className="text-xl font-bold text-red-900">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        <p className="text-xs text-red-600">制限超過分</p>
                      </div>
                    );
                  })}

                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-700">総Overage料金</p>
                    <p className="text-xl font-bold text-red-900">
                      {formatPrice(usageData.overage.totalCost, 'USD')}
                    </p>
                    <p className="text-xs text-red-700">追加料金</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!usageData && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📊</span>
              <p>使用量データを読み込み中...</p>
            </div>
          )}
        </div>
      )}

      {/* Overageタブ */}
      {selectedTab === 'overage' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overageアラート設定</h3>
            <div className="space-y-4">
              {overageAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {alert.type} アラート
                      </h4>
                      <p className="text-sm text-gray-600">
                        使用量が {alert.threshold}% に達したときに通知
                      </p>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={alert.isEnabled}
                        onChange={(e) =>
                          updateOverageAlert(alert.id, { isEnabled: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">有効</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        閾値: {alert.threshold}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={alert.threshold}
                        onChange={(e) =>
                          updateOverageAlert(alert.id, { threshold: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        通知先メール
                      </label>
                      <input
                        type="text"
                        value={alert.notifications.join(', ')}
                        onChange={(e) =>
                          updateOverageAlert(alert.id, {
                            notifications: e.target.value.split(',').map((email) => email.trim()),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="admin@example.com, billing@example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overage料金設定</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">デフォルト料金</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メッセージ (1,000件あたり)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="0.01"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ユーザー (1人あたり)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="5.00"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ストレージ (1GBあたり)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="2.00"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API呼び出し (1,000件あたり)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      defaultValue="0.005"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">課金オプション</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">即座に課金</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">月末まとめて課金</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">メール通知</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Slack通知</span>
                  </label>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猶予期間 (日)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    defaultValue="7"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    制限を超えてから課金開始までの猶予期間
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分析タブ */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">収益分析</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">月間基本料金</p>
                  <p className="text-2xl font-bold text-blue-900">$12,500</p>
                  <p className="text-sm text-blue-600">+8% vs 先月</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Overage収益</p>
                  <p className="text-2xl font-bold text-green-900">$3,240</p>
                  <p className="text-sm text-green-600">+25% vs 先月</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">総収益</p>
                  <p className="text-2xl font-bold text-purple-900">$15,740</p>
                  <p className="text-sm text-purple-600">+12% vs 先月</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">プラン別利用状況</h3>
              <div className="space-y-4">
                {billingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{plan.subscribedUsers} 契約者</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatPrice(
                          plan.pricing.basePrice * plan.subscribedUsers,
                          plan.pricing.currency
                        )}
                      </div>
                      <div className="text-sm text-gray-600">/月</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">使用量トレンド</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">メッセージ数</p>
                <p className="text-xl font-bold text-blue-900">2.1M</p>
                <p className="text-sm text-blue-600">+15% vs 先月</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">アクティブユーザー</p>
                <p className="text-xl font-bold text-green-900">14,256</p>
                <p className="text-sm text-green-600">+8% vs 先月</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">ストレージ使用量</p>
                <p className="text-xl font-bold text-yellow-900">847 GB</p>
                <p className="text-sm text-yellow-600">+22% vs 先月</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-600">API呼び出し</p>
                <p className="text-xl font-bold text-purple-900">8.9M</p>
                <p className="text-sm text-purple-600">+18% vs 先月</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プラン作成モーダル */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新しい課金プラン</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">プラン名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: Premium Plan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">プランタイプ</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">価格</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">通貨</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="USD">USD</option>
                    <option value="JPY">JPY</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg h-20"
                  placeholder="プランの説明"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createBillingPlan}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
                <button
                  onClick={() => setIsCreatingPlan(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPlansPage;
