'use client';

import { useState } from 'react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export default function MetricsPage() {
  const [metrics] = useState<SystemMetric[]>([
    {
      id: 'cpu',
      name: 'CPU使用率',
      value: 45.2,
      unit: '%',
      change: +2.3,
      status: 'good',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'memory',
      name: 'メモリ使用率',
      value: 67.8,
      unit: '%',
      change: +5.1,
      status: 'warning',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'disk',
      name: 'ディスク使用率',
      value: 23.4,
      unit: '%',
      change: +1.2,
      status: 'good',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'network',
      name: 'ネットワーク転送量',
      value: 1.2,
      unit: 'GB/s',
      change: -0.8,
      status: 'good',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'response_time',
      name: '平均レスポンス時間',
      value: 245,
      unit: 'ms',
      change: +15.2,
      status: 'warning',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'error_rate',
      name: 'エラー率',
      value: 0.02,
      unit: '%',
      change: -0.01,
      status: 'good',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'active_users',
      name: 'アクティブユーザー数',
      value: 1234,
      unit: 'users',
      change: +8.5,
      status: 'good',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
    {
      id: 'database_connections',
      name: 'データベース接続数',
      value: 89,
      unit: 'connections',
      change: +12.3,
      status: 'critical',
      lastUpdated: '2024-01-20T10:30:00Z',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">正常</p>
              <p className="text-2xl font-bold text-green-900">
                {metrics.filter((m) => m.status === 'good').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">警告</p>
              <p className="text-2xl font-bold text-yellow-900">
                {metrics.filter((m) => m.status === 'warning').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">緊急</p>
              <p className="text-2xl font-bold text-red-900">
                {metrics.filter((m) => m.status === 'critical').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}
              >
                {getStatusIcon(metric.status)} {metric.status.toUpperCase()}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {metric.value.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${getChangeColor(metric.change)}`}>
                {metric.change > 0 ? '+' : ''}
                {metric.change.toFixed(1)}%
              </span>
              <span className="text-gray-500">
                {new Date(metric.lastUpdated).toLocaleTimeString('ja-JP')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">システムアクティビティ</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600">✅</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">システム正常稼働中</p>
                <p className="text-xs text-gray-500">2024-01-20 10:30:00</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">メモリ使用率が閾値を超過</p>
                <p className="text-xs text-gray-500">2024-01-20 10:25:00</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <span className="text-red-600">🚨</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  データベース接続数が上限に近づいています
                </p>
                <p className="text-xs text-gray-500">2024-01-20 10:20:00</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600">📊</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">定期メンテナンス完了</p>
                <p className="text-xs text-gray-500">2024-01-20 10:15:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
