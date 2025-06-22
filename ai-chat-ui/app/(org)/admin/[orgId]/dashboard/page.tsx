'use client';

import React, { useState, useEffect } from 'react';

interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'activity' | 'health';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data?: any;
  config?: any;
}

interface DashboardStats {
  totalUsers: number;
  activeChats: number;
  faqCount: number;
  systemHealth: string;
  todayMessages: number;
  responseTime: number;
  apiCalls: number;
  tokenUsage: number;
  csat: number;
}

export default function AdminDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        activeChats: 45,
        faqCount: 28,
        systemHealth: 'healthy',
        todayMessages: 892,
        responseTime: 1.2,
        apiCalls: 15420,
        tokenUsage: 85.7,
        csat: 4.3,
      };

      const mockWidgets: DashboardWidget[] = [
        {
          id: 'users-stat',
          type: 'stat',
          title: '総ユーザー数',
          position: { x: 0, y: 0, w: 3, h: 2 },
          data: { value: mockStats.totalUsers, icon: '👥', color: 'blue' },
        },
        {
          id: 'chats-stat',
          type: 'stat',
          title: 'アクティブチャット',
          position: { x: 3, y: 0, w: 3, h: 2 },
          data: { value: mockStats.activeChats, icon: '💬', color: 'green' },
        },
        {
          id: 'faq-stat',
          type: 'stat',
          title: 'FAQ数',
          position: { x: 6, y: 0, w: 3, h: 2 },
          data: { value: mockStats.faqCount, icon: '❓', color: 'yellow' },
        },
        {
          id: 'response-stat',
          type: 'stat',
          title: '平均応答時間',
          position: { x: 9, y: 0, w: 3, h: 2 },
          data: { value: `${mockStats.responseTime}秒`, icon: '⚡', color: 'purple' },
        },
        {
          id: 'system-health',
          type: 'health',
          title: 'システム状態',
          position: { x: 0, y: 2, w: 6, h: 4 },
          data: {
            items: [
              { name: 'API応答時間', status: 'good', percentage: 85 },
              { name: 'データベース接続', status: 'good', percentage: 100 },
              { name: 'メモリ使用量', status: 'warning', percentage: 72 },
            ],
          },
        },
        {
          id: 'recent-activity',
          type: 'activity',
          title: '最近のアクティビティ',
          position: { x: 6, y: 2, w: 6, h: 4 },
          data: {
            activities: [
              { id: 1, action: 'ユーザー登録', user: '田中太郎', time: '2分前' },
              { id: 2, action: 'FAQ作成', user: '管理者', time: '15分前' },
              { id: 3, action: 'チャット開始', user: '山田花子', time: '23分前' },
              { id: 4, action: 'システム更新', user: 'システム', time: '1時間前' },
            ],
          },
        },
      ];

      setStats(mockStats);
      setWidgets(mockWidgets);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = (type: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: getWidgetTitle(type),
      position: { x: 0, y: 6, w: 4, h: 3 },
      data: getWidgetData(type),
    };

    setWidgets([...widgets, newWidget]);
    setShowAddModal(false);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const getWidgetTitle = (type: string): string => {
    switch (type) {
      case 'stat':
        return '新しい統計';
      case 'chart':
        return '新しいチャート';
      case 'activity':
        return '新しいアクティビティ';
      case 'health':
        return '新しいヘルス';
      default:
        return '新しいウィジェット';
    }
  };

  const getWidgetData = (type: string): any => {
    switch (type) {
      case 'stat':
        return { value: stats?.apiCalls || 0, icon: '🔥', color: 'red' };
      case 'chart':
        return { chartType: 'line', data: [] };
      case 'activity':
        return { activities: [] };
      case 'health':
        return { items: [] };
      default:
        return {};
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'stat':
        return <StatWidget widget={widget} onRemove={removeWidget} />;
      case 'health':
        return <HealthWidget widget={widget} onRemove={removeWidget} />;
      case 'activity':
        return <ActivityWidget widget={widget} onRemove={removeWidget} />;
      case 'chart':
        return <ChartWidget widget={widget} onRemove={removeWidget} />;
      default:
        return <div>Unknown widget type</div>;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">システム全体の状況を監視</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ウィジェット追加
        </button>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
            style={{
              gridColumn: `span ${widget.position.w}`,
              minHeight: `${widget.position.h * 100}px`,
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ウィジェットを追加</h3>
            <div className="space-y-3">
              {[
                { type: 'stat', label: '統計ウィジェット', icon: '📊' },
                { type: 'chart', label: 'チャートウィジェット', icon: '📈' },
                { type: 'activity', label: 'アクティビティウィジェット', icon: '🔔' },
                { type: 'health', label: 'ヘルスウィジェット', icon: '💚' },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => addWidget(option.type)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Widget Components
function StatWidget({
  widget,
  onRemove,
}: {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}) {
  const { data } = widget;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <div className="flex items-center">
        <div
          className={`p-2 rounded-lg ${colorClasses[data.color as keyof typeof colorClasses] || colorClasses.blue}`}
        >
          <span className="text-2xl">{data.icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{widget.title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </p>
        </div>
      </div>
    </div>
  );
}

function HealthWidget({
  widget,
  onRemove,
}: {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}) {
  const { data } = widget;

  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="space-y-4">
        {data.items?.map((item: any, index: number) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.name}</span>
              <span
                className={`text-sm font-medium ${
                  item.status === 'good'
                    ? 'text-green-600'
                    : item.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {item.status === 'good' ? '良好' : item.status === 'warning' ? '注意' : 'エラー'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  item.status === 'good'
                    ? 'bg-green-500'
                    : item.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityWidget({
  widget,
  onRemove,
}: {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}) {
  const { data } = widget;

  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="space-y-4">
        {data.activities?.map((activity: any) => (
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
  );
}

function ChartWidget({
  widget,
  onRemove,
}: {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-2">📈</div>
          <p>チャートデータ</p>
          <p className="text-sm">（実装予定）</p>
        </div>
      </div>
    </div>
  );
}
