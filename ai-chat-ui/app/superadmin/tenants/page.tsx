'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  messageCount: number;
  storageUsed: number; // GB
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  trialEndDate?: string;
}

export default function TenantsPage() {
  const [tenants] = useState<Tenant[]>([
    {
      id: 'default',
      name: 'Default Organization',
      plan: 'Pro',
      userCount: 5,
      messageCount: 1250,
      storageUsed: 2.3,
      createdAt: '2024-01-01',
      lastActive: '2024-01-20',
      status: 'trial',
      trialEndDate: '2024-02-01',
    },
    {
      id: 'acme-corp',
      name: 'Acme Corporation',
      plan: 'Enterprise',
      userCount: 25,
      messageCount: 8540,
      storageUsed: 15.7,
      createdAt: '2023-12-01',
      lastActive: '2024-01-20',
      status: 'active',
    },
    {
      id: 'startup-inc',
      name: 'Startup Inc.',
      plan: 'Free',
      userCount: 3,
      messageCount: 245,
      storageUsed: 0.8,
      createdAt: '2024-01-15',
      lastActive: '2024-01-19',
      status: 'active',
    },
    {
      id: 'old-company',
      name: 'Old Company Ltd.',
      plan: 'Pro',
      userCount: 8,
      messageCount: 3250,
      storageUsed: 5.2,
      createdAt: '2023-11-01',
      lastActive: '2023-12-15',
      status: 'inactive',
    },
  ]);

  const getStatusBadge = (status: string, trialEndDate?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            アクティブ
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            トライアル{' '}
            {trialEndDate && `(${new Date(trialEndDate).toLocaleDateString('ja-JP')}まで)`}
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">停止中</span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            非アクティブ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
        );
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      Free: 'bg-gray-100 text-gray-800',
      Pro: 'bg-blue-100 text-blue-800',
      Enterprise: 'bg-purple-100 text-purple-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
      >
        {plan}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総テナント数</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter((t) => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">トライアル</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter((t) => t.status === 'trial').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.reduce((sum, t) => sum + t.userCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">テナント一覧</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  組織名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プラン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メッセージ数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ストレージ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終アクティブ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPlanBadge(tenant.plan)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tenant.status, tenant.trialEndDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.userCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.messageCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.storageUsed.toFixed(1)} GB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.lastActive).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/${tenant.id}/dashboard`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      管理
                    </Link>
                    <button className="text-gray-600 hover:text-gray-900">編集</button>
                    <button className="text-red-600 hover:text-red-900">停止</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
