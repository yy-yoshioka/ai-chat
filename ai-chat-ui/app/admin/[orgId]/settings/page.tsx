'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || 'default';

  const settingsCategories = [
    {
      title: 'ウィジェット管理',
      description: 'チャットウィジェットの作成・管理・カスタマイズ',
      icon: '🔧',
      href: `/admin/${orgId}/settings/widgets`,
      badge: '3 active',
    },
    {
      title: '組織設定',
      description: '組織の基本情報とメンバー管理',
      icon: '🏢',
      href: `/admin/${orgId}/settings/organization`,
      badge: null,
    },
    {
      title: 'API設定',
      description: 'API キーとWebhookの設定',
      icon: '🔑',
      href: `/admin/${orgId}/settings/api`,
      badge: null,
    },
    {
      title: '通知設定',
      description: 'メールとSlack通知の設定',
      icon: '🔔',
      href: `/admin/${orgId}/settings/notifications`,
      badge: null,
    },
    {
      title: 'セキュリティ',
      description: 'アクセス制御とセキュリティ設定',
      icon: '🔒',
      href: `/admin/${orgId}/settings/security`,
      badge: null,
    },
    {
      title: 'データ管理',
      description: 'データエクスポートと削除',
      icon: '💾',
      href: `/admin/${orgId}/settings/data`,
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-1">組織の設定とカスタマイズを管理</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 block"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
              </div>
              {category.badge && (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {category.badge}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>設定を開く</span>
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">🆕</div>
            <div className="text-sm font-medium text-gray-900">新しいウィジェット作成</div>
            <div className="text-xs text-gray-600">チャットウィジェットを追加</div>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-900">使用量レポート</div>
            <div className="text-xs text-gray-600">月次レポートを確認</div>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm font-medium text-gray-900">APIキー再生成</div>
            <div className="text-xs text-gray-600">セキュリティ向上</div>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💾</div>
            <div className="text-sm font-medium text-gray-900">データエクスポート</div>
            <div className="text-xs text-gray-600">チャットデータをダウンロード</div>
          </button>
        </div>
      </div>

      {/* Organization Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">組織の概要</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">アクティブウィジェット</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">メンバー数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Pro</div>
            <div className="text-sm text-gray-600">現在のプラン</div>
          </div>
        </div>
      </div>
    </div>
  );
}
