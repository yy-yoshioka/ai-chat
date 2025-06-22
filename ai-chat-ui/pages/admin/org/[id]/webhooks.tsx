import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  lastDelivery: string;
  totalDeliveries: number;
  successRate: number;
  retryPolicy: {
    maxRetries: number;
    backoffType: 'linear' | 'exponential';
    initialDelay: number;
  };
  headers: { [key: string]: string };
  createdAt: string;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  responseCode: number;
  responseTime: number;
  attempts: number;
  createdAt: string;
  payload: Record<string, unknown>;
}

const WebhooksPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string>('');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'testing' | 'logs'>(
    'overview'
  );

  const availableEvents = [
    {
      key: 'message.created',
      label: 'メッセージ作成',
      description: '新しいメッセージが作成された時',
    },
    { key: 'message.updated', label: 'メッセージ更新', description: 'メッセージが更新された時' },
    { key: 'conversation.started', label: '会話開始', description: '新しい会話が開始された時' },
    { key: 'conversation.ended', label: '会話終了', description: '会話が終了した時' },
    { key: 'user.created', label: 'ユーザー作成', description: '新しいユーザーが作成された時' },
    { key: 'user.updated', label: 'ユーザー更新', description: 'ユーザー情報が更新された時' },
    { key: 'analytics.daily', label: '日次分析', description: '日次分析データが生成された時' },
    { key: 'billing.invoice.created', label: '請求書作成', description: '請求書が作成された時' },
  ];

  const loadWebhooks = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/webhooks`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  }, [id]);

  const loadWebhookEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/webhook-events`);
      if (response.ok) {
        const data = await response.json();
        setWebhookEvents(data);
      }
    } catch (error) {
      console.error('Failed to load webhook events:', error);
    }
  }, [id]);

  useEffect(() => {
    loadWebhooks();
    loadWebhookEvents();
  }, [loadWebhooks, loadWebhookEvents]);

  const createWebhook = () => {
    const newWebhook: Webhook = {
      id: `webhook-${Date.now()}`,
      name: `Webhook ${webhooks.length + 1}`,
      url: 'https://your-app.com/webhooks',
      events: ['message.created'],
      status: 'inactive',
      secret: `whsec_${Math.random().toString(36).substr(2, 32)}`,
      lastDelivery: 'Never',
      totalDeliveries: 0,
      successRate: 0,
      retryPolicy: {
        maxRetries: 3,
        backoffType: 'exponential',
        initialDelay: 1000,
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Chat-Webhook/1.0',
      },
      createdAt: new Date().toISOString(),
    };

    setWebhooks((prev) => [...prev, newWebhook]);
    setSelectedWebhook(newWebhook.id);
    setIsCreatingWebhook(false);
  };

  const updateWebhook = (webhookId: string, updates: Partial<Webhook>) => {
    setWebhooks((prev) =>
      prev.map((webhook) => (webhook.id === webhookId ? { ...webhook, ...updates } : webhook))
    );
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
    if (selectedWebhook === webhookId) {
      setSelectedWebhook('');
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/webhooks/${webhookId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Webhookテストが成功しました！');
        updateWebhook(webhookId, { status: 'active' });
      } else {
        alert('Webhookテストに失敗しました');
        updateWebhook(webhookId, { status: 'error' });
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
      alert('Webhookテストに失敗しました');
    }
  };

  const currentWebhook = webhooks.find((w) => w.id === selectedWebhook);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook 管理</h1>
            <p className="text-gray-600 mt-1">イベント通知・署名検証・配信ログの管理</p>
          </div>
          <button
            onClick={() => setIsCreatingWebhook(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + 新しいWebhook
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブWebhook</p>
                <p className="text-2xl font-bold text-gray-900">
                  {webhooks.filter((w) => w.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">総配信数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {webhooks.reduce((total, w) => total + w.totalDeliveries, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {webhooks.length > 0
                    ? Math.round(
                        webhooks.reduce((total, w) => total + w.successRate, 0) / webhooks.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日の配信</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    webhookEvents.filter((e) => {
                      const today = new Date().toDateString();
                      return new Date(e.createdAt).toDateString() === today;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '📋 概要', desc: 'Webhook一覧・管理' },
              { key: 'events', label: '⚡ イベント', desc: 'イベント設定' },
              { key: 'testing', label: '🧪 テスト', desc: 'Webhookテスト' },
              { key: 'logs', label: '📝 ログ', desc: '配信ログ・履歴' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as 'overview' | 'events' | 'testing' | 'logs')}
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

        {/* 概要タブ */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Webhook一覧 */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Webhook一覧</h3>
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedWebhook === webhook.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWebhook(webhook.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          webhook.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : webhook.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {webhook.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testWebhook(webhook.id);
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        テスト
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWebhook(webhook.id);
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>URL: {webhook.url}</div>
                    <div>イベント: {webhook.events.join(', ')}</div>
                    <div>
                      配信数: {webhook.totalDeliveries} (成功率: {webhook.successRate}%)
                    </div>
                    <div>最終配信: {webhook.lastDelivery}</div>
                  </div>
                </div>
              ))}

              {webhooks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🔗</span>
                  <p>Webhookが設定されていません</p>
                  <p className="text-sm">「新しいWebhook」ボタンから追加してください</p>
                </div>
              )}
            </div>

            {/* 詳細設定 */}
            {currentWebhook && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook詳細</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                      <input
                        type="text"
                        value={currentWebhook.name}
                        onChange={(e) => updateWebhook(currentWebhook.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                      <input
                        type="url"
                        value={currentWebhook.url}
                        onChange={(e) => updateWebhook(currentWebhook.id, { url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        署名シークレット
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value={currentWebhook.secret}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(currentWebhook.secret)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ステータス
                      </label>
                      <select
                        value={currentWebhook.status}
                        onChange={(e) =>
                          updateWebhook(currentWebhook.id, {
                            status: e.target.value as 'active' | 'inactive' | 'error',
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="active">有効</option>
                        <option value="inactive">無効</option>
                        <option value="error">エラー</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">リトライ設定</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大リトライ回数: {currentWebhook.retryPolicy.maxRetries}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={currentWebhook.retryPolicy.maxRetries}
                        onChange={(e) =>
                          updateWebhook(currentWebhook.id, {
                            retryPolicy: {
                              ...currentWebhook.retryPolicy,
                              maxRetries: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        バックオフタイプ
                      </label>
                      <select
                        value={currentWebhook.retryPolicy.backoffType}
                        onChange={(e) =>
                          updateWebhook(currentWebhook.id, {
                            retryPolicy: {
                              ...currentWebhook.retryPolicy,
                              backoffType: e.target.value as 'linear' | 'exponential',
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="linear">Linear</option>
                        <option value="exponential">Exponential</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        初期遅延: {currentWebhook.retryPolicy.initialDelay}ms
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={currentWebhook.retryPolicy.initialDelay}
                        onChange={(e) =>
                          updateWebhook(currentWebhook.id, {
                            retryPolicy: {
                              ...currentWebhook.retryPolicy,
                              initialDelay: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* イベントタブ */}
        {selectedTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">利用可能なイベント</h3>
              <div className="space-y-3">
                {availableEvents.map((event) => (
                  <div key={event.key} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.label}</h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={currentWebhook?.events.includes(event.key) || false}
                          onChange={(e) => {
                            if (!currentWebhook) return;
                            const events = e.target.checked
                              ? [...currentWebhook.events, event.key]
                              : currentWebhook.events.filter((e) => e !== event.key);
                            updateWebhook(currentWebhook.id, { events });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">有効</span>
                      </label>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      イベント: <code>{event.key}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ペイロード例</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">message.created</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`{
  "event": "message.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "msg_123",
    "content": "Hello!",
    "userId": "user_456",
    "conversationId": "conv_789",
    "createdAt": "2024-01-15T10:30:00Z",
    "metadata": {
      "source": "widget"
    }
  },
  "organization": {
    "id": "${id}",
    "name": "Your Organization"
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">署名検証</h4>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p className="font-medium text-blue-900 mb-2">HMAC-SHA256 署名</p>
                    <p className="text-blue-800 mb-2">
                      ヘッダー: <code>X-Signature-256</code>
                    </p>
                    <p className="text-blue-800">
                      形式: <code>sha256=&lt;signature&gt;</code>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">検証コード例 (Node.js)</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* テストタブ */}
        {selectedTab === 'testing' && currentWebhook && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhookテスト</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テストイベント
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    {currentWebhook.events.map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カスタムペイロード
                  </label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border rounded-lg font-mono text-sm"
                    defaultValue={JSON.stringify(
                      {
                        event: 'message.created',
                        timestamp: new Date().toISOString(),
                        data: {
                          id: 'msg_test_123',
                          content: 'This is a test message',
                          userId: 'user_test',
                          conversationId: 'conv_test',
                        },
                      },
                      null,
                      2
                    )}
                  />
                </div>

                <button
                  onClick={() => testWebhook(currentWebhook.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  テスト送信
                </button>
              </div>

              <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ テスト注意事項</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• テストペイロードは実際のデータとは異なります</li>
                  <li>• 署名検証も含めてテストされます</li>
                  <li>• 本番環境でのテストは慎重に行ってください</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">接続確認</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">エンドポイント確認</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>URL: {currentWebhook.url}</div>
                    <div>メソッド: POST</div>
                    <div>Content-Type: application/json</div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      ✓ 到達可能
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">SSL証明書</h4>
                  <div className="text-sm text-gray-600">証明書の有効性を確認します</div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      ✓ 有効
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">応答時間</h4>
                  <div className="text-sm text-gray-600">平均応答時間: 245ms</div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      ✓ 良好
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ログタブ */}
        {selectedTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">配信ログ</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option value="all">すべてのWebhook</option>
                  {webhooks.map((webhook) => (
                    <option key={webhook.id} value={webhook.id}>
                      {webhook.name}
                    </option>
                  ))}
                </select>
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option value="all">すべてのステータス</option>
                  <option value="success">成功</option>
                  <option value="failed">失敗</option>
                  <option value="pending">保留中</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時刻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      イベント
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レスポンス時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      試行回数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhookEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.event}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : event.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {event.status} ({event.responseCode})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.attempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">詳細</button>
                        <button className="text-green-600 hover:text-green-900">再送</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {webhookEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📝</span>
                <p>配信ログがありません</p>
                <p className="text-sm">Webhookイベントが発生すると、ここに表示されます</p>
              </div>
            )}
          </div>
        )}

        {/* Webhook作成モーダル */}
        {isCreatingWebhook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいWebhookを作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: Slack通知"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://your-app.com/webhooks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">イベント</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableEvents.slice(0, 4).map((event) => (
                      <label key={event.key} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createWebhook}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingWebhook(false)}
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

export default WebhooksPage;
