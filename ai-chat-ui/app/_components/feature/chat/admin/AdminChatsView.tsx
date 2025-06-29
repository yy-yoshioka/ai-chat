import React from 'react';
import type { ChatSession, ChatMetrics } from '@/_schemas/chat';
import ChatContainer from '@/_components/feature/chat/ChatContainer';
import { MetricsCards } from './MetricsCards';
import { ChatFilters } from './ChatFilters';
import { TopTopics } from './TopTopics';
import { ChatSessionsTable } from './ChatSessionsTable';

interface AdminChatsViewProps {
  activeTab: 'chat' | 'monitoring';
  onTabChange: (tab: 'chat' | 'monitoring') => void;
  metrics: ChatMetrics | null;
  loading: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  filteredChats: ChatSession[];
}

export function AdminChatsView({
  activeTab,
  onTabChange,
  metrics,
  loading,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusChange,
  filteredChats,
}: AdminChatsViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => onTabChange('chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💬 チャット
          </button>
          <button
            onClick={() => onTabChange('monitoring')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 監視・分析
          </button>
        </nav>
      </div>

      {activeTab === 'chat' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">チャットインターフェース</h2>
          <div className="h-96 border rounded-lg overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {metrics && <MetricsCards metrics={metrics} />}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChatFilters
                  selectedDate={selectedDate}
                  statusFilter={statusFilter}
                  onDateChange={onDateChange}
                  onStatusChange={onStatusChange}
                />
                {metrics && <TopTopics metrics={metrics} />}
              </div>

              <ChatSessionsTable sessions={filteredChats} />
            </>
          )}
        </>
      )}
    </div>
  );
}
