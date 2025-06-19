import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  userId?: string;
  sessionId?: string;
  details?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: 'all',
    source: 'all',
    search: '',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sample log data
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sampleLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-20T10:30:15Z',
          level: 'error',
          source: 'chat-service',
          message: 'AIサービスへの接続がタイムアウトしました',
          userId: 'user_123',
          sessionId: 'session_456',
          details: 'Connection timeout after 30 seconds',
        },
        {
          id: '2',
          timestamp: '2024-01-20T10:29:45Z',
          level: 'warn',
          source: 'auth-service',
          message: 'ログイン試行回数が上限に近づいています',
          userId: 'user_789',
          details: 'User has 4 failed login attempts',
        },
        {
          id: '3',
          timestamp: '2024-01-20T10:29:20Z',
          level: 'info',
          source: 'user-service',
          message: '新規ユーザーが登録されました',
          userId: 'user_101',
          details: 'Email: newuser@example.com',
        },
        {
          id: '4',
          timestamp: '2024-01-20T10:28:55Z',
          level: 'debug',
          source: 'api-gateway',
          message: 'API レスポンス時間: 245ms',
          details: 'GET /api/chats/123',
        },
        {
          id: '5',
          timestamp: '2024-01-20T10:28:30Z',
          level: 'error',
          source: 'database',
          message: 'データベース接続プールが枯渇しました',
          details: 'Connection pool exhausted, retrying...',
        },
        {
          id: '6',
          timestamp: '2024-01-20T10:28:10Z',
          level: 'info',
          source: 'chat-service',
          message: 'チャットセッションが開始されました',
          userId: 'user_456',
          sessionId: 'session_789',
          details: 'Topic: テクニカルサポート',
        },
      ];

      setLogs(sampleLogs);
      setLoading(false);
    };

    fetchLogs();
  }, [filters.startDate, filters.endDate]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        // In real app, this would fetch new logs
        console.log('Auto refreshing logs...');
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filters.level === 'all' || log.level === filters.level;
    const matchesSource = filters.source === 'all' || log.source === filters.source;
    const matchesSearch =
      !filters.search ||
      log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.details?.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.userId?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesLevel && matchesSource && matchesSearch;
  });

  const getLogLevelBadge = (level: LogEntry['level']) => {
    const styles = {
      error: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      error: 'エラー',
      warn: '警告',
      info: '情報',
      debug: 'デバッグ',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const getLogIcon = (level: LogEntry['level']) => {
    const icons = {
      error: '🔴',
      warn: '🟡',
      info: '🔵',
      debug: '⚪',
    };
    return icons[level];
  };

  const logLevelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const exportLogs = () => {
    const logText = filteredLogs
      .map((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.source}: ${log.message}`)
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Log Level Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🔴</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">エラー</p>
                <p className="text-2xl font-bold text-gray-900">{logLevelCounts.error || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🟡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">警告</p>
                <p className="text-2xl font-bold text-gray-900">{logLevelCounts.warn || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">情報</p>
                <p className="text-2xl font-bold text-gray-900">{logLevelCounts.info || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">⚪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">デバッグ</p>
                <p className="text-2xl font-bold text-gray-900">{logLevelCounts.debug || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ログレベル</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="error">エラー</option>
                  <option value="warn">警告</option>
                  <option value="info">情報</option>
                  <option value="debug">デバッグ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ソース</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="chat-service">チャットサービス</option>
                  <option value="auth-service">認証サービス</option>
                  <option value="user-service">ユーザーサービス</option>
                  <option value="api-gateway">API Gateway</option>
                  <option value="database">データベース</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                <input
                  type="text"
                  placeholder="メッセージで検索..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-900">自動更新</label>
              </div>
              <button
                onClick={exportLogs}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ログエントリ ({filteredLogs.length}件)
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                フィルター条件に一致するログがありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getLogIcon(log.level)}</span>
                          {getLogLevelBadge(log.level)}
                          <span className="text-sm font-medium text-gray-900">{log.source}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2">{log.message}</p>
                        {log.details && (
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono">
                            {log.details}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {log.userId && <span>ユーザー: {log.userId}</span>}
                          {log.sessionId && <span>セッション: {log.sessionId}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">リアルタイム監視</h3>
              <p className="text-sm text-gray-600">システムの現在の状態</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">オンライン</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">今日のエラー数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">2.3秒</p>
              <p className="text-sm text-gray-600">平均応答時間</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">99.2%</p>
              <p className="text-sm text-gray-600">稼働率</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
