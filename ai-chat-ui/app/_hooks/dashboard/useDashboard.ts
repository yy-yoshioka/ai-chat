import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DashboardWidget, DashboardStats } from '@/app/_schemas/dashboard';

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

export function useDashboard(orgId: string) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', orgId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockStats;
    },
  });

  useEffect(() => {
    if (stats) {
      setWidgets(mockWidgets);
    }
  }, [stats]);

  const addWidget = (type: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: type as DashboardWidget['type'],
      title: getWidgetTitle(type),
      position: { x: 0, y: 6, w: 4, h: 3 },
      data: getWidgetData(type, stats),
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

  const getWidgetData = (type: string, currentStats: DashboardStats | undefined) => {
    switch (type) {
      case 'stat':
        return { value: currentStats?.apiCalls || 0, icon: '🔥', color: 'red' };
      case 'chart':
        return { chartType: 'line', data: [] };
      case 'activity':
        return { activities: [] };
      case 'health':
        return { items: [] };
      default:
        return { value: 0, icon: '📊', color: 'blue' };
    }
  };

  return {
    widgets,
    stats,
    isLoading,
    showAddModal,
    setShowAddModal,
    addWidget,
    removeWidget,
  };
}
