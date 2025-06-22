'use client';

import { useState } from 'react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  assignee: string;
  impact: string;
}

export default function IncidentsPage() {
  const [incidents] = useState<Incident[]>([
    {
      id: 'INC-001',
      title: 'データベース接続エラー',
      description: 'メインデータベースへの接続が断続的に失敗している',
      severity: 'critical',
      status: 'investigating',
      affectedServices: ['API', 'Web App', 'Chat Service'],
      createdAt: '2024-01-20T09:30:00Z',
      assignee: 'システム管理者',
      impact: 'ユーザーのチャット機能が利用できない状態',
    },
    {
      id: 'INC-002',
      title: 'レスポンス時間の遅延',
      description: 'API のレスポンス時間が通常の3倍に増加',
      severity: 'high',
      status: 'open',
      affectedServices: ['API'],
      createdAt: '2024-01-20T08:15:00Z',
      assignee: 'DevOpsチーム',
      impact: 'ユーザーエクスペリエンスの低下',
    },
    {
      id: 'INC-003',
      title: 'メール配信の遅延',
      description: 'システムからの通知メールが配信されない',
      severity: 'medium',
      status: 'resolved',
      affectedServices: ['Email Service'],
      createdAt: '2024-01-19T16:45:00Z',
      resolvedAt: '2024-01-19T18:30:00Z',
      assignee: 'インフラチーム',
      impact: 'ユーザーへの通知が遅延',
    },
    {
      id: 'INC-004',
      title: 'ログ収集システムの障害',
      description: 'ログ収集が停止している',
      severity: 'low',
      status: 'closed',
      affectedServices: ['Logging'],
      createdAt: '2024-01-19T14:20:00Z',
      resolvedAt: '2024-01-19T15:00:00Z',
      assignee: 'モニタリングチーム',
      impact: '運用監視への影響のみ',
    },
  ]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
            🚨 緊急
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
            ⚠️ 高
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
            📊 中
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
            ℹ️ 低
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
            {severity}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">未対応</span>
        );
      case 'investigating':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            調査中
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            解決済み
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">クローズ</span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
        );
    }
  };

  const calculateDuration = (createdAt: string, resolvedAt?: string) => {
    const start = new Date(createdAt);
    const end = resolvedAt ? new Date(resolvedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}時間${diffMinutes}分`;
    }
    return `${diffMinutes}分`;
  };

  return (
    <div className="space-y-6">
      {/* Incident Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-red-900">
                {
                  incidents.filter((i) => i.status === 'open' || i.status === 'investigating')
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">緊急/高</p>
              <p className="text-2xl font-bold text-orange-900">
                {incidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今日解決</p>
              <p className="text-2xl font-bold text-green-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均解決時間</p>
              <p className="text-2xl font-bold text-blue-900">2.5h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Incident Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">インシデント一覧</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
          + 新規インシデント作成
        </button>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  インシデント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  重要度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  影響サービス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  経過時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                      <div className="text-sm text-gray-500">#{incident.id}</div>
                      <div className="text-xs text-gray-400 mt-1">{incident.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(incident.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(incident.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {incident.affectedServices.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {incident.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateDuration(incident.createdAt, incident.resolvedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">詳細</button>
                    <button className="text-green-600 hover:text-green-900">更新</button>
                    {incident.status !== 'closed' && (
                      <button className="text-gray-600 hover:text-gray-900">クローズ</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">最近の更新</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 mt-1">🚨</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  INC-001: データベース接続エラーの調査を開始
                </p>
                <p className="text-xs text-gray-500">10:30 - システム管理者</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 mt-1">✅</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  INC-003: メール配信の問題が解決されました
                </p>
                <p className="text-xs text-gray-500">昨日 18:30 - インフラチーム</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 mt-1">📊</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  INC-002: API パフォーマンス改善作業を開始
                </p>
                <p className="text-xs text-gray-500">08:15 - DevOpsチーム</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
