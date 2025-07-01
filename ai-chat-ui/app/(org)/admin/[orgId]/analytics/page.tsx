'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ConversationFlowChart } from '@/app/_components/feature/analytics/ConversationFlowChart';
import { UnresolvedQuestions } from '@/app/_components/feature/analytics/UnresolvedQuestions';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { useWidgets } from '@/app/_hooks/widgets/useWidgets';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';

export default function AnalyticsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { widgets } = useWidgets(orgId);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'flow' | 'unresolved'>('flow');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="高度な分析" description="会話パターンと改善ポイントの分析" />

      <div className="flex items-center gap-4 mt-6 mb-4">
        <select
          value={selectedWidgetId}
          onChange={(e) => setSelectedWidgetId(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ウィジェットを選択</option>
          {widgets.map((widget) => (
            <option key={widget.id} value={widget.id}>
              {widget.name}
            </option>
          ))}
        </select>

        <select
          value="month"
          onChange={(e) => {
            const now = new Date();
            switch (e.target.value) {
              case 'today':
                setDateRange({ start: startOfDay(now), end: endOfDay(now) });
                break;
              case 'week':
                setDateRange({ start: subDays(now, 7), end: now });
                break;
              case 'month':
                setDateRange({ start: startOfMonth(now), end: endOfMonth(now) });
                break;
              case '30days':
                setDateRange({ start: subDays(now, 30), end: now });
                break;
            }
          }}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">今日</option>
          <option value="week">過去7日間</option>
          <option value="month">今月</option>
          <option value="30days">過去30日間</option>
        </select>
      </div>

      {selectedWidgetId && (
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('flow')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'flow'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                会話フロー
              </button>
              <button
                onClick={() => setActiveTab('unresolved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'unresolved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                未解決質問
              </button>
            </nav>
          </div>

          <div className="mt-4">
            {activeTab === 'flow' && (
              <ConversationFlowChart widgetId={selectedWidgetId} dateRange={dateRange} />
            )}
            {activeTab === 'unresolved' && <UnresolvedQuestions widgetId={selectedWidgetId} />}
          </div>
        </div>
      )}
    </div>
  );
}
