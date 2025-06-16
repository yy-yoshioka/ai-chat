import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface PWAConfig {
  enabled: boolean;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  startUrl: string;
  scope: string;
  icons: {
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }[];
  offlinePages: string[];
  cachingStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

interface ReactNativeSDK {
  version: string;
  platform: 'ios' | 'android' | 'expo';
  packageName: string;
  bundleId: string;
  downloadUrl: string;
  documentation: string;
  sampleApp: string;
  features: {
    chat: boolean;
    pushNotifications: boolean;
    offline: boolean;
    analytics: boolean;
    customization: boolean;
  };
  configuration: {
    apiKey: string;
    baseUrl: string;
    organizationId: string;
    theme: Record<string, string>;
  };
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  target: 'all' | 'segment' | 'user';
  targetValue?: string;
  scheduled: boolean;
  scheduledTime?: string;
  sent: boolean;
  sentAt?: string;
  deliveryRate: number;
  clickRate: number;
}

interface MobileAnalytics {
  totalInstalls: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  engagement: {
    sessionDuration: number;
    screenViews: number;
    messagesExchanged: number;
  };
  performance: {
    loadTime: number;
    crashRate: number;
    responseTime: number;
  };
  platforms: {
    ios: number;
    android: number;
    pwa: number;
  };
}

const MobileSDKPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'pwa' | 'react-native' | 'push' | 'analytics'>(
    'pwa'
  );
  const [pwaConfig, setPwaConfig] = useState<PWAConfig>({
    enabled: false,
    name: 'AI Chat',
    shortName: 'AI Chat',
    description: 'AI-powered customer support chat',
    themeColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    display: 'standalone',
    orientation: 'any',
    startUrl: '/',
    scope: '/',
    icons: [],
    offlinePages: ['/chat', '/help'],
    cachingStrategy: 'stale-while-revalidate',
  });
  const [reactNativeSDKs, setReactNativeSDKs] = useState<ReactNativeSDK[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [analytics, setAnalytics] = useState<MobileAnalytics | null>(null);
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);

  useEffect(() => {
    loadMobileData();
  }, [id]);

  const loadMobileData = async () => {
    try {
      const [pwaResponse, sdkResponse, pushResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/mobile/pwa-config`),
        fetch(`/api/organizations/${id}/mobile/react-native-sdks`),
        fetch(`/api/organizations/${id}/mobile/push-notifications`),
        fetch(`/api/organizations/${id}/mobile/analytics`),
      ]);

      if (pwaResponse.ok) {
        const pwaData = await pwaResponse.json();
        setPwaConfig(pwaData);
      }

      if (sdkResponse.ok) {
        const sdkData = await sdkResponse.json();
        setReactNativeSDKs(sdkData);
      }

      if (pushResponse.ok) {
        const pushData = await pushResponse.json();
        setPushNotifications(pushData);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load mobile data:', error);
    }
  };

  const updatePWAConfig = (updates: Partial<PWAConfig>) => {
    setPwaConfig((prev) => ({ ...prev, ...updates }));
  };

  const generatePWAManifest = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/mobile/pwa/generate-manifest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwaConfig),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manifest.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('マニフェストファイルをダウンロードしました');
      }
    } catch (error) {
      console.error('Failed to generate PWA manifest:', error);
      alert('マニフェスト生成に失敗しました');
    }
  };

  const downloadSDK = async (platform: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/mobile/sdk/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, organizationId: id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-${platform}-sdk.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`${platform} SDKをダウンロードしました`);
      }
    } catch (error) {
      console.error('Failed to download SDK:', error);
      alert('SDKダウンロードに失敗しました');
    }
  };

  const createPushNotification = () => {
    const newNotification: PushNotification = {
      id: `push-${Date.now()}`,
      title: 'New Notification',
      body: 'This is a test notification',
      target: 'all',
      scheduled: false,
      sent: false,
      deliveryRate: 0,
      clickRate: 0,
    };

    setPushNotifications((prev) => [...prev, newNotification]);
    setIsCreatingNotification(false);
  };

  const sendPushNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/mobile/push-notifications/${notificationId}/send`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setPushNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, sent: true, sentAt: new Date().toISOString() }
              : notif
          )
        );
        alert('プッシュ通知を送信しました');
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      alert('プッシュ通知の送信に失敗しました');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
        return '🍎';
      case 'android':
        return '🤖';
      case 'expo':
        return '⚡';
      default:
        return '📱';
    }
  };

  return (
    <AdminLayout
      title="PWA & React-Native SDK"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: 'モバイルSDK', href: `/admin/org/${id}/mobile-sdk` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PWA & React-Native SDK</h1>
            <p className="text-gray-600 mt-1">モバイルアプリ・PWA・SDK管理・プッシュ通知</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generatePWAManifest}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              📋 PWAマニフェスト生成
            </button>
            <button
              onClick={() => setIsCreatingNotification(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📱 プッシュ通知作成
            </button>
          </div>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総インストール数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalInstalls.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">月間アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.activeUsers.monthly.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">メッセージ交換数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.engagement.messagesExchanged.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">プッシュ通知数</p>
                <p className="text-2xl font-bold text-gray-900">{pushNotifications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pwa', label: '🌐 PWA', desc: 'Progressive Web App' },
              { key: 'react-native', label: '📱 React Native', desc: 'ネイティブアプリSDK' },
              { key: 'push', label: '📬 プッシュ通知', desc: 'モバイル通知管理' },
              { key: 'analytics', label: '📊 分析', desc: 'モバイルアプリ分析' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as 'pwa' | 'react-native' | 'push' | 'analytics')}
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

        {/* PWAタブ */}
        {selectedTab === 'pwa' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PWA設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pwaConfig.enabled}
                      onChange={(e) => updatePWAConfig({ enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">PWAを有効化</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">アプリ名</label>
                    <input
                      type="text"
                      value={pwaConfig.name}
                      onChange={(e) => updatePWAConfig({ name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">短縮名</label>
                    <input
                      type="text"
                      value={pwaConfig.shortName}
                      onChange={(e) => updatePWAConfig({ shortName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                  <textarea
                    value={pwaConfig.description}
                    onChange={(e) => updatePWAConfig({ description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      テーマカラー
                    </label>
                    <input
                      type="color"
                      value={pwaConfig.themeColor}
                      onChange={(e) => updatePWAConfig({ themeColor: e.target.value })}
                      className="w-full h-10 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">背景色</label>
                    <input
                      type="color"
                      value={pwaConfig.backgroundColor}
                      onChange={(e) => updatePWAConfig({ backgroundColor: e.target.value })}
                      className="w-full h-10 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表示モード
                    </label>
                    <select
                      value={pwaConfig.display}
                      onChange={(e) => updatePWAConfig({ display: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="standalone">Standalone</option>
                      <option value="fullscreen">Fullscreen</option>
                      <option value="minimal-ui">Minimal UI</option>
                      <option value="browser">Browser</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画面向き</label>
                    <select
                      value={pwaConfig.orientation}
                      onChange={(e) => updatePWAConfig({ orientation: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="any">Any</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    キャッシング戦略
                  </label>
                  <select
                    value={pwaConfig.cachingStrategy}
                    onChange={(e) => updatePWAConfig({ cachingStrategy: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="cache-first">Cache First</option>
                    <option value="network-first">Network First</option>
                    <option value="stale-while-revalidate">Stale While Revalidate</option>
                  </select>
                </div>

                <button
                  onClick={generatePWAManifest}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📋 マニフェストファイル生成
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PWAプレビュー</h3>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="bg-white rounded-lg shadow-md p-4 max-w-sm mx-auto">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: pwaConfig.themeColor }}
                    >
                      {pwaConfig.shortName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{pwaConfig.name}</h4>
                      <p className="text-sm text-gray-600">{pwaConfig.shortName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{pwaConfig.description}</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm">
                      インストール
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm">
                      開く
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">設定詳細</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <pre>
                    {JSON.stringify(
                      {
                        name: pwaConfig.name,
                        short_name: pwaConfig.shortName,
                        description: pwaConfig.description,
                        start_url: pwaConfig.startUrl,
                        display: pwaConfig.display,
                        theme_color: pwaConfig.themeColor,
                        background_color: pwaConfig.backgroundColor,
                        orientation: pwaConfig.orientation,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* React Native タブ */}
        {selectedTab === 'react-native' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { platform: 'ios', name: 'iOS SDK', description: 'Swift/Objective-C対応' },
                { platform: 'android', name: 'Android SDK', description: 'Java/Kotlin対応' },
                { platform: 'expo', name: 'Expo SDK', description: 'Expo Managed Workflow' },
              ].map((sdk) => (
                <div key={sdk.platform} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{getPlatformIcon(sdk.platform)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{sdk.name}</h3>
                      <p className="text-sm text-gray-600">{sdk.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium text-gray-900 mb-2">機能</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>チャット機能</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>プッシュ通知</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>オフライン対応</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>カスタマイズ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>分析機能</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => downloadSDK(sdk.platform)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📦 SDK ダウンロード
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        📚 ドキュメント
                      </button>
                      <button className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        🎯 サンプルアプリ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* インストール手順 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">インストール手順</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🍎 iOS</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <pre>{`# CocoaPods
pod 'AIChatSDK'

# Swift Package Manager
.package(url: "https://github.com/ai-chat/ios-sdk.git", from: "1.0.0")

# 使用例
import AIChatSDK

let chat = AIChatSDK(
  apiKey: "your-api-key",
  organizationId: "${id}"
)
chat.initialize()`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🤖 Android</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <pre>{`// build.gradle
implementation 'com.ai-chat:android-sdk:1.0.0'

// 使用例
import com.aichat.sdk.AIChatSDK;

AIChatSDK chat = new AIChatSDK.Builder()
  .apiKey("your-api-key")
  .organizationId("${id}")
  .build();
  
chat.initialize(this);`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">⚡ Expo</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <pre>{`# インストール
npm install @ai-chat/expo-sdk

# 使用例
import { AIChatSDK } from '@ai-chat/expo-sdk';

const chat = new AIChatSDK({
  apiKey: 'your-api-key',
  organizationId: '${id}'
});

await chat.initialize();`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* プッシュ通知タブ */}
        {selectedTab === 'push' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">プッシュ通知管理</h3>
              <button
                onClick={() => setIsCreatingNotification(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 通知作成
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pushNotifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        対象: {notification.target}
                        {notification.targetValue && ` (${notification.targetValue})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.sent && (
                        <button
                          onClick={() => sendPushNotification(notification.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          送信
                        </button>
                      )}
                      {notification.sent && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          送信済み
                        </span>
                      )}
                    </div>
                  </div>

                  {notification.sent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-600">送信日時</p>
                        <p className="text-sm text-blue-900">
                          {notification.sentAt && new Date(notification.sentAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm font-medium text-green-600">配信率</p>
                        <p className="text-sm text-green-900">
                          {notification.deliveryRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-sm font-medium text-purple-600">クリック率</p>
                        <p className="text-sm text-purple-900">
                          {notification.clickRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {pushNotifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📬</span>
                  <p>プッシュ通知がありません</p>
                  <p className="text-sm">「通知作成」から新しい通知を作成してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 分析タブ */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">アクティブユーザー</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">日間アクティブユーザー</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.activeUsers.daily.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.activeUsers.daily / analytics.activeUsers.monthly) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">週間アクティブユーザー</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.activeUsers.weekly.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.activeUsers.weekly / analytics.activeUsers.monthly) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">月間アクティブユーザー</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.activeUsers.monthly.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">プラットフォーム別</h3>
                    <div className="space-y-4">
                      {Object.entries(analytics.platforms).map(([platform, count]) => (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPlatformIcon(platform)}</span>
                            <span className="text-sm text-gray-600 capitalize">{platform}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(count / analytics.totalInstalls) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-16 text-right">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">エンゲージメント</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-600">平均セッション時間</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Math.round(analytics.engagement.sessionDuration / 60)}分
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-600">画面ビュー数</p>
                        <p className="text-2xl font-bold text-green-900">
                          {analytics.engagement.screenViews.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-600">メッセージ交換数</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {analytics.engagement.messagesExchanged.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">パフォーマンス</h3>
                    <div className="space-y-4">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-orange-600">平均読み込み時間</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {analytics.performance.loadTime}ms
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-red-600">クラッシュ率</p>
                        <p className="text-2xl font-bold text-red-900">
                          {analytics.performance.crashRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-indigo-600">API応答時間</p>
                        <p className="text-2xl font-bold text-indigo-900">
                          {analytics.performance.responseTime}ms
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!analytics && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📊</span>
                <p>分析データを読み込み中...</p>
              </div>
            )}
          </div>
        )}

        {/* プッシュ通知作成モーダル */}
        {isCreatingNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">プッシュ通知作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="通知タイトル"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg h-20"
                    placeholder="通知メッセージ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">送信対象</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="all">全ユーザー</option>
                    <option value="segment">セグメント</option>
                    <option value="user">特定ユーザー</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">スケジュール送信</span>
                  </label>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createPushNotification}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingNotification(false)}
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

export default MobileSDKPage;
