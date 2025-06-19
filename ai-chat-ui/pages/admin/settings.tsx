import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  ai: {
    model: string;
    maxTokens: number;
    temperature: number;
    responseTimeout: number;
    autoModeration: boolean;
  };
  chat: {
    maxConcurrentChats: number;
    chatSessionTimeout: number;
    enableFiltering: boolean;
    enableRateLimiting: boolean;
    rateLimitPerMinute: number;
  };
  security: {
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  notifications: {
    emailNotifications: boolean;
    slackWebhook: string;
    discordWebhook: string;
    alertThreshold: number;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'AI Chat Platform',
      siteDescription: 'AI駆動のチャットプラットフォーム',
      maintenanceMode: false,
      registrationEnabled: true,
    },
    ai: {
      model: 'gpt-4',
      maxTokens: 2048,
      temperature: 0.7,
      responseTimeout: 30,
      autoModeration: true,
    },
    chat: {
      maxConcurrentChats: 100,
      chatSessionTimeout: 30,
      enableFiltering: true,
      enableRateLimiting: true,
      rateLimitPerMinute: 60,
    },
    security: {
      requireEmailVerification: true,
      enableTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
    },
    notifications: {
      emailNotifications: true,
      slackWebhook: '',
      discordWebhook: '',
      alertThreshold: 10,
    },
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const updateSetting = (
    category: keyof SystemSettings,
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('設定が保存されました');
    } catch {
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: '一般設定', icon: '⚙️' },
    { id: 'ai', name: 'AI設定', icon: '🤖' },
    { id: 'chat', name: 'チャット設定', icon: '💬' },
    { id: 'security', name: 'セキュリティ', icon: '🔐' },
    { id: 'notifications', name: '通知設定', icon: '🔔' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">一般設定</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">サイト名</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      サイト説明
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) =>
                        updateSetting('general', 'maintenanceMode', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">メンテナンスモード</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.registrationEnabled}
                      onChange={(e) =>
                        updateSetting('general', 'registrationEnabled', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">新規登録を有効にする</label>
                  </div>
                </div>
              </div>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">AI設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AIモデル</label>
                    <select
                      value={settings.ai.model}
                      onChange={(e) => updateSetting('ai', 'model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大トークン数
                    </label>
                    <input
                      type="number"
                      value={settings.ai.maxTokens}
                      onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={settings.ai.temperature}
                      onChange={(e) =>
                        updateSetting('ai', 'temperature', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      応答タイムアウト (秒)
                    </label>
                    <input
                      type="number"
                      value={settings.ai.responseTimeout}
                      onChange={(e) =>
                        updateSetting('ai', 'responseTimeout', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.ai.autoModeration}
                        onChange={(e) => updateSetting('ai', 'autoModeration', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        自動モデレーションを有効にする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Settings */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">チャット設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大同時チャット数
                    </label>
                    <input
                      type="number"
                      value={settings.chat.maxConcurrentChats}
                      onChange={(e) =>
                        updateSetting('chat', 'maxConcurrentChats', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      セッションタイムアウト (分)
                    </label>
                    <input
                      type="number"
                      value={settings.chat.chatSessionTimeout}
                      onChange={(e) =>
                        updateSetting('chat', 'chatSessionTimeout', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      レート制限 (分あたり)
                    </label>
                    <input
                      type="number"
                      value={settings.chat.rateLimitPerMinute}
                      onChange={(e) =>
                        updateSetting('chat', 'rateLimitPerMinute', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.chat.enableFiltering}
                        onChange={(e) => updateSetting('chat', 'enableFiltering', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        コンテンツフィルタリングを有効にする
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.chat.enableRateLimiting}
                        onChange={(e) =>
                          updateSetting('chat', 'enableRateLimiting', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        レート制限を有効にする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">セキュリティ設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      セッションタイムアウト (時間)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        updateSetting('security', 'sessionTimeout', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大ログイン試行回数
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.requireEmailVerification}
                        onChange={(e) =>
                          updateSetting('security', 'requireEmailVerification', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        メール認証を必須にする
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) =>
                          updateSetting('security', 'enableTwoFactor', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        二要素認証を有効にする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">通知設定</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        updateSetting('notifications', 'emailNotifications', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      メール通知を有効にする
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slack Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.notifications.slackWebhook}
                      onChange={(e) =>
                        updateSetting('notifications', 'slackWebhook', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discord Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.notifications.discordWebhook}
                      onChange={(e) =>
                        updateSetting('notifications', 'discordWebhook', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アラート閾値 (エラー数)
                    </label>
                    <input
                      type="number"
                      value={settings.notifications.alertThreshold}
                      onChange={(e) =>
                        updateSetting('notifications', 'alertThreshold', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
