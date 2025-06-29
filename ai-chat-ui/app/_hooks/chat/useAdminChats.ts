import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ChatSession, ChatMetrics } from '@/_schemas/chat';

const sampleChats: ChatSession[] = [
  {
    id: '1',
    userId: '1',
    userName: '田中太郎',
    userEmail: 'tanaka@example.com',
    startTime: '2024-01-20T10:30:00Z',
    endTime: '2024-01-20T10:45:00Z',
    messageCount: 12,
    status: 'completed',
    satisfaction: 5,
    topic: '料金プラン',
    lastMessage: 'ありがとうございました。',
  },
  {
    id: '2',
    userId: '2',
    userName: '山田花子',
    userEmail: 'yamada@example.com',
    startTime: '2024-01-20T11:00:00Z',
    messageCount: 8,
    status: 'active',
    topic: 'テクニカルサポート',
    lastMessage: 'ログインができません。',
  },
  {
    id: '3',
    userId: '3',
    userName: '佐藤次郎',
    userEmail: 'sato@example.com',
    startTime: '2024-01-20T09:15:00Z',
    endTime: '2024-01-20T09:30:00Z',
    messageCount: 6,
    status: 'completed',
    satisfaction: 4,
    topic: '機能について',
    lastMessage: '理解できました。',
  },
];

const sampleMetrics: ChatMetrics = {
  totalChats: 156,
  activeChats: 8,
  avgSatisfaction: 4.2,
  avgResponseTime: 2.3,
  topTopics: [
    { topic: '料金プラン', count: 45 },
    { topic: 'テクニカルサポート', count: 38 },
    { topic: '機能について', count: 32 },
    { topic: 'アカウント問題', count: 25 },
    { topic: 'その他', count: 16 },
  ],
};

export function useAdminChats(orgId: string) {
  const [activeTab, setActiveTab] = useState<'chat' | 'monitoring'>('chat');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['adminChats', orgId, selectedDate],
    queryFn: async () => {
      // TODO: Replace with actual API call
      console.log('Loading data for organization:', orgId);
      return new Promise<ChatSession[]>((resolve) => {
        setTimeout(() => resolve(sampleChats), 1000);
      });
    },
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['chatMetrics', orgId, selectedDate],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return new Promise<ChatMetrics>((resolve) => {
        setTimeout(() => resolve(sampleMetrics), 1000);
      });
    },
  });

  const filteredChats = (chatsData || []).filter((chat) => {
    return statusFilter === 'all' || chat.status === statusFilter;
  });

  return {
    activeTab,
    setActiveTab,
    chats: chatsData || [],
    metrics: metricsData || null,
    loading: chatsLoading || metricsLoading,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    filteredChats,
  };
}