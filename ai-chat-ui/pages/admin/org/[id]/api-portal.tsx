import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'rest' | 'graphql' | 'webhook';
  permissions: string[];
  rateLimit: {
    requests: number;
    window: 'minute' | 'hour' | 'day';
  };
  lastUsed: string;
  totalRequests: number;
  status: 'active' | 'inactive' | 'revoked';
  createdAt: string;
}

interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: string[];
  type: 'web' | 'mobile' | 'server';
  status: 'active' | 'inactive';
  totalAuthorizations: number;
  createdAt: string;
}

const APIPortalPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'rest' | 'graphql' | 'oauth' | 'webhooks'
  >('overview');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [oauthApps, setOAuthApps] = useState<OAuthApp[]>([]);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isCreatingApp, setIsCreatingApp] = useState(false);

  const loadAPIData = useCallback(async () => {
    try {
      const [keysResponse, appsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/api-keys`),
        fetch(`/api/organizations/${id}/oauth-apps`),
      ]);

      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData);
      }

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setOAuthApps(appsData);
      }
    } catch (error) {
      console.error('Failed to load API data:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAPIData();
    }
  }, [id, loadAPIData]);

  const generateAPIKey = () => {
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: `API Key ${apiKeys.length + 1}`,
      key: `ac_live_${Math.random().toString(36).substr(2, 32)}`,
      type: 'rest',
      permissions: ['read', 'write'],
      rateLimit: { requests: 1000, window: 'hour' },
      lastUsed: 'Never',
      totalRequests: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setApiKeys((prev) => [...prev, newKey]);
    setIsCreatingKey(false);
  };

  const createOAuthApp = () => {
    const newApp: OAuthApp = {
      id: `app-${Date.now()}`,
      name: `OAuth App ${oauthApps.length + 1}`,
      clientId: `ac_${Math.random().toString(36).substr(2, 16)}`,
      clientSecret: `acs_${Math.random().toString(36).substr(2, 32)}`,
      redirectUris: ['http://localhost:3000/callback'],
      scopes: ['read', 'write'],
      type: 'web',
      status: 'active',
      totalAuthorizations: 0,
      createdAt: new Date().toISOString(),
    };

    setOAuthApps((prev) => [...prev, newApp]);
    setIsCreatingApp(false);
  };

  const generateRESTDocs = () => {
    return `# AI Chat REST API Documentation

## Base URL
\`https://api.ai-chat.jp/v1\`

## Authentication
Include your API key in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### Messages
#### Send Message
\`\`\`http
POST /organizations/${id}/messages
Content-Type: application/json

{
  "content": "Hello, how can I help?",
  "userId": "user_123",
  "metadata": {
    "source": "api"
  }
}
\`\`\`

#### Get Conversations
\`\`\`http
GET /organizations/${id}/conversations?limit=50&offset=0
\`\`\`

### Users
#### Create User
\`\`\`http
POST /organizations/${id}/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "plan": "premium"
  }
}
\`\`\`

### Analytics
#### Get Usage Stats
\`\`\`http
GET /organizations/${id}/analytics/usage?period=30d
\`\`\`

## Rate Limits
- 1000 requests per hour for standard keys
- 10000 requests per hour for premium keys

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error`;
  };

  const generateGraphQLDocs = () => {
    return `# AI Chat GraphQL API

## Endpoint
\`https://api.ai-chat.jp/graphql\`

## Authentication
Include your API key in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Schema

### Types
\`\`\`graphql
type Message {
  id: ID!
  content: String!
  userId: String!
  createdAt: DateTime!
  metadata: JSON
}

type User {
  id: ID!
  email: String!
  name: String
  metadata: JSON
  createdAt: DateTime!
}

type Conversation {
  id: ID!
  userId: String!
  messages: [Message!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
\`\`\`

### Queries
\`\`\`graphql
type Query {
  # Get conversations
  conversations(
    limit: Int = 50
    offset: Int = 0
    userId: String
  ): [Conversation!]!
  
  # Get messages
  messages(
    conversationId: ID!
    limit: Int = 50
    offset: Int = 0
  ): [Message!]!
  
  # Get user
  user(id: ID!): User
  
  # Get analytics
  analytics(
    period: String! = "30d"
    metrics: [String!]!
  ): AnalyticsResult!
}
\`\`\`

### Mutations
\`\`\`graphql
type Mutation {
  # Send message
  sendMessage(input: SendMessageInput!): Message!
  
  # Create user
  createUser(input: CreateUserInput!): User!
  
  # Update user
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

input SendMessageInput {
  content: String!
  userId: String!
  conversationId: ID
  metadata: JSON
}
\`\`\`

## Example Queries

### Get Recent Conversations
\`\`\`graphql
query GetConversations {
  conversations(limit: 10) {
    id
    userId
    createdAt
    messages(limit: 1) {
      content
      createdAt
    }
  }
}
\`\`\`

### Send Message
\`\`\`graphql
mutation SendMessage {
  sendMessage(input: {
    content: "Hello!"
    userId: "user_123"
  }) {
    id
    content
    createdAt
  }
}
\`\`\``;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Chat API Portal & SDK</h1>
            <p className="text-gray-600 mt-1">API文書・SDK・認証キー・使用量分析・開発者ポータル</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreatingKey(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + API キー作成
            </button>
            <button
              onClick={() => setIsCreatingApp(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + OAuth アプリ作成
            </button>
          </div>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">API キー</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">OAuth アプリ</p>
                <p className="text-2xl font-bold text-gray-900">{oauthApps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総API呼び出し</p>
                <p className="text-2xl font-bold text-gray-900">
                  {apiKeys.reduce((total, key) => total + key.totalRequests, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">OAuth認証数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {oauthApps.reduce((total, app) => total + app.totalAuthorizations, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '📋 概要', desc: 'API概要・管理' },
              { key: 'rest', label: '🌐 REST API', desc: 'RESTful API' },
              { key: 'graphql', label: '📊 GraphQL', desc: 'GraphQL API' },
              { key: 'oauth', label: '🔐 OAuth', desc: 'OAuth認証' },
              { key: 'webhooks', label: '🔗 Webhooks', desc: 'イベント通知' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'overview' | 'rest' | 'graphql' | 'oauth' | 'webhooks')
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API キー管理 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔑 API キー</h3>
                <button
                  onClick={generateAPIKey}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  新規作成
                </button>
              </div>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{key.name}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          key.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>タイプ: {key.type.toUpperCase()}</div>
                      <div>権限: {key.permissions.join(', ')}</div>
                      <div>
                        レート制限: {key.rateLimit.requests}/{key.rateLimit.window}
                      </div>
                      <div>最終使用: {key.lastUsed}</div>
                    </div>
                    <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono">
                      {key.key.substring(0, 20)}...
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🔑</span>
                    <p>APIキーが作成されていません</p>
                  </div>
                )}
              </div>
            </div>

            {/* OAuth アプリ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔐 OAuth アプリ</h3>
                <button
                  onClick={createOAuthApp}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  新規作成
                </button>
              </div>
              <div className="space-y-3">
                {oauthApps.map((app) => (
                  <div key={app.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{app.name}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>タイプ: {app.type}</div>
                      <div>スコープ: {app.scopes.join(', ')}</div>
                      <div>認証数: {app.totalAuthorizations}</div>
                    </div>
                    <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono">
                      Client ID: {app.clientId}
                    </div>
                  </div>
                ))}
                {oauthApps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🔐</span>
                    <p>OAuthアプリが作成されていません</p>
                  </div>
                )}
              </div>
            </div>

            {/* API統計 */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 API使用統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">今日のリクエスト</p>
                  <p className="text-2xl font-bold text-blue-900">1,234</p>
                  <p className="text-sm text-blue-600">+12% vs 昨日</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">成功率</p>
                  <p className="text-2xl font-bold text-green-900">99.8%</p>
                  <p className="text-sm text-green-600">エラー率: 0.2%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">平均レスポンス時間</p>
                  <p className="text-2xl font-bold text-purple-900">245ms</p>
                  <p className="text-sm text-purple-600">-15ms vs 昨日</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-600">データ転送量</p>
                  <p className="text-2xl font-bold text-orange-900">12.3GB</p>
                  <p className="text-sm text-orange-600">今月累計</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REST APIタブ */}
        {selectedTab === 'rest' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 REST API 設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                      https://api.ai-chat.jp/v1
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">認証方法</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="bearer">Bearer Token</option>
                      <option value="api-key">API Key Header</option>
                      <option value="oauth">OAuth 2.0</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">CORS 有効</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">レート制限</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">利用可能なエンドポイント</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• POST /messages - メッセージ送信</li>
                    <li>• GET /conversations - 会話履歴取得</li>
                    <li>• POST /users - ユーザー作成</li>
                    <li>• GET /analytics - 分析データ取得</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📖 REST API ドキュメント</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generateRESTDocs())}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  📋 コピー
                </button>
              </div>
              <textarea
                className="w-full h-96 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                readOnly
                value={generateRESTDocs()}
              />
            </div>
          </div>
        )}

        {/* GraphQLタブ */}
        {selectedTab === 'graphql' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 GraphQL 設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GraphQL Endpoint
                    </label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                      https://api.ai-chat.jp/graphql
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Playground URL
                    </label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                      https://api.ai-chat.jp/graphql/playground
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">Introspection 有効</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm font-medium text-gray-700">Playground 有効</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm font-medium text-gray-700">Subscription 有効</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">利用可能な機能</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• リアルタイムデータ取得</li>
                    <li>• 複雑なクエリ・フィルタリング</li>
                    <li>• バッチリクエスト</li>
                    <li>• 型安全なスキーマ</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📖 GraphQL ドキュメント</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generateGraphQLDocs())}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  📋 コピー
                </button>
              </div>
              <textarea
                className="w-full h-96 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                readOnly
                value={generateGraphQLDocs()}
              />
            </div>
          </div>
        )}

        {/* OAuthタブ */}
        {selectedTab === 'oauth' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 OAuth 2.0 設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorization URL
                    </label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                      https://auth.ai-chat.jp/oauth/authorize
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token URL
                    </label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                      https://auth.ai-chat.jp/oauth/token
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利用可能なスコープ
                    </label>
                    <div className="space-y-2">
                      {['read', 'write', 'admin', 'analytics'].map((scope) => (
                        <label key={scope} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">{scope}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth フロー例</h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <strong>1. Authorization Code 取得</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {`GET https://auth.ai-chat.jp/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=read+write&
  state=RANDOM_STRING`}
                    </pre>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <strong>2. Access Token 取得</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {`POST https://auth.ai-chat.jp/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=RECEIVED_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=YOUR_REDIRECT_URI`}
                    </pre>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <strong>3. API 呼び出し</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {`GET https://api.ai-chat.jp/v1/conversations
Authorization: Bearer ACCESS_TOKEN`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth アプリ一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">登録済み OAuth アプリ</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アプリ名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイプ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        認証数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {oauthApps.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {app.clientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              app.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.totalAuthorizations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">編集</button>
                          <button className="text-red-600 hover:text-red-900">削除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Webhooksタブ */}
        {selectedTab === 'webhooks' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Webhook 設定</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">イベント設定</h4>
                <div className="space-y-2">
                  {[
                    'message.created',
                    'conversation.started',
                    'user.created',
                    'analytics.updated',
                  ].map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://your-app.com/webhooks"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    署名シークレット
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    value="whsec_..."
                    readOnly
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">ペイロード例</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`{
  "event": "message.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "msg_123",
    "content": "Hello!",
    "userId": "user_456",
    "conversationId": "conv_789",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "organization": {
    "id": "${id}",
    "name": "Your Organization"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* API キー作成モーダル */}
        {isCreatingKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいAPI キーを作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">キー名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: Production API Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="rest">REST API</option>
                    <option value="graphql">GraphQL</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generateAPIKey}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingKey(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OAuth アプリ作成モーダル */}
        {isCreatingApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいOAuth アプリを作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">アプリ名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: My Web App"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アプリタイプ
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="web">Web Application</option>
                    <option value="mobile">Mobile App</option>
                    <option value="server">Server Application</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createOAuthApp}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingApp(false)}
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

export default APIPortalPage;
