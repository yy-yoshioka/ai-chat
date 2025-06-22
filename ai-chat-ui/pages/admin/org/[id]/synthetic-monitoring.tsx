import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface Monitor {
  id: string;
  name: string;
  type: 'http' | 'https' | 'ping' | 'tcp' | 'dns';
  url: string;
  interval: number; // minutes
  timeout: number; // seconds
  regions: string[];
  status: 'up' | 'down' | 'degraded' | 'paused';
  uptime: number; // percentage
  responseTime: number; // ms
  lastCheck: string;
  createdAt: string;
  assertions: {
    statusCode?: number;
    responseTime?: number;
    contentContains?: string;
    headerExists?: string;
  };
}

interface MonitorResult {
  id: string;
  monitorId: string;
  timestamp: string;
  region: string;
  status: 'success' | 'failure' | 'timeout';
  responseTime: number;
  statusCode?: number;
  error?: string;
  details: Record<string, string | number | boolean>;
}

interface Alert {
  id: string;
  monitorId: string;
  type: 'downtime' | 'slow_response' | 'high_error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

const SyntheticMonitoringPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'monitors' | 'results' | 'alerts' | 'settings'>(
    'monitors'
  );
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [results, setResults] = useState<MonitorResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isCreatingMonitor, setIsCreatingMonitor] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMonitoringData = async () => {
    try {
      const [monitorsResponse, resultsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/monitoring/synthetic`),
        fetch(`/api/organizations/${id}/monitoring/results`),
        fetch(`/api/organizations/${id}/monitoring/alerts`),
      ]);

      if (monitorsResponse.ok) {
        const monitorsData = await monitorsResponse.json();
        setMonitors(monitorsData);
      }

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResults(resultsData);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  };

  const createMonitor = () => {
    const newMonitor: Monitor = {
      id: `monitor-${Date.now()}`,
      name: 'New Monitor',
      type: 'https',
      url: 'https://example.com',
      interval: 5,
      timeout: 30,
      regions: ['us-east-1', 'eu-west-1'],
      status: 'paused',
      uptime: 0,
      responseTime: 0,
      lastCheck: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assertions: {
        statusCode: 200,
        responseTime: 5000,
      },
    };

    setMonitors((prev) => [...prev, newMonitor]);
    setIsCreatingMonitor(false);
  };

  const updateMonitor = (monitorId: string, updates: Partial<Monitor>) => {
    setMonitors((prev) =>
      prev.map((monitor) => (monitor.id === monitorId ? { ...monitor, ...updates } : monitor))
    );
  };

  const toggleMonitor = async (monitorId: string) => {
    try {
      const monitor = monitors.find((m) => m.id === monitorId);
      const newStatus = monitor?.status === 'paused' ? 'up' : 'paused';

      const response = await fetch(
        `/api/organizations/${id}/monitoring/synthetic/${monitorId}/toggle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        updateMonitor(monitorId, { status: newStatus });
      }
    } catch (error) {
      console.error('Failed to toggle monitor:', error);
    }
  };

  const runMonitorNow = async (monitorId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/monitoring/synthetic/${monitorId}/run`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        alert('モニタリングを実行しました');
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Failed to run monitor:', error);
      alert('モニタリング実行に失敗しました');
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/monitoring/alerts/${alertId}/acknowledge`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert))
        );
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'bg-green-100 text-green-700';
      case 'down':
        return 'bg-red-100 text-red-700';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700';
      case 'paused':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'http':
      case 'https':
        return '🌐';
      case 'ping':
        return '📡';
      case 'tcp':
        return '🔌';
      case 'dns':
        return '🔍';
      default:
        return '📊';
    }
  };

  const overallUptime =
    monitors.length > 0 ? monitors.reduce((sum, m) => sum + m.uptime, 0) / monitors.length : 0;

  const averageResponseTime =
    monitors.length > 0
      ? monitors.reduce((sum, m) => sum + m.responseTime, 0) / monitors.length
      : 0;

  return (
    <AdminLayout
      title="合成モニタリング 5分毎"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: '合成モニタリング', href: `/admin/org/${id}/synthetic-monitoring` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">合成モニタリング 5分毎</h1>
            <p className="text-gray-600 mt-1">アップタイム監視・パフォーマンス計測・障害検知</p>
          </div>
          <button
            onClick={() => setIsCreatingMonitor(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + モニター追加
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">全体稼働率</p>
                <p className="text-2xl font-bold text-gray-900">{overallUptime.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均応答時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(averageResponseTime)}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブモニター</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitors.filter((m) => m.status !== 'paused').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">未解決アラート</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter((a) => !a.acknowledged && !a.resolvedAt).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'monitors', label: '🔍 モニター', desc: '監視設定・管理' },
              { key: 'results', label: '📊 結果', desc: 'チェック結果・履歴' },
              { key: 'alerts', label: '🚨 アラート', desc: '障害通知・管理' },
              { key: 'settings', label: '⚙️ 設定', desc: '通知・閾値設定' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'monitors' | 'results' | 'alerts' | 'settings')
                }
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

        {/* モニタータブ */}
        {selectedTab === 'monitors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {monitors.map((monitor) => (
                <div key={monitor.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(monitor.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{monitor.name}</h3>
                        <p className="text-sm text-gray-600">{monitor.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(monitor.status)}`}
                      >
                        {monitor.status}
                      </span>
                      <button
                        onClick={() => runMonitorNow(monitor.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        今すぐ実行
                      </button>
                      <button
                        onClick={() => toggleMonitor(monitor.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          monitor.status === 'paused'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        {monitor.status === 'paused' ? '開始' : '停止'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        監視間隔: {monitor.interval}分
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={monitor.interval}
                        onChange={(e) =>
                          updateMonitor(monitor.id, { interval: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        タイムアウト: {monitor.timeout}秒
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={monitor.timeout}
                        onChange={(e) =>
                          updateMonitor(monitor.id, { timeout: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        監視タイプ
                      </label>
                      <select
                        value={monitor.type}
                        onChange={(e) =>
                          updateMonitor(monitor.id, {
                            type: e.target.value as
                              | 'http'
                              | 'https'
                              | 'ping'
                              | 'tcp'
                              | 'dns'
                              | undefined,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="https">HTTPS</option>
                        <option value="http">HTTP</option>
                        <option value="ping">Ping</option>
                        <option value="tcp">TCP</option>
                        <option value="dns">DNS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        監視リージョン
                      </label>
                      <select
                        multiple
                        value={monitor.regions}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="us-east-1">US East 1</option>
                        <option value="us-west-2">US West 2</option>
                        <option value="eu-west-1">EU West 1</option>
                        <option value="ap-northeast-1">Asia Pacific Northeast 1</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-600">稼働率</p>
                      <p className="text-xl font-bold text-green-900">
                        {monitor.uptime.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">応答時間</p>
                      <p className="text-xl font-bold text-blue-900">{monitor.responseTime}ms</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">最終チェック</p>
                      <p className="text-xs text-purple-900">
                        {new Date(monitor.lastCheck).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">作成日</p>
                      <p className="text-xs text-gray-900">
                        {new Date(monitor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* アサーション設定 */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">チェック条件</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          期待ステータスコード
                        </label>
                        <input
                          type="number"
                          value={monitor.assertions.statusCode || 200}
                          onChange={(e) =>
                            updateMonitor(monitor.id, {
                              assertions: {
                                ...monitor.assertions,
                                statusCode: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          最大応答時間 (ms)
                        </label>
                        <input
                          type="number"
                          value={monitor.assertions.responseTime || 5000}
                          onChange={(e) =>
                            updateMonitor(monitor.id, {
                              assertions: {
                                ...monitor.assertions,
                                responseTime: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {monitors.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <p className="text-lg">モニターが設定されていません</p>
                  <p className="text-sm">「モニター追加」から設定してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 結果タブ */}
        {selectedTab === 'results' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">監視結果</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      モニター
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      リージョン
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      応答時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レスポンス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(result.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {monitors.find((m) => m.id === result.monitorId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            result.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : result.status === 'failure'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.statusCode || result.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* アラートタブ */}
        {selectedTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アラート管理</h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{alert.message}</div>
                        <div className="text-sm text-gray-600">
                          {monitors.find((m) => m.id === alert.monitorId)?.name ||
                            'Unknown Monitor'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && !alert.resolvedAt && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          確認
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          確認済み
                        </span>
                      )}
                      {alert.resolvedAt && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          解決済み
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🟢</span>
                  <p>アラートはありません</p>
                  <p className="text-sm">すべてのモニターが正常に動作しています</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 設定タブ */}
        {selectedTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アラート設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ダウンタイム閾値
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">連続失敗回数</label>
                      <input
                        type="number"
                        defaultValue="3"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">復旧確認回数</label>
                      <input
                        type="number"
                        defaultValue="2"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パフォーマンス閾値
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">警告 (ms)</label>
                      <input
                        type="number"
                        defaultValue="2000"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">重要 (ms)</label>
                      <input
                        type="number"
                        defaultValue="5000"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">メール通知</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Slack通知</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">SMS通知</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Webhook通知</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知メールアドレス
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="alerts@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知間隔制限
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="0">制限なし</option>
                    <option value="5">5分間隔</option>
                    <option value="15">15分間隔</option>
                    <option value="30">30分間隔</option>
                    <option value="60">1時間間隔</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">通知時間帯</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">開始時刻</label>
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">終了時刻</label>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* モニター作成モーダル */}
        {isCreatingMonitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">モニター追加</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">モニター名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: メインサイト監視"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">監視タイプ</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="https">HTTPS</option>
                    <option value="http">HTTP</option>
                    <option value="ping">Ping</option>
                    <option value="tcp">TCP</option>
                    <option value="dns">DNS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">監視間隔</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="1">1分</option>
                    <option value="5">5分</option>
                    <option value="15">15分</option>
                    <option value="30">30分</option>
                    <option value="60">1時間</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createMonitor}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingMonitor(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SyntheticMonitoringPage;
