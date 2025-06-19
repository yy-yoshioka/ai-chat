import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
  limit: number;
  window: 'minute' | 'hour' | 'day';
  enabled: boolean;
  action: 'block' | 'throttle' | 'captcha';
  whitelist: string[];
  createdAt: string;
}

interface WAFRule {
  id: string;
  name: string;
  type: 'ip_block' | 'geo_block' | 'user_agent' | 'sql_injection' | 'xss' | 'custom';
  pattern: string;
  action: 'block' | 'log' | 'challenge';
  priority: number;
  enabled: boolean;
  createdAt: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'rate_limit' | 'waf_block' | 'ddos' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  action: string;
  details: Record<string, unknown>;
}

const SecurityPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'rate-limits' | 'waf' | 'monitoring' | 'threats'>(
    'rate-limits'
  );
  const [rateLimitRules, setRateLimitRules] = useState<RateLimitRule[]>([]);
  const [wafRules, setWafRules] = useState<WAFRule[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSecurityData = async () => {
    try {
      const [rateLimitResponse, wafResponse, eventsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/security/rate-limits`),
        fetch(`/api/organizations/${id}/security/waf`),
        fetch(`/api/organizations/${id}/security/events`),
      ]);

      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        setRateLimitRules(rateLimitData);
      }

      if (wafResponse.ok) {
        const wafData = await wafResponse.json();
        setWafRules(wafData);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setSecurityEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const createRateLimitRule = () => {
    const newRule: RateLimitRule = {
      id: `rate-${Date.now()}`,
      name: 'New Rate Limit',
      endpoint: '/api/*',
      method: 'ALL',
      limit: 100,
      window: 'minute',
      enabled: true,
      action: 'throttle',
      whitelist: [],
      createdAt: new Date().toISOString(),
    };

    setRateLimitRules((prev) => [...prev, newRule]);
    setIsCreatingRule(false);
  };

  const updateRateLimitRule = (ruleId: string, updates: Partial<RateLimitRule>) => {
    setRateLimitRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const updateWAFRule = (ruleId: string, updates: Partial<WAFRule>) => {
    setWafRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const testRule = async (ruleId: string, type: 'rate-limit' | 'waf') => {
    try {
      const response = await fetch(`/api/organizations/${id}/security/${type}/${ruleId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('ルールテストが成功しました');
      } else {
        alert('ルールテストに失敗しました');
      }
    } catch (error) {
      console.error('Rule test failed:', error);
      alert('ルールテストに失敗しました');
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Rate Limit & WAF</h1>
          <p className="text-gray-600 mt-1">API保護・攻撃防御・セキュリティ監視</p>
        </div>
        <button
          onClick={() => setIsCreatingRule(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + セキュリティルール追加
        </button>
      </div>

      {/* 統計概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブルール</p>
              <p className="text-2xl font-bold text-gray-900">
                {rateLimitRules.filter((r) => r.enabled).length +
                  wafRules.filter((r) => r.enabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今日のブロック</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityEvents.filter((e) => e.action === 'block').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">脅威検知</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  securityEvents.filter((e) => e.severity === 'high' || e.severity === 'critical')
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">正常リクエスト</p>
              <p className="text-2xl font-bold text-gray-900">99.7%</p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'rate-limits', label: '⏱️ Rate Limits', desc: 'API速度制限' },
            { key: 'waf', label: '🛡️ WAF', desc: 'Web Application Firewall' },
            { key: 'monitoring', label: '📊 監視', desc: 'リアルタイム監視' },
            { key: 'threats', label: '🚨 脅威', desc: '脅威インテリジェンス' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() =>
                setSelectedTab(key as 'rate-limits' | 'waf' | 'monitoring' | 'threats')
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

      {/* Rate Limits タブ */}
      {selectedTab === 'rate-limits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {rateLimitRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">
                      {rule.method} {rule.endpoint} • {rule.limit}/{rule.window}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) =>
                          updateRateLimitRule(rule.id, { enabled: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">有効</span>
                    </label>
                    <button
                      onClick={() => testRule(rule.id, 'rate-limit')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      テスト
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      エンドポイント
                    </label>
                    <input
                      type="text"
                      value={rule.endpoint}
                      onChange={(e) => updateRateLimitRule(rule.id, { endpoint: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTTPメソッド
                    </label>
                    <select
                      value={rule.method}
                      onChange={(e) =>
                        updateRateLimitRule(rule.id, {
                          method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE',
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="ALL">すべて</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      制限数: {rule.limit}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={rule.limit}
                      onChange={(e) =>
                        updateRateLimitRule(rule.id, { limit: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">時間窓</label>
                    <select
                      value={rule.window}
                      onChange={(e) =>
                        updateRateLimitRule(rule.id, {
                          window: e.target.value as 'minute' | 'hour' | 'day' | undefined,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="minute">分</option>
                      <option value="hour">時間</option>
                      <option value="day">日</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      制限時の動作
                    </label>
                    <select
                      value={rule.action}
                      onChange={(e) =>
                        updateRateLimitRule(rule.id, {
                          action: e.target.value as 'block' | 'throttle' | 'captcha' | undefined,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="block">ブロック</option>
                      <option value="throttle">スロットル</option>
                      <option value="captcha">CAPTCHA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ホワイトリスト IP
                    </label>
                    <input
                      type="text"
                      value={rule.whitelist.join(', ')}
                      onChange={(e) =>
                        updateRateLimitRule(rule.id, {
                          whitelist: e.target.value.split(',').map((ip) => ip.trim()),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="192.168.1.1, 10.0.0.0/8"
                    />
                  </div>
                </div>
              </div>
            ))}

            {rateLimitRules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">⏱️</span>
                <p className="text-lg">Rate Limitルールが設定されていません</p>
                <p className="text-sm">「セキュリティルール追加」から設定してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WAF タブ */}
      {selectedTab === 'waf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {wafRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600 capitalize">{rule.type}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">優先度: {rule.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateWAFRule(rule.id, { enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">有効</span>
                    </label>
                    <button
                      onClick={() => testRule(rule.id, 'waf')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      テスト
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ルールタイプ
                    </label>
                    <select
                      value={rule.type}
                      onChange={(e) =>
                        updateWAFRule(rule.id, {
                          type: e.target.value as
                            | 'ip_block'
                            | 'geo_block'
                            | 'user_agent'
                            | 'sql_injection'
                            | 'xss'
                            | 'custom'
                            | undefined,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="ip_block">IP ブロック</option>
                      <option value="geo_block">地理的ブロック</option>
                      <option value="user_agent">ユーザーエージェント</option>
                      <option value="sql_injection">SQLインジェクション</option>
                      <option value="xss">XSS攻撃</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アクション
                    </label>
                    <select
                      value={rule.action}
                      onChange={(e) =>
                        updateWAFRule(rule.id, {
                          action: e.target.value as 'block' | 'log' | 'challenge' | undefined,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="block">ブロック</option>
                      <option value="log">ログのみ</option>
                      <option value="challenge">チャレンジ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      優先度: {rule.priority}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={rule.priority}
                      onChange={(e) =>
                        updateWAFRule(rule.id, { priority: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パターン/条件
                  </label>
                  <textarea
                    value={rule.pattern}
                    onChange={(e) => updateWAFRule(rule.id, { pattern: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm h-20 font-mono"
                    placeholder={
                      rule.type === 'ip_block'
                        ? '192.168.1.1, 10.0.0.0/8'
                        : rule.type === 'geo_block'
                          ? 'CN, RU, KP'
                          : rule.type === 'user_agent'
                            ? 'bot, crawler, scanner'
                            : rule.type === 'sql_injection'
                              ? '(UNION|SELECT|INSERT|DELETE|DROP|ALTER)'
                              : 'カスタムパターンを入力'
                    }
                  />
                </div>
              </div>
            ))}

            {wafRules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">🛡️</span>
                <p className="text-lg">WAFルールが設定されていません</p>
                <p className="text-sm">「セキュリティルール追加」から設定してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 監視タブ */}
      {selectedTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">リアルタイム統計</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">総リクエスト</p>
                  <p className="text-2xl font-bold text-blue-900">12,345</p>
                  <p className="text-sm text-blue-600">+15% vs 昨日</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-600">ブロック済み</p>
                  <p className="text-2xl font-bold text-red-900">234</p>
                  <p className="text-sm text-red-600">1.9% of total</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">エンドポイント別統計</h4>
                <div className="space-y-2">
                  {[
                    { endpoint: '/api/chat/messages', requests: 8934, blocks: 12 },
                    { endpoint: '/api/auth/login', requests: 2341, blocks: 189 },
                    { endpoint: '/api/users', requests: 987, blocks: 23 },
                    { endpoint: '/api/organizations', requests: 456, blocks: 5 },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-mono text-sm text-gray-900">{stat.endpoint}</div>
                        <div className="text-xs text-gray-600">
                          {stat.requests} リクエスト • {stat.blocks} ブロック
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {((stat.blocks / stat.requests) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">トップ攻撃者 IP</h3>
            <div className="space-y-3">
              {[
                { ip: '203.0.113.42', country: 'CN', attempts: 1234, blocked: 1234 },
                { ip: '198.51.100.15', country: 'RU', attempts: 567, blocked: 567 },
                { ip: '192.0.2.89', country: 'Unknown', attempts: 234, blocked: 234 },
                { ip: '203.0.113.195', country: 'KP', attempts: 123, blocked: 123 },
              ].map((attacker, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-mono text-sm text-gray-900">{attacker.ip}</div>
                    <div className="text-xs text-gray-600">
                      {attacker.country} • {attacker.attempts} 攻撃試行
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      {attacker.blocked} ブロック
                    </span>
                    <button className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors">
                      永久ブロック
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ 異常検知</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 過去1時間で通常の5倍のリクエスト</li>
                <li>• 中国からの攻撃的なスキャンが増加</li>
                <li>• SQLインジェクション試行が検出</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 脅威タブ */}
      {selectedTab === 'threats' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">脅威インテリジェンス</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option value="all">すべての脅威</option>
                <option value="rate_limit">Rate Limit</option>
                <option value="waf_block">WAF Block</option>
                <option value="ddos">DDoS</option>
                <option value="suspicious">不審な活動</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option value="all">すべての深刻度</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg text-sm"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-3">
              {[
                {
                  time: '2024-01-15 14:30:25',
                  type: 'SQL Injection',
                  severity: 'critical',
                  source: '203.0.113.42',
                  target: '/api/users',
                  action: 'blocked',
                  details: 'UNION SELECT attempt detected',
                },
                {
                  time: '2024-01-15 14:25:10',
                  type: 'Rate Limit Exceeded',
                  severity: 'high',
                  source: '198.51.100.15',
                  target: '/api/auth/login',
                  action: 'throttled',
                  details: '500 requests in 1 minute',
                },
                {
                  time: '2024-01-15 14:20:45',
                  type: 'Geo Block',
                  severity: 'medium',
                  source: '192.0.2.89',
                  target: '/api/chat',
                  action: 'blocked',
                  details: 'Request from blocked country',
                },
                {
                  time: '2024-01-15 14:15:30',
                  type: 'Suspicious User Agent',
                  severity: 'low',
                  source: '203.0.113.195',
                  target: '/api/organizations',
                  action: 'logged',
                  details: 'Bot-like user agent detected',
                },
              ].map((event, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(event.severity)}`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{event.type}</div>
                        <div className="text-sm text-gray-600">
                          {event.source} → {event.target} • {event.action}
                        </div>
                        <div className="text-sm text-gray-500">{event.details}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ルール作成モーダル */}
      {isCreatingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">セキュリティルール追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ルールタイプ</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="rate-limit">Rate Limit</option>
                  <option value="waf">WAF Rule</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ルール名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: API Rate Limit"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createRateLimitRule}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
                <button
                  onClick={() => setIsCreatingRule(false)}
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
  );
};

export default SecurityPage;
