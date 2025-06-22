import { useState, useEffect } from 'react';
import { BillingKPI } from '@/types/billing';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

function KPICard({ title, value, subtitle, trend, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

          {trend && (
            <div className="flex items-center mt-2">
              <div
                className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
              >
                {trend.isPositive ? (
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 7l-9.2 9.2M7 7v10h10"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium">
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
              <span className="text-sm text-gray-500 ml-2">{trend.period}</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

interface BillingKPIDashboardProps {
  organizationId?: string;
  refreshInterval?: number;
}

export default function BillingKPIDashboard({
  organizationId,
  refreshInterval = 300000, // 5分間隔
}: BillingKPIDashboardProps) {
  const [kpiData, setKpiData] = useState<BillingKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchKPIData();

    // 定期更新
    const interval = setInterval(fetchKPIData, refreshInterval);
    return () => clearInterval(interval);
  }, [organizationId, refreshInterval]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際の実装では以下のAPIを呼び出します:
      // const response = await fetch(`/api/billing/kpi${organizationId ? `?orgId=${organizationId}` : ''}`);
      // const data = await response.json();

      // モック実装
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockKPIData: BillingKPI = {
        trialToePaidConversionRate: 23.5,
        monthlyChurnRate: 2.8,
        averageLTV: 45600,
        totalActiveSubscriptions: 128,
        totalTrialUsers: 34,
        monthlyRecurringRevenue: 1245000,
      };

      setKpiData(mockKPIData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch KPI data:', err);
      setError('KPIデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `¥${Math.floor(amount).toLocaleString()}`;
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(1)}%`;
  };

  if (loading && !kpiData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">KPIデータを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchKPIData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">課金KPI ダッシュボード</h2>
          <p className="text-sm text-gray-500 mt-1">
            最終更新: {lastUpdated.toLocaleString('ja-JP')}
          </p>
        </div>

        <button
          onClick={fetchKPIData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              更新中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              更新
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trial to Paid Conversion Rate */}
          <KPICard
            title="Trial→Paid 転換率"
            value={formatPercentage(kpiData.trialToePaidConversionRate)}
            subtitle="過去30日間"
            trend={{
              value: 5.2,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="green"
          />

          {/* Monthly Churn Rate */}
          <KPICard
            title="月次チャーン率"
            value={formatPercentage(kpiData.monthlyChurnRate)}
            subtitle="解約率"
            trend={{
              value: -1.2,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            }
            color="red"
          />

          {/* Average LTV */}
          <KPICard
            title="平均LTV"
            value={formatCurrency(kpiData.averageLTV)}
            subtitle="顧客生涯価値"
            trend={{
              value: 8.7,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
            color="purple"
          />

          {/* Total Active Subscriptions */}
          <KPICard
            title="アクティブ契約数"
            value={kpiData.totalActiveSubscriptions.toLocaleString()}
            subtitle="有効なサブスクリプション"
            trend={{
              value: 12.3,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            color="blue"
          />

          {/* Total Trial Users */}
          <KPICard
            title="トライアルユーザー"
            value={kpiData.totalTrialUsers.toLocaleString()}
            subtitle="無料試用中"
            trend={{
              value: 15.8,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="orange"
          />

          {/* Monthly Recurring Revenue */}
          <KPICard
            title="MRR"
            value={formatCurrency(kpiData.monthlyRecurringRevenue)}
            subtitle="月次経常収益"
            trend={{
              value: 18.4,
              isPositive: true,
              period: '先月比',
            }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="green"
          />
        </div>
      )}

      {/* Additional Insights */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 主要インサイト</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Trial to Paid転換率が業界平均（20%）を上回っています</p>
          <p>• チャーン率が低く、顧客満足度の高いサービスを提供できています</p>
          <p>• MRRが順調に成長しており、持続可能なビジネスモデルを構築中です</p>
          <p>• 新規トライアルユーザーが増加傾向にあり、認知度向上の効果が見られます</p>
        </div>
      </div>
    </div>
  );
}
