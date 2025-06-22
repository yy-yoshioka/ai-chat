import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface SAMLProvider {
  id: string;
  name: string;
  provider: 'okta' | 'azure' | 'google' | 'auth0' | 'custom';
  status: 'active' | 'inactive' | 'testing' | 'error';
  entityId: string;
  ssoUrl: string;
  certificate: string;
  attributeMapping: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
  };
  domains: string[];
  createdAt: string;
  lastUsed: string;
  totalLogins: number;
}

interface SCIMConfig {
  enabled: boolean;
  endpoint: string;
  token: string;
  version: '1.1' | '2.0';
  operations: {
    create: boolean;
    update: boolean;
    delete: boolean;
    sync: boolean;
  };
  lastSync: string;
  totalUsers: number;
  errors: string[];
}

const SSOPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'saml' | 'scim' | 'users' | 'logs'>('saml');
  const [samlProviders, setSamlProviders] = useState<SAMLProvider[]>([]);
  const [scimConfig, setScimConfig] = useState<SCIMConfig>({
    enabled: false,
    endpoint: `https://api.ai-chat.jp/scim/v2/organizations/${id}`,
    token: '',
    version: '2.0',
    operations: { create: true, update: true, delete: false, sync: true },
    lastSync: 'Never',
    totalUsers: 0,
    errors: [],
  });
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);

  useEffect(() => {
    loadSSOData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSSOData = async () => {
    try {
      const [samlResponse, scimResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/saml-providers`),
        fetch(`/api/organizations/${id}/scim-config`),
      ]);

      if (samlResponse.ok) {
        const samlData = await samlResponse.json();
        setSamlProviders(samlData);
      }

      if (scimResponse.ok) {
        const scimData = await scimResponse.json();
        setScimConfig(scimData);
      }
    } catch (error) {
      console.error('Failed to load SSO data:', error);
    }
  };

  const createSAMLProvider = () => {
    const newProvider: SAMLProvider = {
      id: `saml-${Date.now()}`,
      name: 'New SAML Provider',
      provider: 'custom',
      status: 'inactive',
      entityId: `https://ai-chat.jp/saml/metadata/${id}`,
      ssoUrl: '',
      certificate: '',
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
      },
      domains: [],
      createdAt: new Date().toISOString(),
      lastUsed: 'Never',
      totalLogins: 0,
    };

    setSamlProviders((prev) => [...prev, newProvider]);
    setIsCreatingProvider(false);
  };

  const updateSAMLProvider = (providerId: string, updates: Partial<SAMLProvider>) => {
    setSamlProviders((prev) =>
      prev.map((provider) => (provider.id === providerId ? { ...provider, ...updates } : provider))
    );
  };

  const testSAMLConnection = async (providerId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/saml-providers/${providerId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('SAML接続テストが成功しました！');
        updateSAMLProvider(providerId, { status: 'active' });
      } else {
        alert('SAML接続テストに失敗しました');
        updateSAMLProvider(providerId, { status: 'error' });
      }
    } catch (error) {
      console.error('SAML test failed:', error);
      alert('SAML接続テストに失敗しました');
    }
  };

  const generateSCIMToken = () => {
    const token = `scim_${Math.random().toString(36).substr(2, 32)}`;
    setScimConfig((prev) => ({ ...prev, token }));
  };

  const syncSCIMUsers = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/scim/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('SCIM同期が開始されました');
        setScimConfig((prev) => ({ ...prev, lastSync: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('SCIM sync failed:', error);
      alert('SCIM同期に失敗しました');
    }
  };

  return (
    <AdminLayout
      title="SAML SSO & SCIM プロビジョニング"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: 'SSO・プロビジョニング', href: `/admin/org/${id}/sso` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SAML SSO & SCIM プロビジョニング</h1>
            <p className="text-gray-600 mt-1">エンタープライズ認証・ユーザー管理の自動化</p>
          </div>
          <button
            onClick={() => setIsCreatingProvider(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + SAML プロバイダー追加
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SAML プロバイダー</p>
                <p className="text-2xl font-bold text-gray-900">{samlProviders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SCIM ユーザー</p>
                <p className="text-2xl font-bold text-gray-900">{scimConfig.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総SSO ログイン</p>
                <p className="text-2xl font-bold text-gray-900">
                  {samlProviders.reduce((total, p) => total + p.totalLogins, 0)}
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
                <p className="text-sm font-medium text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {samlProviders.filter((p) => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'saml', label: '🔐 SAML SSO', desc: 'シングルサインオン設定' },
              { key: 'scim', label: '👥 SCIM', desc: 'ユーザープロビジョニング' },
              { key: 'users', label: '🧑‍💼 ユーザー', desc: 'SSO・SCIM ユーザー管理' },
              { key: 'logs', label: '📝 ログ', desc: '認証ログ・同期履歴' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as 'saml' | 'scim' | 'users' | 'logs')}
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

        {/* SAML SSOタブ */}
        {selectedTab === 'saml' && (
          <div className="space-y-6">
            {/* SAML プロバイダー一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SAML プロバイダー</h3>
              <div className="space-y-4">
                {samlProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{provider.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{provider.provider}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            provider.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : provider.status === 'error'
                                ? 'bg-red-100 text-red-700'
                                : provider.status === 'testing'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {provider.status}
                        </span>
                        <button
                          onClick={() => testSAMLConnection(provider.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          テスト
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Entity ID
                          </label>
                          <input
                            type="text"
                            value={provider.entityId}
                            onChange={(e) =>
                              updateSAMLProvider(provider.id, { entityId: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SSO URL
                          </label>
                          <input
                            type="url"
                            value={provider.ssoUrl}
                            onChange={(e) =>
                              updateSAMLProvider(provider.id, { ssoUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            許可ドメイン
                          </label>
                          <input
                            type="text"
                            placeholder="example.com, company.org"
                            value={provider.domains.join(', ')}
                            onChange={(e) =>
                              updateSAMLProvider(provider.id, {
                                domains: e.target.value.split(',').map((d) => d.trim()),
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            証明書 (X.509)
                          </label>
                          <textarea
                            value={provider.certificate}
                            onChange={(e) =>
                              updateSAMLProvider(provider.id, { certificate: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm h-20 font-mono"
                            placeholder="-----BEGIN CERTIFICATE-----"
                          />
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">統計</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>総ログイン数: {provider.totalLogins}</div>
                            <div>最終使用: {provider.lastUsed}</div>
                            <div>作成日: {new Date(provider.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 属性マッピング */}
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">属性マッピング</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(provider.attributeMapping).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {key}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateSAMLProvider(provider.id, {
                                  attributeMapping: {
                                    ...provider.attributeMapping,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {samlProviders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-4 block">🔐</span>
                    <p>SAML プロバイダーが設定されていません</p>
                    <p className="text-sm">「SAML プロバイダー追加」から設定してください</p>
                  </div>
                )}
              </div>
            </div>

            {/* SAML メタデータ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Service Provider メタデータ
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Entity ID:</strong> https://ai-chat.jp/saml/metadata/{id}
                  </div>
                  <div>
                    <strong>ACS URL:</strong> https://ai-chat.jp/saml/acs/{id}
                  </div>
                  <div>
                    <strong>SLS URL:</strong> https://ai-chat.jp/saml/sls/{id}
                  </div>
                  <div>
                    <strong>メタデータ URL:</strong> https://ai-chat.jp/saml/metadata/{id}.xml
                  </div>
                </div>
                <button
                  onClick={() =>
                    window.open(`https://ai-chat.jp/saml/metadata/${id}.xml`, '_blank')
                  }
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  メタデータをダウンロード
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCIM タブ */}
        {selectedTab === 'scim' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SCIM 設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={scimConfig.enabled}
                        onChange={(e) =>
                          setScimConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">SCIM を有効化</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SCIM エンドポイント
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={scimConfig.endpoint}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(scimConfig.endpoint)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bearer Token
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        value={scimConfig.token}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={generateSCIMToken}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        生成
                      </button>
                    </div>
                    {scimConfig.token && (
                      <p className="text-xs text-gray-500 mt-1">
                        このトークンは安全に保管し、SCIM プロバイダーに設定してください
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SCIM バージョン
                    </label>
                    <select
                      value={scimConfig.version}
                      onChange={(e) =>
                        setScimConfig((prev) => ({
                          ...prev,
                          version: e.target.value as '1.1' | '2.0',
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="2.0">SCIM 2.0 (推奨)</option>
                      <option value="1.1">SCIM 1.1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      サポート操作
                    </label>
                    <div className="space-y-2">
                      {Object.entries({
                        create: 'ユーザー作成',
                        update: 'ユーザー更新',
                        delete: 'ユーザー削除',
                        sync: '一括同期',
                      }).map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={
                              scimConfig.operations[key as keyof typeof scimConfig.operations]
                            }
                            onChange={(e) =>
                              setScimConfig((prev) => ({
                                ...prev,
                                operations: {
                                  ...prev.operations,
                                  [key]: e.target.checked,
                                },
                              }))
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={syncSCIMUsers}
                    disabled={!scimConfig.enabled}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    ユーザー同期を実行
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">同期状況</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">最終同期</p>
                        <p className="text-gray-600">{scimConfig.lastSync}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">同期ユーザー数</p>
                        <p className="text-gray-600">{scimConfig.totalUsers}</p>
                      </div>
                    </div>
                  </div>

                  {scimConfig.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">同期エラー</h4>
                      <div className="space-y-2">
                        {scimConfig.errors.map((error, index) => (
                          <div key={index} className="bg-red-50 p-3 rounded text-sm text-red-800">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">SCIM スキーマ</h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(
                        {
                          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
                          userName: 'user@example.com',
                          name: {
                            givenName: 'John',
                            familyName: 'Doe',
                          },
                          emails: [
                            {
                              value: 'user@example.com',
                              primary: true,
                            },
                          ],
                          active: true,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ユーザータブ */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SSO・SCIM ユーザー</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      認証方法
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プロバイダー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終ログイン
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">JD</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                          <div className="text-sm text-gray-500">john@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SAML SSO</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Okta</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2時間前</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">JS</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                          <div className="text-sm text-gray-500">jane@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SCIM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Azure AD</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1日前</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ログタブ */}
        {selectedTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">認証・同期ログ</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border rounded-lg text-sm">
                  <option value="all">すべてのイベント</option>
                  <option value="login">ログイン</option>
                  <option value="logout">ログアウト</option>
                  <option value="scim_sync">SCIM同期</option>
                  <option value="error">エラー</option>
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
                    event: 'SAML Login Success',
                    user: 'john@example.com',
                    provider: 'Okta',
                    status: 'success' as const,
                  },
                  {
                    time: '2024-01-15 14:25:10',
                    event: 'SCIM User Update',
                    user: 'jane@example.com',
                    provider: 'Azure AD',
                    status: 'success' as const,
                  },
                  {
                    time: '2024-01-15 14:20:45',
                    event: 'SAML Login Failed',
                    user: 'bob@example.com',
                    provider: 'Google',
                    status: 'error' as const,
                  },
                ].map((log, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{log.event}</div>
                          <div className="text-sm text-gray-600">
                            {log.user} via {log.provider}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SAML プロバイダー作成モーダル */}
        {isCreatingProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SAML プロバイダー追加</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プロバイダー名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: Company Okta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プロバイダータイプ
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="okta">Okta</option>
                    <option value="azure">Azure AD</option>
                    <option value="google">Google Workspace</option>
                    <option value="auth0">Auth0</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createSAMLProvider}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingProvider(false)}
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

export default SSOPage;
