import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface Connector {
  id: string;
  name: string;
  platform: 'zapier' | 'make' | 'custom';
  status: 'active' | 'inactive' | 'error';
  webhookUrl: string;
  apiKey: string;
  triggers: ConnectorTrigger[];
  actions: ConnectorAction[];
  lastSync: string;
  totalExecutions: number;
}

interface ConnectorTrigger {
  id: string;
  name: string;
  event: string;
  description: string;
  enabled: boolean;
  conditions: Record<string, string | number | boolean>;
}

interface ConnectorAction {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
  config: Record<string, string | number | boolean>;
}

const IntegrationsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [isCreatingConnector, setIsCreatingConnector] = useState(false);
  const [newConnector, setNewConnector] = useState({
    name: '',
    platform: 'zapier' as 'zapier' | 'make' | 'custom',
  });

  useEffect(() => {
    loadConnectors();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConnectors = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/connectors`);
      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
      }
    } catch (error) {
      console.error('Failed to load connectors:', error);
    }
  };

  const saveConnectors = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/connectors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectors),
      });

      if (response.ok) {
        alert('コネクタ設定が保存されました！');
      }
    } catch (error) {
      console.error('Failed to save connectors:', error);
      alert('保存に失敗しました');
    }
  };

  const createConnector = () => {
    if (!newConnector.name) return;

    const connector: Connector = {
      id: `connector-${Date.now()}`,
      name: newConnector.name,
      platform: newConnector.platform,
      status: 'inactive',
      webhookUrl: `https://api.ai-chat.jp/webhooks/${id}/${Date.now()}`,
      apiKey: `ac_${Math.random().toString(36).substr(2, 20)}`,
      triggers: [
        {
          id: 'message_received',
          name: 'メッセージ受信',
          event: 'message.created',
          description: '新しいメッセージが受信された時',
          enabled: true,
          conditions: {},
        },
        {
          id: 'conversation_started',
          name: '会話開始',
          event: 'conversation.started',
          description: '新しい会話が開始された時',
          enabled: false,
          conditions: {},
        },
      ],
      actions: [
        {
          id: 'send_message',
          name: 'メッセージ送信',
          type: 'send_message',
          description: 'チャットにメッセージを送信',
          enabled: true,
          config: {},
        },
        {
          id: 'update_user',
          name: 'ユーザー情報更新',
          type: 'update_user',
          description: 'ユーザー情報を更新',
          enabled: false,
          config: {},
        },
      ],
      lastSync: new Date().toISOString(),
      totalExecutions: 0,
    };

    setConnectors((prev) => [...prev, connector]);
    setSelectedConnector(connector.id);
    setNewConnector({ name: '', platform: 'zapier' });
    setIsCreatingConnector(false);
  };

  const deleteConnector = (connectorId: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== connectorId));
    setSelectedConnector('');
  };

  const updateConnector = (connectorId: string, updates: Partial<Connector>) => {
    setConnectors((prev) =>
      prev.map((connector) =>
        connector.id === connectorId ? { ...connector, ...updates } : connector
      )
    );
  };

  const toggleTrigger = (connectorId: string, triggerId: string) => {
    setConnectors((prev) =>
      prev.map((connector) => {
        if (connector.id !== connectorId) return connector;
        return {
          ...connector,
          triggers: connector.triggers.map((trigger) =>
            trigger.id === triggerId ? { ...trigger, enabled: !trigger.enabled } : trigger
          ),
        };
      })
    );
  };

  const toggleAction = (connectorId: string, actionId: string) => {
    setConnectors((prev) =>
      prev.map((connector) => {
        if (connector.id !== connectorId) return connector;
        return {
          ...connector,
          actions: connector.actions.map((action) =>
            action.id === actionId ? { ...action, enabled: !action.enabled } : action
          ),
        };
      })
    );
  };

  const testConnection = async (connectorId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/connectors/${connectorId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('接続テストが成功しました！');
        updateConnector(connectorId, { status: 'active' });
      } else {
        alert('接続テストに失敗しました');
        updateConnector(connectorId, { status: 'error' });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('接続テストに失敗しました');
    }
  };

  const currentConnector = connectors.find((c) => c.id === selectedConnector);

  return (
    <AdminLayout
      title="外部連携・コネクタ"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: '外部連携', href: `/admin/org/${id}/integrations` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">外部連携・コネクタ</h1>
            <p className="text-gray-600 mt-1">Zapier、Make、カスタムWebhookとの連携を管理</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreatingConnector(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + 新しいコネクタ
            </button>
            <button
              onClick={saveConnectors}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブコネクタ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectors.filter((c) => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総実行数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectors.reduce((total, c) => total + c.totalExecutions, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">トリガー数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectors.reduce(
                    (total, c) => total + c.triggers.filter((t) => t.enabled).length,
                    0
                  )}
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
                <p className="text-sm font-medium text-gray-600">アクション数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectors.reduce(
                    (total, c) => total + c.actions.filter((a) => a.enabled).length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* コネクタ一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">コネクタ一覧</h3>
          <div className="space-y-3">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedConnector === connector.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedConnector(connector.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {connector.platform === 'zapier' && <span className="text-2xl">⚡</span>}
                      {connector.platform === 'make' && <span className="text-2xl">🔧</span>}
                      {connector.platform === 'custom' && <span className="text-2xl">🔗</span>}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{connector.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{connector.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        connector.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : connector.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {connector.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testConnection(connector.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      テスト
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConnector(connector.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {connectors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">🔗</span>
                <p>コネクタが設定されていません</p>
                <p className="text-sm">「新しいコネクタ」ボタンから追加してください</p>
              </div>
            )}
          </div>
        </div>

        {/* コネクタ詳細設定 */}
        {currentConnector && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">コネクタ名</label>
                  <input
                    type="text"
                    value={currentConnector.name}
                    onChange={(e) => updateConnector(currentConnector.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={currentConnector.webhookUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(currentConnector.webhookUrl)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API キー</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={currentConnector.apiKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(currentConnector.apiKey)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">設定手順</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>上記のWebhook URLをコピーして{currentConnector.platform}に設定</li>
                    <li>API キーを認証ヘッダーに含めて使用</li>
                    <li>「テスト」ボタンで接続を確認</li>
                    <li>トリガーとアクションを有効化</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* トリガー設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 トリガー設定</h3>
              <div className="space-y-3">
                {currentConnector.triggers.map((trigger) => (
                  <div key={trigger.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{trigger.name}</h4>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={trigger.enabled}
                          onChange={() => toggleTrigger(currentConnector.id, trigger.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">有効</span>
                      </label>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      イベント: <code>{trigger.event}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* アクション設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 アクション設定</h3>
              <div className="space-y-3">
                {currentConnector.actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{action.name}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={action.enabled}
                          onChange={() => toggleAction(currentConnector.id, action.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">有効</span>
                      </label>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      タイプ: <code>{action.type}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 統計・ログ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 統計・ログ</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">総実行数</p>
                    <p className="text-xl font-bold text-gray-900">
                      {currentConnector.totalExecutions}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">最終同期</p>
                    <p className="text-sm text-gray-900">
                      {new Date(currentConnector.lastSync).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">最近のログ</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                    <div className="space-y-1">
                      <div className="text-green-600">
                        ✓ 2024-01-15 10:30:25 - メッセージ受信トリガー実行
                      </div>
                      <div className="text-blue-600">ℹ 2024-01-15 10:30:20 - Webhook 受信</div>
                      <div className="text-green-600">
                        ✓ 2024-01-15 10:25:15 - 会話開始トリガー実行
                      </div>
                      <div className="text-gray-600">ℹ 2024-01-15 10:20:10 - 接続テスト成功</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 新しいコネクタ作成モーダル */}
        {isCreatingConnector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいコネクタを作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">コネクタ名</label>
                  <input
                    type="text"
                    value={newConnector.name}
                    onChange={(e) => setNewConnector((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: メール通知Zapier"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プラットフォーム
                  </label>
                  <select
                    value={newConnector.platform}
                    onChange={(e) =>
                      setNewConnector((prev) => ({
                        ...prev,
                        platform: e.target.value as 'zapier' | 'make' | 'custom',
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="zapier">Zapier</option>
                    <option value="make">Make (Integromat)</option>
                    <option value="custom">カスタムWebhook</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createConnector}
                    disabled={!newConnector.name}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingConnector(false);
                      setNewConnector({ name: '', platform: 'zapier' });
                    }}
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

export default IntegrationsPage;
