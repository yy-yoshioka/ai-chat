import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface PluginConfig {
  id: string;
  name: string;
  platform: 'webflow' | 'wordpress' | 'shopify' | 'squarespace' | 'custom';
  status: 'active' | 'inactive' | 'pending';
  version: string;
  settings: {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
    customSelector?: string;
    autoLoad: boolean;
    lazyLoad: boolean;
    enableOnPages: 'all' | 'specific' | 'exclude';
    pageRules: string[];
    theme: string;
    customCSS: string;
  };
  installation: {
    method: 'embed' | 'plugin' | 'api';
    code: string;
    instructions: string[];
  };
  analytics: {
    installs: number;
    activeUsers: number;
    conversions: number;
    lastUpdated: string;
  };
}

const PluginsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [plugins, setPlugins] = useState<PluginConfig[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'webflow' | 'wordpress' | 'custom'>(
    'overview'
  );

  useEffect(() => {
    loadPlugins();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlugins = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/plugins`);
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const savePlugins = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/plugins`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plugins),
      });

      if (response.ok) {
        alert('プラグイン設定が保存されました！');
      }
    } catch (error) {
      console.error('Failed to save plugins:', error);
      alert('保存に失敗しました');
    }
  };

  const generateWebflowCode = () => {
    return `<!-- AI Chat Webflow Integration -->
<script>
  window.aiChatConfig = {
    orgId: '${id}',
    platform: 'webflow',
    autoLoad: true,
    position: 'bottom-right',
    theme: {
      primary: '#3B82F6',
      borderRadius: 8
    }
  };
</script>
<script src="https://cdn.ai-chat.jp/widget.js"></script>

<!-- Optional: Custom positioning -->
<style>
  .ai-chat-launcher {
    bottom: 20px !important;
    right: 20px !important;
  }
  
  /* Webflow responsive adjustments */
  @media screen and (max-width: 479px) {
    .ai-chat-widget {
      width: calc(100vw - 20px) !important;
      right: 10px !important;
    }
  }
</style>`;
  };

  const generateWordPressCode = () => {
    return `<?php
/**
 * AI Chat WordPress Plugin Integration
 * Add this to your theme's functions.php or create a custom plugin
 */

// Add AI Chat script to footer
function ai_chat_add_widget() {
    ?>
    <script>
      window.aiChatConfig = {
        orgId: '<?php echo esc_js('${id}'); ?>',
        platform: 'wordpress',
        autoLoad: <?php echo is_user_logged_in() ? 'true' : 'true'; ?>,
        userId: '<?php echo is_user_logged_in() ? get_current_user_id() : ''; ?>',
        userEmail: '<?php echo is_user_logged_in() ? wp_get_current_user()->user_email : ''; ?>',
        theme: {
          primary: '<?php echo get_theme_mod('ai_chat_primary_color', '#3B82F6'); ?>'
        }
      };
    </script>
    <script src="https://cdn.ai-chat.jp/widget.js"></script>
    <?php
}
add_action('wp_footer', 'ai_chat_add_widget');

// Add customizer options
function ai_chat_customize_register($wp_customize) {
    $wp_customize->add_section('ai_chat_settings', array(
        'title' => __('AI Chat Settings'),
        'priority' => 30,
    ));
    
    $wp_customize->add_setting('ai_chat_primary_color', array(
        'default' => '#3B82F6',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'ai_chat_primary_color', array(
        'label' => __('Primary Color'),
        'section' => 'ai_chat_settings',
        'settings' => 'ai_chat_primary_color',
    )));
}
add_action('customize_register', 'ai_chat_customize_register');

// Admin settings page
function ai_chat_admin_menu() {
    add_options_page(
        'AI Chat Settings',
        'AI Chat',
        'manage_options',
        'ai-chat-settings',
        'ai_chat_admin_page'
    );
}
add_action('admin_menu', 'ai_chat_admin_menu');

function ai_chat_admin_page() {
    ?>
    <div class="wrap">
        <h1>AI Chat Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('ai_chat_settings');
            do_settings_sections('ai_chat_settings');
            ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Organization ID</th>
                    <td><input type="text" name="ai_chat_org_id" value="<?php echo esc_attr(get_option('ai_chat_org_id', '${id}')); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Enable on Pages</th>
                    <td>
                        <select name="ai_chat_page_rules">
                            <option value="all">All Pages</option>
                            <option value="home">Home Page Only</option>
                            <option value="posts">Posts Only</option>
                            <option value="pages">Pages Only</option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
?>`;
  };

  const generateShortcode = () => {
    return `// WordPress Shortcode Support
function ai_chat_shortcode($atts) {
    $atts = shortcode_atts(array(
        'theme' => 'default',
        'position' => 'bottom-right',
        'size' => 'normal'
    ), $atts);
    
    ob_start();
    ?>
    <div id="ai-chat-<?php echo uniqid(); ?>" class="ai-chat-shortcode"></div>
    <script>
      AiChat.create({
        theme: '<?php echo esc_js($atts['theme']); ?>',
        position: '<?php echo esc_js($atts['position']); ?>',
        size: '<?php echo esc_js($atts['size']); ?>'
      }, document.querySelector('.ai-chat-shortcode:last-child'));
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('ai_chat', 'ai_chat_shortcode');

// Usage examples:
// [ai_chat]
// [ai_chat theme="dark" position="bottom-left"]
// [ai_chat size="compact"]`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">プラットフォーム連携</h1>
            <p className="text-gray-600 mt-1">
              Webflow、WordPress、その他のプラットフォーム向けプラグイン
            </p>
          </div>
          <button
            onClick={savePlugins}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
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
                <p className="text-sm font-medium text-gray-600">アクティブプラグイン</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plugins.filter((p) => p.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">総インストール数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plugins.reduce((total, p) => total + p.analytics.installs, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plugins.reduce((total, p) => total + p.analytics.activeUsers, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総コンバージョン</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plugins.reduce((total, p) => total + p.analytics.conversions, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '📋 概要', desc: 'プラットフォーム一覧' },
              { key: 'webflow', label: '🌊 Webflow', desc: 'ノーコード統合' },
              { key: 'wordpress', label: '📝 WordPress', desc: 'プラグイン & テーマ' },
              { key: 'custom', label: '⚙️ カスタム', desc: 'その他のプラットフォーム' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'overview' | 'webflow' | 'wordpress' | 'custom')
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

        {/* 概要タブ */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* プラットフォーム一覧 */}
            <div className="lg:col-span-2 space-y-4">
              {[
                {
                  platform: 'webflow',
                  name: 'Webflow',
                  icon: '🌊',
                  description: 'ノーコードWebサイトビルダー',
                  status: 'ready',
                  features: ['ドラッグ&ドロップ設置', 'レスポンシブ対応', 'カスタムCSS'],
                },
                {
                  platform: 'wordpress',
                  name: 'WordPress',
                  icon: '📝',
                  description: '世界最大のCMSプラットフォーム',
                  status: 'ready',
                  features: ['プラグイン形式', 'ショートコード対応', '管理画面統合'],
                },
                {
                  platform: 'shopify',
                  name: 'Shopify',
                  icon: '🛒',
                  description: 'ECプラットフォーム',
                  status: 'beta',
                  features: ['商品ページ連携', '購入フロー統合', '顧客データ同期'],
                },
                {
                  platform: 'squarespace',
                  name: 'Squarespace',
                  icon: '⬜',
                  description: 'オールインワンWebサイトビルダー',
                  status: 'coming',
                  features: ['コードブロック挿入', 'テンプレート対応', 'アナリティクス'],
                },
              ].map((item) => (
                <div key={item.platform} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'beta'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status === 'ready' && '利用可能'}
                        {item.status === 'beta' && 'ベータ版'}
                        {item.status === 'coming' && '準備中'}
                      </span>
                      {item.status === 'ready' && (
                        <button
                          onClick={() =>
                            setSelectedTab(
                              item.platform as 'overview' | 'webflow' | 'wordpress' | 'custom'
                            )
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          設定
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* インストールガイド */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 インストールガイド</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">1. プラットフォーム選択</h4>
                    <p className="text-sm text-gray-600">使用するプラットフォームのタブを選択</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">2. 設定カスタマイズ</h4>
                    <p className="text-sm text-gray-600">表示位置やテーマを調整</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">3. コード取得</h4>
                    <p className="text-sm text-gray-600">生成されたコードをコピー</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">4. サイトに埋め込み</h4>
                    <p className="text-sm text-gray-600">プラットフォームに応じて設置</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 ヒント</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• テスト環境での動作確認を推奨</li>
                  <li>• モバイル表示も確認してください</li>
                  <li>• カスタムCSSで細かい調整が可能</li>
                  <li>• 複数ページでの一括設定が効率的</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Webflowタブ */}
        {selectedTab === 'webflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌊 Webflow 設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">表示位置</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="bottom-right">右下（推奨）</option>
                      <option value="bottom-left">左下</option>
                      <option value="top-right">右上</option>
                      <option value="custom">カスタム位置</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">自動読み込み</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm font-medium text-gray-700">遅延読み込み</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カスタムCSS
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg h-24 font-mono text-sm"
                      placeholder="/* Webflow専用スタイル */"
                    />
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Webflow設置手順</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>プロジェクト設定 → カスタムコード を開く</li>
                    <li>
                      &quot;Head Code&quot;または&quot;Footer Code&quot;に下記コードを貼り付け
                    </li>
                    <li>サイトを公開</li>
                    <li>チャットウィジェットの動作を確認</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">生成されたコード</h3>
                <textarea
                  className="w-full h-96 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                  readOnly
                  value={generateWebflowCode()}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generateWebflowCode())}
                  className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  📋 コピー
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WordPressタブ */}
        {selectedTab === 'wordpress' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 設定オプション */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ プラグイン設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表示ページ
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="all">全ページ</option>
                      <option value="home">ホームページのみ</option>
                      <option value="posts">投稿ページのみ</option>
                      <option value="pages">固定ページのみ</option>
                      <option value="custom">カスタム設定</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">
                        ログインユーザー情報を使用
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm font-medium text-gray-700">
                        管理者には表示しない
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ショートコード対応
                    </label>
                    <div className="bg-gray-100 p-2 rounded text-sm font-mono">[ai_chat]</div>
                  </div>
                </div>
              </div>

              {/* functions.phpコード */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">📝 functions.php コード</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateWordPressCode())}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋 コピー
                  </button>
                </div>
                <textarea
                  className="w-full h-96 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                  readOnly
                  value={generateWordPressCode()}
                />
              </div>
            </div>

            {/* ショートコード */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔧 ショートコード対応</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generateShortcode())}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  📋 コピー
                </button>
              </div>
              <textarea
                className="w-full h-64 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                readOnly
                value={generateShortcode()}
              />

              <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">使用例</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div>
                    <code>[ai_chat]</code> - デフォルト設定で表示
                  </div>
                  <div>
                    <code>[ai_chat theme=&quot;dark&quot;]</code> - ダークテーマで表示
                  </div>
                  <div>
                    <code>[ai_chat position=&quot;bottom-left&quot; size=&quot;compact&quot;]</code>{' '}
                    - 位置とサイズを指定
                  </div>
                </div>
              </div>
            </div>

            {/* インストールガイド */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📚 WordPressインストールガイド
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">方法1: functions.phpに追加</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>WordPressダッシュボード → 外観 → テーマエディター</li>
                    <li>functions.phpファイルを選択</li>
                    <li>上記のPHPコードを最後に追加</li>
                    <li>「ファイルを更新」をクリック</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">方法2: カスタムプラグイン</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>新しいPHPファイルを作成</li>
                    <li>プラグインヘッダーを追加</li>
                    <li>上記のコードを挿入</li>
                    <li>plugins フォルダにアップロード</li>
                    <li>管理画面でプラグインを有効化</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* カスタムタブ */}
        {selectedTab === 'custom' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ カスタム統合</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      プラットフォーム
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="shopify">Shopify</option>
                      <option value="squarespace">Squarespace</option>
                      <option value="wix">Wix</option>
                      <option value="ghost">Ghost</option>
                      <option value="custom">その他のHTML/JS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">統合方法</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="integration" value="embed" defaultChecked />
                        <span className="text-sm text-gray-700">埋め込みコード</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="integration" value="api" />
                        <span className="text-sm text-gray-700">API統合</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="integration" value="iframe" />
                        <span className="text-sm text-gray-700">iframe埋め込み</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カスタムセレクタ
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="例: #chat-container, .help-section"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">🚧 その他のプラットフォーム</h4>
                <div className="space-y-2 text-sm text-orange-800">
                  <div>
                    <strong>Shopify:</strong> 商品ページ・カート連携対応予定
                  </div>
                  <div>
                    <strong>Squarespace:</strong> コードブロック経由での統合
                  </div>
                  <div>
                    <strong>Wix:</strong> HTML埋め込み要素での設置
                  </div>
                  <div>
                    <strong>その他:</strong> 汎用的なJavaScript統合
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">汎用埋め込みコード</h3>
              <textarea
                className="w-full h-64 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                readOnly
                value={`<!-- AI Chat 汎用埋め込みコード -->
<script>
  window.aiChatConfig = {
    orgId: '${id}',
    platform: 'custom',
    // カスタム設定
    position: 'bottom-right',
    theme: {
      primary: '#3B82F6',
      background: '#FFFFFF'
    },
    // プラットフォーム固有の設定
    customSettings: {
      selector: '#custom-chat-container',
      lazyLoad: true,
      mobileOptimized: true
    }
  };
</script>
<script src="https://cdn.ai-chat.jp/widget.js"></script>

<!-- オプション: 特定の要素にアタッチ -->
<div id="custom-chat-container"></div>
<script>
  // 特定の要素にチャットを配置
  document.addEventListener('DOMContentLoaded', function() {
    AiChat.attachToElement('#custom-chat-container', {
      instanceId: 'custom-widget'
    });
  });
</script>`}
              />
              <button
                onClick={() =>
                  navigator.clipboard.writeText(`<!-- AI Chat 汎用埋め込みコード -->
<script>
  window.aiChatConfig = {
    orgId: '${id}',
    platform: 'custom',
    position: 'bottom-right',
    theme: {
      primary: '#3B82F6',
      background: '#FFFFFF'
    }
  };
</script>
<script src="https://cdn.ai-chat.jp/widget.js"></script>`)
                }
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                📋 コピー
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PluginsPage;
