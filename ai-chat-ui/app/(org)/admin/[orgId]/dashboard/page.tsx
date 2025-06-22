'use client';

import { useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  activeChats: number;
  faqCount: number;
  systemHealth: string;
  todayMessages: number;
  responseTime: number;
}

export default function AdminDashboard() {
  const [stats] = useState<DashboardStats>({
    totalUsers: 1250,
    activeChats: 45,
    faqCount: 28,
    systemHealth: 'healthy',
    todayMessages: 892,
    responseTime: 1.2,
  });

  const [recentActivity] = useState([
    { id: 1, action: 'ユーザー登録', user: '田中太郎', time: '2分前' },
    { id: 2, action: 'FAQ作成', user: '管理者', time: '15分前' },
    { id: 3, action: 'チャット開始', user: '山田花子', time: '23分前' },
    { id: 4, action: 'システム更新', user: 'システム', time: '1時間前' },
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブチャット</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">❓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">FAQ数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.faqCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均応答時間</p>
              <p className="text-2xl font-bold text-gray-900">{stats.responseTime}秒</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">システム状態</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API応答時間</span>
              <span className="text-sm font-medium text-green-600">良好</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">データベース接続</span>
              <span className="text-sm font-medium text-green-600">正常</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">メモリ使用量</span>
              <span className="text-sm font-medium text-yellow-600">注意</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近のアクティビティ</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> - {activity.user}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium">新しいFAQ追加</p>
                <p className="text-sm text-gray-600">よくある質問を追加</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium">レポート生成</p>
                <p className="text-sm text-gray-600">詳細な分析レポート</p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🛠️</span>
              <div>
                <p className="font-medium">システム設定</p>
                <p className="text-sm text-gray-600">設定の変更</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
