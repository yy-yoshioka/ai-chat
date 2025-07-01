import React from 'react';
import type { ChatMetrics } from '@/app/_schemas/chat';

interface MetricsCardsProps {
  metrics: ChatMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: '総チャット数',
      value: metrics.totalChats,
      subtitle: '今日',
      icon: '💬',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'アクティブチャット',
      value: metrics.activeChats,
      subtitle: '現在進行中',
      icon: '🟢',
      bgColor: 'bg-green-100',
    },
    {
      title: '平均満足度',
      value: metrics.avgSatisfaction,
      subtitle: '5点満点',
      icon: '⭐',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '平均応答時間',
      value: `${metrics.avgResponseTime}秒`,
      subtitle: '初回応答',
      icon: '⚡',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 ${card.bgColor} rounded-lg`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
