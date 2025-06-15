import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'blocked';
  details: Record<string, any>;
  sessionId: string;
  geolocation?: {
    country: string;
    city: string;
    lat: number;
    lng: number;
  };
}

interface ExportConfig {
  format: 'csv' | 'json' | 'excel';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    users: string[];
    actions: string[];
    status: string[];
  };
  columns: string[];
}

const AuditLogsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<'logs' | 'export' | 'retention' | 'api'>('logs');
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'today',
    action: 'all',
    status: 'all',
    user: 'all',
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    filters: { users: [], actions: [], status: [] },
    columns: ['timestamp', 'user', 'action', 'resource', 'status'],
  });

  useEffect(() => {
    loadAuditLogs();
  }, [id, filters]);

  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        search: filters.search,
        dateRange: filters.dateRange,
        action: filters.action,
        status: filters.status,
        user: filters.user,
      });

      const response = await fetch(`/api/organizations/${id}/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/audit-logs/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('エクスポートに失敗しました');
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      login: '🔑',
      logout: '🚪',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      view: '👁️',
      export: '📤',
      import: '📥',
      admin: '⚙️',
    };
    return icons[action] || '📝';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">監査ログ & CSV/API Export</h1>
          <p className="text-gray-600 mt-1">ユーザー活動・システム操作の完全な追跡</p>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📤 ログエクスポート
        </button>
      </div>

      {/* 統計概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ログ数</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">成功操作</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter((log) => log.status === 'success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">失敗操作</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter((log) => log.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(logs.map((log) => log.userId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'logs', label: '📝 ログ閲覧', desc: 'リアルタイム監査ログ' },
            { key: 'export', label: '📤 エクスポート', desc: 'CSV・Excel・JSON' },
            { key: 'retention', label: '🗄️ 保持設定', desc: 'ログ保持ポリシー' },
            { key: 'api', label: '🔌 API', desc: 'Audit API・Webhook' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as 'logs' | 'export' | 'retention' | 'api')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div>{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* ログ閲覧タブ */}
      {selectedTab === 'logs' && (
        <div className="space-y-6">
          {/* フィルター */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="検索..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="today">今日</option>
                  <option value="yesterday">昨日</option>
                  <option value="week">過去1週間</option>
                  <option value="month">過去1ヶ月</option>
                  <option value="custom">カスタム期間</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">すべての操作</option>
                  <option value="login">ログイン</option>
                  <option value="logout">ログアウト</option>
                  <option value="create">作成</option>
                  <option value="update">更新</option>
                  <option value="delete">削除</option>
                  <option value="admin">管理操作</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="success">成功</option>
                  <option value="failed">失敗</option>
                  <option value="blocked">ブロック</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.user}
                  onChange={(e) => setFilters((prev) => ({ ...prev, user: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">すべてのユーザー</option>
                  <option value="admin">管理者</option>
                  <option value="user">一般ユーザー</option>
                  <option value="system">システム</option>
                </select>
              </div>
            </div>
          </div>

          {/* ログテーブル */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      リソース
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP アドレス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {log.userName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                            <div className="text-sm text-gray-500">{log.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getActionIcon(log.action)}</span>
                          <span className="text-sm text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* エクスポートタブ */}
      {selectedTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">エクスポート設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">フォーマット</label>
                <select
                  value={exportConfig.format}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      format: e.target.value as 'csv' | 'json' | 'excel',
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.start}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.end}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  エクスポート列
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'timestamp', label: 'タイムスタンプ' },
                    { key: 'user', label: 'ユーザー情報' },
                    { key: 'action', label: '操作' },
                    { key: 'resource', label: 'リソース' },
                    { key: 'status', label: 'ステータス' },
                    { key: 'ipAddress', label: 'IP アドレス' },
                    { key: 'userAgent', label: 'ユーザーエージェント' },
                    { key: 'geolocation', label: '地理情報' },
                  ].map((column) => (
                    <label key={column.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.columns.includes(column.key)}
                        onChange={(e) => {
                          const columns = e.target.checked
                            ? [...exportConfig.columns, column.key]
                            : exportConfig.columns.filter((col) => col !== column.key);
                          setExportConfig((prev) => ({ ...prev, columns }));
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={exportLogs}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📤 エクスポート実行
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">エクスポート履歴</h3>
            <div className="space-y-3">
              {[
                {
                  date: '2024-01-15 14:30:25',
                  format: 'CSV',
                  size: '2.3 MB',
                  records: '15,245',
                  status: 'completed',
                },
                {
                  date: '2024-01-10 09:15:10',
                  format: 'Excel',
                  size: '4.1 MB',
                  records: '28,934',
                  status: 'completed',
                },
                {
                  date: '2024-01-05 16:45:33',
                  format: 'JSON',
                  size: '8.7 MB',
                  records: '42,156',
                  status: 'completed',
                },
              ].map((export_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{export_.format} エクスポート</div>
                      <div className="text-sm text-gray-600">
                        {export_.records} レコード • {export_.size}
                      </div>
                      <div className="text-sm text-gray-500">{export_.date}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        完了
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        再ダウンロード
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 保持設定タブ */}
      {selectedTab === 'retention' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ログ保持ポリシー</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保持期間: 90日
                </label>
                <input type="range" min="30" max="365" defaultValue="90" className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30日</span>
                  <span>365日</span>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm font-medium text-gray-700">自動アーカイブ</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  保持期間を過ぎたログを自動的にアーカイブストレージに移動
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm font-medium text-gray-700">暗号化アーカイブ</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  アーカイブログをAES-256で暗号化して保存
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">削除通知</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-gray-600 mt-1">ログ削除時の通知先メールアドレス</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">ストレージ使用状況</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">アクティブログ</span>
                  <span className="font-medium">2.8 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">アーカイブ</span>
                  <span className="font-medium">1.2 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>合計使用量</span>
                    <span>4.0 GB / 10 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API タブ */}
      {selectedTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit API</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API エンドポイント
                </label>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  GET https://api.ai-chat.jp/v1/organizations/{id}/audit-logs
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">認証</label>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">使用例</label>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`curl -X GET \\
  'https://api.ai-chat.jp/v1/organizations/${id}/audit-logs?limit=100&date_from=2024-01-01' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
                </pre>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">レスポンス例</label>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`{
  "logs": [
    {
      "id": "log_123",
      "timestamp": "2024-01-15T14:30:25Z",
      "user_id": "user_456",
      "action": "login",
      "resource": "dashboard",
      "status": "success",
      "ip_address": "192.168.1.1"
    }
  ],
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 100
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">リアルタイム監査 Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Webhook 有効</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://your-app.com/webhooks/audit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">監視イベント</label>
                <div className="space-y-2">
                  {[
                    'ユーザー認証',
                    'データ変更',
                    '管理操作',
                    'セキュリティイベント',
                    'システムエラー',
                  ].map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ペイロード例</label>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`{
  "event": "audit.log.created",
  "timestamp": "2024-01-15T14:30:25Z",
  "data": {
    "log_id": "log_123",
    "user_id": "user_456",
    "action": "data_export",
    "severity": "high",
    "details": {
      "resource": "user_data",
      "count": 1000
    }
  }
}`}
                </pre>
              </div>

              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                テスト送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
