import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface EncryptionKey {
  id: string;
  name: string;
  type: 'aes-256' | 'rsa-2048' | 'rsa-4096';
  provider: 'aws-kms' | 'azure-kv' | 'gcp-kms' | 'hashicorp-vault' | 'local';
  status: 'active' | 'inactive' | 'rotating' | 'expired';
  createdAt: string;
  lastRotated: string;
  nextRotation: string;
  usage: {
    encrypt: number;
    decrypt: number;
  };
  keyArn?: string;
  vaultPath?: string;
}

interface EncryptionPolicy {
  id: string;
  name: string;
  enabled: boolean;
  fields: string[];
  keyId: string;
  rotationInterval: number; // days
  compressionEnabled: boolean;
  backupEncryption: boolean;
}

const EncryptionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'keys' | 'policies' | 'fields' | 'audit'>('keys');
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [encryptionPolicies, setEncryptionPolicies] = useState<EncryptionPolicy[]>([]);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  useEffect(() => {
    loadEncryptionData();
  }, [id]);

  const loadEncryptionData = async () => {
    try {
      const [keysResponse, policiesResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/encryption/keys`),
        fetch(`/api/organizations/${id}/encryption/policies`),
      ]);

      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setEncryptionKeys(keysData);
      }

      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json();
        setEncryptionPolicies(policiesData);
      }
    } catch (error) {
      console.error('Failed to load encryption data:', error);
    }
  };

  const createEncryptionKey = async (keyData: any) => {
    try {
      const response = await fetch(`/api/organizations/${id}/encryption/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData),
      });

      if (response.ok) {
        loadEncryptionData();
        setIsCreatingKey(false);
        alert('暗号化キーが作成されました');
      }
    } catch (error) {
      console.error('Failed to create key:', error);
      alert('キー作成に失敗しました');
    }
  };

  const rotateKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/encryption/keys/${keyId}/rotate`, {
        method: 'POST',
      });

      if (response.ok) {
        loadEncryptionData();
        alert('キーローテーションが開始されました');
      }
    } catch (error) {
      console.error('Failed to rotate key:', error);
      alert('キーローテーションに失敗しました');
    }
  };

  const testKeyAccess = async (keyId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/encryption/keys/${keyId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('キーアクセステストが成功しました');
      } else {
        alert('キーアクセステストに失敗しました');
      }
    } catch (error) {
      console.error('Key test failed:', error);
      alert('キーアクセステストに失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">フィールドレベル暗号化 (BYOK)</h1>
          <p className="text-gray-600 mt-1">Bring Your Own Key・エンドツーエンド暗号化</p>
        </div>
        <button
          onClick={() => setIsCreatingKey(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + 暗号化キー追加
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
              <p className="text-sm font-medium text-gray-600">暗号化キー</p>
              <p className="text-2xl font-bold text-gray-900">{encryptionKeys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">暗号化ポリシー</p>
              <p className="text-2xl font-bold text-gray-900">{encryptionPolicies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">暗号化フィールド</p>
              <p className="text-2xl font-bold text-gray-900">
                {encryptionPolicies.reduce((total, p) => total + p.fields.length, 0)}
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
              <p className="text-sm font-medium text-gray-600">アクティブキー</p>
              <p className="text-2xl font-bold text-gray-900">
                {encryptionKeys.filter((k) => k.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'keys', label: '🔐 暗号化キー', desc: 'BYOK・キー管理' },
            { key: 'policies', label: '🛡️ ポリシー', desc: '暗号化ルール設定' },
            { key: 'fields', label: '📝 フィールド', desc: '暗号化対象フィールド' },
            { key: 'audit', label: '📊 監査', desc: '暗号化操作ログ' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as 'keys' | 'policies' | 'fields' | 'audit')}
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

      {/* 暗号化キータブ */}
      {selectedTab === 'keys' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {encryptionKeys.map((key) => (
              <div key={key.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">{key.type.toUpperCase()}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600 capitalize">{key.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        key.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : key.status === 'rotating'
                            ? 'bg-yellow-100 text-yellow-700'
                            : key.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {key.status}
                    </span>
                    <button
                      onClick={() => testKeyAccess(key.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      テスト
                    </button>
                    <button
                      onClick={() => rotateKey(key.id)}
                      className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
                    >
                      ローテーション
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">キー情報</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">作成日:</span>
                        <span>{new Date(key.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">最終ローテーション:</span>
                        <span>{new Date(key.lastRotated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">次回ローテーション:</span>
                        <span>{new Date(key.nextRotation).toLocaleDateString()}</span>
                      </div>
                      {key.keyArn && (
                        <div>
                          <span className="text-gray-600">Key ARN:</span>
                          <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                            {key.keyArn}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">使用統計</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">暗号化操作</span>
                          <span className="font-medium">{key.usage.encrypt.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(key.usage.encrypt / (key.usage.encrypt + key.usage.decrypt)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">復号化操作</span>
                          <span className="font-medium">{key.usage.decrypt.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(key.usage.decrypt / (key.usage.encrypt + key.usage.decrypt)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">設定</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">自動ローテーション</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">バックアップ暗号化</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">監査ログ記録</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {encryptionKeys.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">🔐</span>
                <p className="text-lg">暗号化キーが設定されていません</p>
                <p className="text-sm">「暗号化キー追加」から設定してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ポリシータブ */}
      {selectedTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">暗号化ポリシー</h3>
              {encryptionPolicies.map((policy) => (
                <div key={policy.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{policy.name}</h4>
                      <p className="text-sm text-gray-600">
                        {policy.fields.length} フィールド • {policy.rotationInterval}
                        日間隔ローテーション
                      </p>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={policy.enabled} className="rounded" />
                      <span className="text-sm text-gray-600">有効</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {policy.fields.map((field, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいポリシー</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ポリシー名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: PII暗号化ポリシー"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象フィールド
                </label>
                <div className="space-y-2">
                  {[
                    'email',
                    'phone',
                    'address',
                    'creditCard',
                    'ssn',
                    'bankAccount',
                    'personalNotes',
                    'customField',
                  ].map((field) => (
                    <label key={field} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">暗号化キー</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="">キーを選択</option>
                  {encryptionKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ローテーション間隔: 90日
                </label>
                <input type="range" min="30" max="365" defaultValue="90" className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">圧縮有効</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">バックアップ暗号化</span>
                </label>
              </div>

              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                ポリシー作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フィールドタブ */}
      {selectedTab === 'fields' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">暗号化フィールド管理</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        フィールド
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        データ型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        暗号化状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ポリシー
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { field: 'email', type: 'string', encrypted: true, policy: 'PII暗号化' },
                      { field: 'phone', type: 'string', encrypted: true, policy: 'PII暗号化' },
                      { field: 'address', type: 'text', encrypted: false, policy: null },
                      {
                        field: 'creditCard',
                        type: 'string',
                        encrypted: true,
                        policy: '支払い情報',
                      },
                      { field: 'personalNotes', type: 'text', encrypted: false, policy: null },
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.field}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item.encrypted
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.encrypted ? '🔐 暗号化済み' : '📝 平文'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.policy || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            {item.encrypted ? '復号化' : '暗号化'}
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">設定</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">暗号化統計</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">暗号化フィールド</span>
                    <span className="font-medium">3 / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">PII フィールド</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>今月の暗号化操作:</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>今月の復号化操作:</span>
                        <span className="font-medium">5,678</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ 暗号化推奨</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  以下のフィールドの暗号化を推奨します:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• address (住所情報)</li>
                  <li>• personalNotes (個人メモ)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 監査タブ */}
      {selectedTab === 'audit' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">暗号化操作監査ログ</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option value="all">すべての操作</option>
                <option value="encrypt">暗号化</option>
                <option value="decrypt">復号化</option>
                <option value="rotate">キーローテーション</option>
                <option value="access">キーアクセス</option>
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
                  operation: 'データ暗号化',
                  field: 'email',
                  key: 'PII-Key-001',
                  user: 'system',
                  status: 'success',
                },
                {
                  time: '2024-01-15 14:25:10',
                  operation: 'データ復号化',
                  field: 'phone',
                  key: 'PII-Key-001',
                  user: 'admin@example.com',
                  status: 'success',
                },
                {
                  time: '2024-01-15 14:20:45',
                  operation: 'キーローテーション',
                  field: '-',
                  key: 'Payment-Key-002',
                  user: 'system',
                  status: 'completed',
                },
                {
                  time: '2024-01-15 14:15:30',
                  operation: 'キーアクセス失敗',
                  field: 'creditCard',
                  key: 'Payment-Key-002',
                  user: 'user@example.com',
                  status: 'failed',
                },
              ].map((log, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          log.status === 'success' || log.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{log.operation}</div>
                        <div className="text-sm text-gray-600">
                          {log.field !== '-' && `フィールド: ${log.field} • `}
                          キー: {log.key} • ユーザー: {log.user}
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

      {/* 暗号化キー作成モーダル */}
      {isCreatingKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">暗号化キー追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">キー名</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: PII暗号化キー"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">キータイプ</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="aes-256">AES-256</option>
                  <option value="rsa-2048">RSA-2048</option>
                  <option value="rsa-4096">RSA-4096</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">プロバイダー</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="aws-kms">AWS KMS</option>
                  <option value="azure-kv">Azure Key Vault</option>
                  <option value="gcp-kms">Google Cloud KMS</option>
                  <option value="hashicorp-vault">HashiCorp Vault</option>
                  <option value="local">ローカル管理</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => createEncryptionKey({})}
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
    </div>
  );
};

export default EncryptionPage;
