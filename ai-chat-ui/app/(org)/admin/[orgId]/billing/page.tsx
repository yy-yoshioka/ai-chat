'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsageData {
  apiCalls: number;
  messages: number;
  mau: number;
  storage: number;
  period: string;
}

interface PlanInfo {
  name: string;
  price: number;
  features: string[];
  limits: {
    apiCalls: number;
    messages: number;
    users: number;
    storage: number;
  };
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export default function BillingPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const [activeTab, setActiveTab] = useState<'plan' | 'usage' | 'invoices'>('plan');
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, [orgId]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setCurrentPlan({
        name: 'Pro',
        price: 9800,
        features: [
          '月間10,000APIコール',
          '無制限チャットセッション',
          '最大100ユーザー',
          '10GB ストレージ',
          'メールサポート',
        ],
        limits: {
          apiCalls: 10000,
          messages: -1, // unlimited
          users: 100,
          storage: 10, // GB
        },
      });

      setUsage({
        apiCalls: 7543,
        messages: 15623,
        mau: 67,
        storage: 3.2,
        period: '2024年3月',
      });

      setInvoices([
        {
          id: 'inv-001',
          date: new Date('2024-03-01'),
          amount: 9800,
          status: 'paid',
          downloadUrl: '/invoices/inv-001.pdf',
        },
        {
          id: 'inv-002',
          date: new Date('2024-02-01'),
          amount: 9800,
          status: 'paid',
          downloadUrl: '/invoices/inv-002.pdf',
        },
        {
          id: 'inv-003',
          date: new Date('2024-01-01'),
          amount: 9800,
          status: 'paid',
          downloadUrl: '/invoices/inv-003.pdf',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">請求・利用状況</h1>
        <p className="text-gray-600">プランの管理と利用状況の確認</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'plan', label: 'プラン', icon: '💳' },
            { id: 'usage', label: '利用状況', icon: '📊' },
            { id: 'invoices', label: '請求書', icon: '📄' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plan' && currentPlan && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">現在のプラン</h3>
                <p className="text-gray-600">アクティブなプランと機能</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentPlan.price)}
                </div>
                <div className="text-sm text-gray-500">/月</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">{currentPlan.name}プラン</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">利用制限</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>APIコール</span>
                        <span>{currentPlan.limits.apiCalls.toLocaleString()}/月</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>ユーザー数</span>
                        <span>{currentPlan.limits.users}人</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>ストレージ</span>
                        <span>{currentPlan.limits.storage}GB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Stripeポータルで管理
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Upgrade Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">プランのアップグレード</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter',
                  price: 2980,
                  features: ['月間1,000APIコール', '最大10ユーザー', '1GB ストレージ'],
                },
                {
                  name: 'Pro',
                  price: 9800,
                  features: ['月間10,000APIコール', '最大100ユーザー', '10GB ストレージ'],
                  current: true,
                },
                {
                  name: 'Enterprise',
                  price: 29800,
                  features: ['無制限APIコール', '無制限ユーザー', '100GB ストレージ'],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-lg border p-6 ${
                    plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        現在のプラン
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <div className="mt-2 text-2xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-sm text-gray-500">/月</div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-6 w-full px-4 py-2 rounded-lg transition-colors ${
                      plan.current
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? '現在のプラン' : 'アップグレード'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage' && usage && currentPlan && (
        <div className="space-y-6">
          {/* Usage Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">利用状況概要</h3>
            <p className="text-gray-600 mb-6">{usage.period}の利用状況</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">APIコール</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {usage.apiCalls.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${getUsagePercentage(usage.apiCalls, currentPlan.limits.apiCalls)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentPlan.limits.apiCalls.toLocaleString()}まで
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">メッセージ数</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {usage.messages.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full" />
                </div>
                <div className="text-xs text-gray-500 mt-1">無制限</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">アクティブユーザー</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.mau}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${getUsagePercentage(usage.mau, currentPlan.limits.users)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{currentPlan.limits.users}人まで</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">ストレージ</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{usage.storage}GB</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${getUsagePercentage(usage.storage, currentPlan.limits.storage)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{currentPlan.limits.storage}GBまで</div>
              </div>
            </div>
          </div>

          {/* Usage Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">利用推移</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>利用推移グラフ</p>
                <p className="text-sm">（実装予定）</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Invoices List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">請求書一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.date.toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {invoice.status === 'paid'
                            ? '支払済み'
                            : invoice.status === 'pending'
                              ? '保留中'
                              : '失敗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {invoice.downloadUrl && (
                          <a
                            href={invoice.downloadUrl}
                            className="text-blue-600 hover:text-blue-900"
                            download
                          >
                            ダウンロード
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
