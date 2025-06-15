import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'ai' | 'integration' | 'analytics' | 'utility' | 'ui';
  status: 'active' | 'inactive' | 'development';
  rating: number;
  downloads: number;
  price: number;
  type: 'free' | 'paid' | 'freemium';
  features: string[];
  screenshots: string[];
  documentation: string;
  manifest: PluginManifest;
  createdAt: string;
  updatedAt: string;
}

interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  permissions: string[];
  hooks: string[];
  api: {
    version: string;
    endpoints: string[];
  };
  dependencies: { [key: string]: string };
}

interface CustomPlugin {
  id: string;
  name: string;
  description: string;
  status: 'development' | 'testing' | 'published';
  code: string;
  manifest: PluginManifest;
  testResults: TestResult[];
}

interface TestResult {
  id: string;
  test: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  timestamp: string;
}

const MarketplacePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'installed' | 'develop' | 'sdk'>(
    'marketplace'
  );
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [customPlugins, setCustomPlugins] = useState<CustomPlugin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { key: 'all', label: 'すべて', icon: '🔍' },
    { key: 'ai', label: 'AI・機械学習', icon: '🤖' },
    { key: 'integration', label: '外部連携', icon: '🔗' },
    { key: 'analytics', label: '分析・レポート', icon: '📊' },
    { key: 'utility', label: 'ユーティリティ', icon: '🛠️' },
    { key: 'ui', label: 'UI・UX', icon: '🎨' },
  ];

  useEffect(() => {
    loadMarketplaceData();
  }, [id]);

  const loadMarketplaceData = async () => {
    try {
      const [pluginsResponse, installedResponse, customResponse] = await Promise.all([
        fetch(`/api/marketplace/plugins`),
        fetch(`/api/organizations/${id}/plugins/installed`),
        fetch(`/api/organizations/${id}/plugins/custom`),
      ]);

      if (pluginsResponse.ok) {
        const pluginsData = await pluginsResponse.json();
        setPlugins(pluginsData);
      }

      if (installedResponse.ok) {
        const installedData = await installedResponse.json();
        setInstalledPlugins(installedData);
      }

      if (customResponse.ok) {
        const customData = await customResponse.json();
        setCustomPlugins(customData);
      }
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    }
  };

  const installPlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/plugins/${pluginId}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('プラグインがインストールされました！');
        loadMarketplaceData();
      }
    } catch (error) {
      console.error('Failed to install plugin:', error);
      alert('インストールに失敗しました');
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/plugins/${pluginId}/uninstall`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('プラグインがアンインストールされました');
        loadMarketplaceData();
      }
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      alert('アンインストールに失敗しました');
    }
  };

  const createCustomPlugin = () => {
    const newPlugin: CustomPlugin = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Plugin',
      description: 'カスタムプラグインの説明',
      status: 'development',
      code: getDefaultPluginCode(),
      manifest: {
        name: 'new-custom-plugin',
        version: '1.0.0',
        description: 'カスタムプラグインの説明',
        main: 'index.js',
        permissions: ['messages.read', 'messages.write'],
        hooks: ['onMessage', 'onConversationStart'],
        api: {
          version: '1.0',
          endpoints: ['/plugin/webhook'],
        },
        dependencies: {},
      },
      testResults: [],
    };

    setCustomPlugins((prev) => [...prev, newPlugin]);
  };

  const getDefaultPluginCode = () => {
    return `// AI Chat Plugin
// SDK Documentation: https://docs.ai-chat.jp/plugins

class MyCustomPlugin {
  constructor(api) {
    this.api = api;
  }

  // プラグイン初期化
  async onInit() {
    console.log('Plugin initialized');
  }

  // メッセージ受信時の処理
  async onMessage(message) {
    // メッセージを処理
    if (message.content.includes('hello')) {
      await this.api.sendMessage({
        content: 'Hello! How can I help you?',
        conversationId: message.conversationId
      });
    }
  }

  // 会話開始時の処理
  async onConversationStart(conversation) {
    await this.api.sendMessage({
      content: 'Welcome! I\\'m here to help.',
      conversationId: conversation.id
    });
  }

  // プラグイン終了処理
  async onDestroy() {
    console.log('Plugin destroyed');
  }
}

// プラグインをエクスポート
module.exports = MyCustomPlugin;`;
  };

  const generateSDKDocs = () => {
    return `# AI Chat Plugin SDK Documentation

## 概要
AI Chat Plugin SDKを使用して、チャットボットの機能を拡張するプラグインを開発できます。

## セットアップ

### 1. プラグインの基本構造
\`\`\`javascript
class MyPlugin {
  constructor(api) {
    this.api = api;
  }

  async onInit() {
    // 初期化処理
  }

  async onMessage(message) {
    // メッセージ処理
  }
}

module.exports = MyPlugin;
\`\`\`

### 2. Manifest ファイル
\`\`\`json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "main": "index.js",
  "permissions": [
    "messages.read",
    "messages.write",
    "users.read"
  ],
  "hooks": [
    "onMessage",
    "onConversationStart",
    "onConversationEnd"
  ]
}
\`\`\`

## API リファレンス

### メッセージ API
\`\`\`javascript
// メッセージ送信
await this.api.sendMessage({
  content: 'Hello!',
  conversationId: 'conv_123',
  metadata: { source: 'plugin' }
});

// メッセージ取得
const messages = await this.api.getMessages(conversationId, {
  limit: 10,
  offset: 0
});
\`\`\`

### ユーザー API
\`\`\`javascript
// ユーザー情報取得
const user = await this.api.getUser(userId);

// ユーザー情報更新
await this.api.updateUser(userId, {
  metadata: { lastPlugin: 'my-plugin' }
});
\`\`\`

### ストレージ API
\`\`\`javascript
// データ保存
await this.api.storage.set('key', 'value');

// データ取得
const value = await this.api.storage.get('key');

// データ削除
await this.api.storage.delete('key');
\`\`\`

## フック

### onMessage
新しいメッセージが受信された時に呼び出されます。

\`\`\`javascript
async onMessage(message) {
  if (message.content.includes('weather')) {
    const weather = await getWeatherData();
    await this.api.sendMessage({
      content: \`Today's weather: \${weather}\`,
      conversationId: message.conversationId
    });
  }
}
\`\`\`

### onConversationStart
新しい会話が開始された時に呼び出されます。

\`\`\`javascript
async onConversationStart(conversation) {
  await this.api.sendMessage({
    content: 'Welcome! How can I help you today?',
    conversationId: conversation.id
  });
}
\`\`\`

## パーミッション

- \`messages.read\` - メッセージの読み取り
- \`messages.write\` - メッセージの送信
- \`users.read\` - ユーザー情報の読み取り
- \`users.write\` - ユーザー情報の更新
- \`analytics.read\` - 分析データの読み取り
- \`storage.read\` - ストレージの読み取り
- \`storage.write\` - ストレージの書き込み

## テスト

### 単体テスト
\`\`\`javascript
describe('MyPlugin', () => {
  it('should respond to hello message', async () => {
    const plugin = new MyPlugin(mockApi);
    await plugin.onMessage({
      content: 'hello',
      conversationId: 'test'
    });
    expect(mockApi.sendMessage).toHaveBeenCalled();
  });
});
\`\`\`

## デプロイ

1. プラグインをテスト
2. マニフェストを確認
3. プラグインマーケットプレイスに公開

## 例：天気プラグイン

\`\`\`javascript
class WeatherPlugin {
  constructor(api) {
    this.api = api;
  }

  async onMessage(message) {
    if (message.content.includes('weather')) {
      try {
        const weather = await this.getWeather();
        await this.api.sendMessage({
          content: \`🌤️ 今日の天気: \${weather.description}、気温: \${weather.temperature}°C\`,
          conversationId: message.conversationId
        });
      } catch (error) {
        await this.api.sendMessage({
          content: '申し訳ございません。天気情報の取得に失敗しました。',
          conversationId: message.conversationId
        });
      }
    }
  }

  async getWeather() {
    // 天気API呼び出し
    const response = await fetch('https://api.weather.com/v1/current');
    return response.json();
  }
}

module.exports = WeatherPlugin;
\`\`\``;
  };

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout
      title="プラグイン・マーケットプレイス"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: 'マーケットプレイス', href: `/admin/org/${id}/marketplace` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">プラグイン・マーケットプレイス</h1>
            <p className="text-gray-600 mt-1">プラグインの検索・インストール・開発</p>
          </div>
          <button
            onClick={createCustomPlugin}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + カスタムプラグイン作成
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">利用可能プラグイン</p>
                <p className="text-2xl font-bold text-gray-900">{plugins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">インストール済み</p>
                <p className="text-2xl font-bold text-gray-900">{installedPlugins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🛠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">開発中</p>
                <p className="text-2xl font-bold text-gray-900">{customPlugins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均評価</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plugins.length > 0
                    ? (plugins.reduce((sum, p) => sum + p.rating, 0) / plugins.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                key: 'marketplace',
                label: '🏪 マーケットプレイス',
                desc: 'プラグイン検索・インストール',
              },
              { key: 'installed', label: '✅ インストール済み', desc: '管理・設定・更新' },
              { key: 'develop', label: '🛠️ 開発', desc: 'カスタムプラグイン開発' },
              { key: 'sdk', label: '📚 SDK', desc: 'ドキュメント・API' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'marketplace' | 'installed' | 'develop' | 'sdk')
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

        {/* マーケットプレイスタブ */}
        {selectedTab === 'marketplace' && (
          <div className="space-y-6">
            {/* 検索・フィルター */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="プラグインを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* カテゴリバッジ */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === category.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* プラグイン一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map((plugin) => (
                <div key={plugin.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                      <p className="text-sm text-gray-600">{plugin.author}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium">{plugin.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{plugin.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          plugin.category === 'ai'
                            ? 'bg-purple-100 text-purple-700'
                            : plugin.category === 'integration'
                              ? 'bg-blue-100 text-blue-700'
                              : plugin.category === 'analytics'
                                ? 'bg-green-100 text-green-700'
                                : plugin.category === 'utility'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {plugin.category}
                      </span>
                      <span className="text-sm text-gray-500">v{plugin.version}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {plugin.downloads.toLocaleString()} DL
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">機能:</div>
                    <div className="flex flex-wrap gap-1">
                      {plugin.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {plugin.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{plugin.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      {plugin.price === 0 ? 'Free' : `¥${plugin.price}`}
                    </div>
                    <button
                      onClick={() => installPlugin(plugin.id)}
                      disabled={installedPlugins.some((p) => p.id === plugin.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        installedPlugins.some((p) => p.id === plugin.id)
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {installedPlugins.some((p) => p.id === plugin.id)
                        ? 'インストール済み'
                        : 'インストール'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlugins.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-lg">該当するプラグインが見つかりませんでした</p>
                <p className="text-sm">検索条件を変更してお試しください</p>
              </div>
            )}
          </div>
        )}

        {/* インストール済みタブ */}
        {selectedTab === 'installed' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {installedPlugins.map((plugin) => (
                <div key={plugin.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                        <p className="text-sm text-gray-600">{plugin.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          plugin.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {plugin.status}
                      </span>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                        設定
                      </button>
                      <button
                        onClick={() => uninstallPlugin(plugin.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {installedPlugins.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📦</span>
                  <p className="text-lg">インストール済みのプラグインがありません</p>
                  <p className="text-sm">
                    マーケットプレイスからプラグインをインストールしてください
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 開発タブ */}
        {selectedTab === 'develop' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {customPlugins.map((plugin) => (
                <div key={plugin.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                      <p className="text-sm text-gray-600">{plugin.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          plugin.status === 'development'
                            ? 'bg-yellow-100 text-yellow-700'
                            : plugin.status === 'testing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {plugin.status}
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        編集
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                        テスト
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">マニフェスト</h4>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(plugin.manifest, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">テスト結果</h4>
                      <div className="space-y-2">
                        {plugin.testResults.map((test) => (
                          <div key={test.id} className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                test.status === 'passed'
                                  ? 'bg-green-500'
                                  : test.status === 'failed'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                              }`}
                            />
                            <span className="text-sm text-gray-700">{test.test}</span>
                          </div>
                        ))}
                        {plugin.testResults.length === 0 && (
                          <p className="text-sm text-gray-500">テストを実行してください</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {customPlugins.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🛠️</span>
                  <p className="text-lg">カスタムプラグインがありません</p>
                  <p className="text-sm">
                    「カスタムプラグイン作成」ボタンから開発を始めてください
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SDKタブ */}
        {selectedTab === 'sdk' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 ドキュメント</h3>
                <nav className="space-y-2">
                  <a href="#overview" className="block text-blue-600 hover:text-blue-800 text-sm">
                    概要
                  </a>
                  <a href="#setup" className="block text-blue-600 hover:text-blue-800 text-sm">
                    セットアップ
                  </a>
                  <a href="#api" className="block text-blue-600 hover:text-blue-800 text-sm">
                    API リファレンス
                  </a>
                  <a href="#hooks" className="block text-blue-600 hover:text-blue-800 text-sm">
                    フック
                  </a>
                  <a
                    href="#permissions"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    パーミッション
                  </a>
                  <a href="#testing" className="block text-blue-600 hover:text-blue-800 text-sm">
                    テスト
                  </a>
                  <a href="#examples" className="block text-blue-600 hover:text-blue-800 text-sm">
                    例
                  </a>
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">リンク</h4>
                  <div className="space-y-2">
                    <a
                      href="https://github.com/ai-chat/plugin-examples"
                      className="block text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📁 サンプルコード
                    </a>
                    <a
                      href="https://discord.gg/ai-chat-dev"
                      className="block text-blue-600 hover:text-blue-800 text-sm"
                    >
                      💬 開発者コミュニティ
                    </a>
                    <a
                      href="https://docs.ai-chat.jp/plugins"
                      className="block text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📖 完全なドキュメント
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Plugin SDK ドキュメント</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateSDKDocs())}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋 コピー
                  </button>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                    {generateSDKDocs()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MarketplacePage;
