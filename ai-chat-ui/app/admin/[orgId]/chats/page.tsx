'use client';

import { useState, useEffect } from 'react';

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  status: 'active' | 'completed' | 'error';
  satisfaction?: number;
  topic: string;
  lastMessage: string;
}

interface ChatMetrics {
  totalChats: number;
  activeChats: number;
  avgSatisfaction: number;
  avgResponseTime: number;
  topTopics: { topic: string; count: number }[];
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sample data - replace with actual API call
  useEffect(() => {
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
      {
        id: '4',
        userId: '4',
        userName: '鈴木三郎',
        userEmail: 'suzuki@example.com',
        startTime: '2024-01-20T08:45:00Z',
        endTime: '2024-01-20T09:00:00Z',
        messageCount: 15,
        status: 'error',
        topic: 'アカウント問題',
        lastMessage: 'エラーが発生しました。',
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

    setTimeout(() => {
      setChats(sampleChats);
      setMetrics(sampleMetrics);
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  const filteredChats = chats.filter((chat) => {
    return statusFilter === 'all' || chat.status === statusFilter;
  });

  const getStatusBadge = (status: ChatSession['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800',
    };
    const labels = {
      active: '進行中',
      completed: '完了',
      error: 'エラー',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getSatisfactionStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">未評価</span>;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '進行中';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総チャット数</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalChats}</p>
                <p className="text-xs text-gray-500">今日</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🟢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブチャット</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeChats}</p>
                <p className="text-xs text-gray-500">現在進行中</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均満足度</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgSatisfaction}</p>
                <p className="text-xs text-gray-500">5点満点</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}秒</p>
                <p className="text-xs text-gray-500">初回応答</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">進行中</option>
                <option value="completed">完了</option>
                <option value="error">エラー</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Topics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">人気のトピック</h3>
          {metrics && (
            <div className="space-y-3">
              {metrics.topTopics.map((item, index) => (
                <div key={item.topic} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-900 ml-2">{item.topic}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.count / metrics.topTopics[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            チャットセッション ({filteredChats.length}件)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  トピック
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メッセージ数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  満足度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChats.map((chat) => (
                <tr key={chat.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{chat.userName}</div>
                      <div className="text-sm text-gray-500">{chat.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chat.topic}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {chat.lastMessage}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(chat.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chat.messageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(chat.startTime).toLocaleTimeString('ja-JP')}</div>
                    <div className="text-xs">{formatDuration(chat.startTime, chat.endTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSatisfactionStars(chat.satisfaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">詳細</button>
                    {chat.status === 'active' && (
                      <button className="text-green-600 hover:text-green-900">参加</button>
                    )}
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
