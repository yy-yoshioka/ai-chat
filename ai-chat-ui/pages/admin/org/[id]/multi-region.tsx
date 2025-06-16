import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface Region {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  endpoint: string;
  latency: number;
  capacity: number;
  load: number;
  instances: number;
  lastHealthCheck: string;
  dataCenter: string;
  provider: 'aws' | 'gcp' | 'azure' | 'cloudflare';
}

interface LoadBalancer {
  id: string;
  name: string;
  algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
  regions: string[];
  healthCheck: {
    interval: number;
    timeout: number;
    threshold: number;
  };
  enabled: boolean;
}

interface SyncStatus {
  region: string;
  lastSync: string;
  lag: number;
  status: 'synced' | 'syncing' | 'delayed' | 'error';
  conflictCount: number;
}

const MultiRegionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'regions' | 'balancing' | 'sync' | 'failover'>(
    'regions'
  );
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [isAddingRegion, setIsAddingRegion] = useState(false);

  useEffect(() => {
    loadMultiRegionData();
  }, [id]);

  const loadMultiRegionData = async () => {
    try {
      const [regionsResponse, balancersResponse, syncResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/multi-region/regions`),
        fetch(`/api/organizations/${id}/multi-region/load-balancers`),
        fetch(`/api/organizations/${id}/multi-region/sync-status`),
      ]);

      if (regionsResponse.ok) {
        const regionsData = await regionsResponse.json();
        setRegions(regionsData);
      }

      if (balancersResponse.ok) {
        const balancersData = await balancersResponse.json();
        setLoadBalancers(balancersData);
      }

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        setSyncStatus(syncData);
      }
    } catch (error) {
      console.error('Failed to load multi-region data:', error);
    }
  };

  const addRegion = () => {
    const newRegion: Region = {
      id: `region-${Date.now()}`,
      name: 'New Region',
      code: 'us-west-2',
      status: 'inactive',
      endpoint: 'https://us-west-2.ai-chat.jp',
      latency: 0,
      capacity: 100,
      load: 0,
      instances: 0,
      lastHealthCheck: new Date().toISOString(),
      dataCenter: 'AWS US-West-2',
      provider: 'aws',
    };

    setRegions((prev) => [...prev, newRegion]);
    setIsAddingRegion(false);
  };

  const updateRegion = (regionId: string, updates: Partial<Region>) => {
    setRegions((prev) =>
      prev.map((region) => (region.id === regionId ? { ...region, ...updates } : region))
    );
  };

  const deployToRegion = async (regionId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/multi-region/regions/${regionId}/deploy`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        alert('リージョンへのデプロイが開始されました');
        updateRegion(regionId, { status: 'active' });
      }
    } catch (error) {
      console.error('Failed to deploy to region:', error);
      alert('デプロイに失敗しました');
    }
  };

  const testFailover = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/multi-region/test-failover`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('フェイルオーバーテストが開始されました');
      }
    } catch (error) {
      console.error('Failed to test failover:', error);
      alert('フェイルオーバーテストに失敗しました');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws':
        return '🟠';
      case 'gcp':
        return '🟦';
      case 'azure':
        return '🟦';
      case 'cloudflare':
        return '🟧';
      default:
        return '☁️';
    }
  };

  return (
    <AdminLayout
      title="マルチリージョン Active-Active 構成"
      breadcrumbs={[
        { label: '組織管理', href: `/admin/org/${id}` },
        { label: 'マルチリージョン', href: `/admin/org/${id}/multi-region` },
      ]}
    >
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              マルチリージョン Active-Active 構成
            </h1>
            <p className="text-gray-600 mt-1">グローバル展開・高可用性・災害復旧</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={testFailover}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🧪 フェイルオーバーテスト
            </button>
            <button
              onClick={() => setIsAddingRegion(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + リージョン追加
            </button>
          </div>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブリージョン</p>
                <p className="text-2xl font-bold text-gray-900">
                  {regions.filter((r) => r.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">平均レイテンシ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {regions.length > 0
                    ? Math.round(regions.reduce((sum, r) => sum + r.latency, 0) / regions.length)
                    : 0}
                  ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総インスタンス</p>
                <p className="text-2xl font-bold text-gray-900">
                  {regions.reduce((sum, r) => sum + r.instances, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均負荷</p>
                <p className="text-2xl font-bold text-gray-900">
                  {regions.length > 0
                    ? Math.round(regions.reduce((sum, r) => sum + r.load, 0) / regions.length)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'regions', label: '🌍 リージョン', desc: '地域展開管理' },
              { key: 'balancing', label: '⚖️ ロードバランシング', desc: '負荷分散設定' },
              { key: 'sync', label: '🔄 データ同期', desc: 'リージョン間同期' },
              { key: 'failover', label: '🛡️ フェイルオーバー', desc: '障害時切替設定' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as 'regions' | 'balancing' | 'sync' | 'failover')}
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

        {/* リージョンタブ */}
        {selectedTab === 'regions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {regions.map((region) => (
                <div key={region.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProviderIcon(region.provider)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
                        <p className="text-sm text-gray-600">{region.dataCenter}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(region.status)}`}
                      >
                        {region.status}
                      </span>
                      <button
                        onClick={() => deployToRegion(region.id)}
                        disabled={region.status === 'active'}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        デプロイ
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        リージョンコード
                      </label>
                      <input
                        type="text"
                        value={region.code}
                        onChange={(e) => updateRegion(region.id, { code: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        エンドポイント
                      </label>
                      <input
                        type="url"
                        value={region.endpoint}
                        onChange={(e) => updateRegion(region.id, { endpoint: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        容量: {region.capacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={region.capacity}
                        onChange={(e) =>
                          updateRegion(region.id, { capacity: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロバイダー
                      </label>
                      <select
                        value={region.provider}
                        onChange={(e) =>
                          updateRegion(region.id, { provider: e.target.value as any })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="aws">AWS</option>
                        <option value="gcp">Google Cloud</option>
                        <option value="azure">Microsoft Azure</option>
                        <option value="cloudflare">Cloudflare</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">レイテンシ</p>
                      <p className="text-xl font-bold text-blue-900">{region.latency}ms</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-600">負荷</p>
                      <p className="text-xl font-bold text-green-900">{region.load}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">インスタンス</p>
                      <p className="text-xl font-bold text-purple-900">{region.instances}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">ヘルスチェック</p>
                      <p className="text-xs text-gray-600">
                        {new Date(region.lastHealthCheck).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {regions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🌍</span>
                  <p className="text-lg">リージョンが設定されていません</p>
                  <p className="text-sm">「リージョン追加」から設定してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ロードバランシングタブ */}
        {selectedTab === 'balancing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ロードバランサー設定</h3>
              <div className="space-y-4">
                {loadBalancers.map((lb) => (
                  <div key={lb.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{lb.name}</h4>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={lb.enabled} className="rounded" />
                        <span className="text-sm text-gray-600">有効</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          アルゴリズム
                        </label>
                        <select className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option value="round_robin">Round Robin</option>
                          <option value="least_connections">Least Connections</option>
                          <option value="ip_hash">IP Hash</option>
                          <option value="weighted">Weighted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          対象リージョン
                        </label>
                        <select className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option value="all">すべて</option>
                          <option value="primary">プライマリのみ</option>
                          <option value="secondary">セカンダリのみ</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">ヘルスチェック設定</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">間隔 (秒)</label>
                          <input
                            type="number"
                            value={lb.healthCheck.interval}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            タイムアウト (秒)
                          </label>
                          <input
                            type="number"
                            value={lb.healthCheck.timeout}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">閾値</label>
                          <input
                            type="number"
                            value={lb.healthCheck.threshold}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">トラフィック分散状況</h3>
              <div className="space-y-4">
                {regions
                  .filter((r) => r.status === 'active')
                  .map((region) => (
                    <div key={region.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{getProviderIcon(region.provider)}</span>
                          <span className="font-medium text-gray-900">{region.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{region.load}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${region.load}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex justify-between">
                        <span>Latency: {region.latency}ms</span>
                        <span>Instances: {region.instances}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* データ同期タブ */}
        {selectedTab === 'sync' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">リージョン間データ同期</h3>
            <div className="space-y-4">
              {syncStatus.map((sync) => (
                <div key={sync.region} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          sync.status === 'synced'
                            ? 'bg-green-500'
                            : sync.status === 'syncing'
                              ? 'bg-yellow-500'
                              : sync.status === 'delayed'
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{sync.region}</h4>
                        <p className="text-sm text-gray-600">
                          最終同期: {new Date(sync.lastSync).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">遅延: {sync.lag}ms</div>
                      {sync.conflictCount > 0 && (
                        <div className="text-sm text-red-600">競合: {sync.conflictCount}件</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-600">同期方式</p>
                      <p className="text-sm text-blue-900">Master-Master</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium text-green-600">同期間隔</p>
                      <p className="text-sm text-green-900">リアルタイム</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-medium text-purple-600">圧縮率</p>
                      <p className="text-sm text-purple-900">85%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* フェイルオーバータブ */}
        {selectedTab === 'failover' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">フェイルオーバー設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プライマリリージョン
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="us-east-1">US East 1</option>
                    <option value="us-west-2">US West 2</option>
                    <option value="eu-west-1">EU West 1</option>
                    <option value="ap-northeast-1">Asia Pacific Northeast 1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    セカンダリリージョン
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="us-west-2">US West 2</option>
                    <option value="eu-west-1">EU West 1</option>
                    <option value="ap-northeast-1">Asia Pacific Northeast 1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フェイルオーバー閾値
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        レスポンス時間 (ms)
                      </label>
                      <input
                        type="number"
                        defaultValue="5000"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">エラー率 (%)</label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">自動フェイルオーバー</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">自動フェイルバック</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">手動承認必須</span>
                  </label>
                </div>

                <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  🧪 フェイルオーバーテスト実行
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">フェイルオーバー履歴</h3>
              <div className="space-y-3">
                {[
                  {
                    time: '2024-01-15 14:30:25',
                    type: 'テスト',
                    from: 'US-East-1',
                    to: 'US-West-2',
                    duration: '15分',
                    status: '成功',
                  },
                  {
                    time: '2024-01-10 08:45:12',
                    type: '自動',
                    from: 'EU-West-1',
                    to: 'US-East-1',
                    duration: '3分',
                    status: '成功',
                  },
                  {
                    time: '2024-01-05 22:15:33',
                    type: '手動',
                    from: 'AP-Northeast-1',
                    to: 'US-West-2',
                    duration: '8分',
                    status: '成功',
                  },
                ].map((event, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {event.type}フェイルオーバー
                        </div>
                        <div className="text-sm text-gray-600">
                          {event.from} → {event.to}
                        </div>
                        <div className="text-sm text-gray-500">{event.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{event.duration}</div>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* リージョン追加モーダル */}
        {isAddingRegion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">リージョン追加</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リージョン名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: Asia Pacific Tokyo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プロバイダー
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="aws">AWS</option>
                    <option value="gcp">Google Cloud</option>
                    <option value="azure">Microsoft Azure</option>
                    <option value="cloudflare">Cloudflare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リージョンコード
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: ap-northeast-1"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={addRegion}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => setIsAddingRegion(false)}
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

export default MultiRegionPage;
