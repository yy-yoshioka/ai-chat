import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: 'latency' | 'error' | 'resource' | 'network' | 'database';
  status: 'running' | 'paused' | 'completed' | 'failed';
  parameters: {
    duration?: number;
    intensity?: number;
    blastRadius?: number;
    [key: string]: unknown;
  };
  target: {
    service: string;
    percentage: number;
    duration: number;
    region?: string;
    environment?: string;
  };
  results?: {
    affectedRequests: number;
    errorRate: number;
    responseTime: number;
    impactScore: number;
    recoveryTime?: number;
  };
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  autoHeal?: boolean;
}

interface AutoHealRule {
  id: string;
  name: string;
  trigger: {
    metric: 'response_time' | 'error_rate' | 'cpu_usage' | 'memory_usage' | 'disk_usage';
    threshold: number;
    duration: number; // minutes
    operator: 'greater_than' | 'less_than' | 'equals';
  };
  action: {
    type: 'restart_service' | 'scale_up' | 'scale_down' | 'switch_region' | 'rollback_deployment';
    parameters: Record<string, string | number | boolean>;
  };
  enabled: boolean;
  lastTriggered?: string;
  successRate: number;
}

interface SystemMetrics {
  timestamp: string;
  services: {
    name: string;
    health: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    cpu: number;
    memory: number;
    instances: number;
  }[];
}

const ChaosEngineeringPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<
    'experiments' | 'auto-heal' | 'metrics' | 'scenarios'
  >('experiments');
  const [experiments, setExperiments] = useState<ChaosExperiment[]>([]);
  const [autoHealRules, setAutoHealRules] = useState<AutoHealRule[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);

  const loadChaosData = useCallback(async () => {
    try {
      const [experimentsResponse, rulesResponse, metricsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/chaos/experiments`),
        fetch(`/api/organizations/${id}/chaos/auto-heal-rules`),
        fetch(`/api/organizations/${id}/chaos/metrics`),
      ]);

      if (experimentsResponse.ok) {
        const experimentsData = await experimentsResponse.json();
        setExperiments(experimentsData);
      }

      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setAutoHealRules(rulesData);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to load chaos data:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadChaosData();
    }
  }, [id, loadChaosData]);

  const createExperiment = () => {
    const newExperiment: ChaosExperiment = {
      id: `chaos-${Date.now()}`,
      name: 'New Chaos Experiment',
      description: '',
      type: 'latency',
      status: 'paused',
      parameters: {
        duration: 30,
        intensity: 50,
        blastRadius: 25,
      },
      target: {
        service: 'api-service',
        percentage: 0,
        duration: 0,
        region: 'us-east-1',
        environment: 'staging',
      },
      results: {
        affectedRequests: 0,
        errorRate: 0,
        responseTime: 0,
        impactScore: 0,
        recoveryTime: 0,
      },
      scheduledAt: '',
      startedAt: '',
      completedAt: '',
      createdBy: 'admin',
      autoHeal: false,
    };

    setExperiments((prev) => [...prev, newExperiment]);
    setIsCreatingExperiment(false);
  };

  const runExperiment = async (experimentId: string, config: Record<string, unknown>) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/chaos/experiments/${experimentId}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }
      );

      if (response.ok) {
        await loadChaosData();
        alert('実験を開始しました');
      }
    } catch (error) {
      console.error('Failed to run experiment:', error);
      alert('実験の開始に失敗しました');
    }
  };

  const stopExperiment = async (experimentId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/chaos/experiments/${experimentId}/stop`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setExperiments((prev) =>
          prev.map((exp) =>
            exp.id === experimentId
              ? {
                  ...exp,
                  status: 'paused' as const,
                  results: exp.results ? { ...exp.results, recoveryTime: Date.now() } : undefined,
                }
              : exp
          )
        );
        alert('カオス実験を停止しました');
      }
    } catch (error) {
      console.error('Failed to stop experiment:', error);
      alert('実験の停止に失敗しました');
    }
  };

  const updateExperiment = (experimentId: string, updates: Partial<ChaosExperiment>) => {
    setExperiments((prev) =>
      prev.map((exp) => (exp.id === experimentId ? { ...exp, ...updates } : exp))
    );
  };

  const createAutoHealRule = () => {
    const newRule: AutoHealRule = {
      id: `heal-${Date.now()}`,
      name: 'New Auto-Heal Rule',
      trigger: {
        metric: 'response_time',
        threshold: 5000,
        duration: 5,
        operator: 'greater_than',
      },
      action: {
        type: 'restart_service',
        parameters: {},
      },
      enabled: true,
      successRate: 0,
    };

    setAutoHealRules((prev) => [...prev, newRule]);
  };

  const toggleAutoHealRule = (ruleId: string) => {
    setAutoHealRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-700';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700';
      case 'unhealthy':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'latency':
        return '🌐';
      case 'error':
        return '📡';
      case 'resource':
        return '🔥';
      case 'network':
        return '🔄';
      case 'database':
        return '🗄️';
      default:
        return '🧪';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chaos Test & Auto-Heal</h1>
            <p className="text-gray-600 mt-1">障害シミュレーション・自動復旧・レジリエンス強化</p>
          </div>
          <button
            onClick={() => setIsCreatingExperiment(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🧪 実験作成
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🧪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総実験数</p>
                <p className="text-2xl font-bold text-gray-900">{experiments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">自動復旧ルール</p>
                <p className="text-2xl font-bold text-gray-900">
                  {autoHealRules.filter((r) => r.enabled).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">実行中実験</p>
                <p className="text-2xl font-bold text-gray-900">
                  {experiments.filter((e) => e.status === 'running').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">システム健全性</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics
                    ? Math.round(
                        (metrics.services.filter((s) => s.health === 'healthy').length /
                          metrics.services.length) *
                          100
                      )
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
              { key: 'experiments', label: '🧪 実験', desc: 'カオス実験・テスト' },
              { key: 'auto-heal', label: '🔄 自動復旧', desc: 'Auto-Heal ルール' },
              { key: 'metrics', label: '📊 メトリクス', desc: 'システム状態監視' },
              { key: 'scenarios', label: '📝 シナリオ', desc: '障害シナリオ作成' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'experiments' | 'auto-heal' | 'metrics' | 'scenarios')
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

        {/* 実験タブ */}
        {selectedTab === 'experiments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(experiment.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{experiment.name}</h3>
                        <p className="text-sm text-gray-600">
                          {experiment.target.service}
                          {experiment.target.region && ` • ${experiment.target.region}`}
                          {experiment.target.environment && ` • ${experiment.target.environment}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(experiment.status)}`}
                      >
                        {experiment.status}
                      </span>
                      {experiment.status === 'paused' && (
                        <button
                          onClick={() => runExperiment(experiment.id, experiment.parameters)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          実行
                        </button>
                      )}
                      {experiment.status === 'running' && (
                        <button
                          onClick={() => stopExperiment(experiment.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          停止
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        実験タイプ
                      </label>
                      <select
                        value={experiment.type}
                        onChange={(e) =>
                          updateExperiment(experiment.id, {
                            type: e.target.value as ChaosExperiment['type'],
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        disabled={experiment.status === 'running'}
                      >
                        <option value="latency">ネットワーク遅延</option>
                        <option value="error">パケットロス</option>
                        <option value="resource">CPU負荷</option>
                        <option value="network">ネットワーク分断</option>
                        <option value="database">データベース障害</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        継続時間: {experiment.parameters.duration || 30}分
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={experiment.parameters.duration || 30}
                        onChange={(e) =>
                          updateExperiment(experiment.id, {
                            parameters: {
                              ...experiment.parameters,
                              duration: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                        disabled={experiment.status === 'running'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        強度: {experiment.parameters.intensity || 50}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={experiment.parameters.intensity || 50}
                        onChange={(e) =>
                          updateExperiment(experiment.id, {
                            parameters: {
                              ...experiment.parameters,
                              intensity: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                        disabled={experiment.status === 'running'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        影響範囲: {experiment.parameters.blastRadius || 25}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={experiment.parameters.blastRadius || 25}
                        onChange={(e) =>
                          updateExperiment(experiment.id, {
                            parameters: {
                              ...experiment.parameters,
                              blastRadius: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                        disabled={experiment.status === 'running'}
                      />
                    </div>
                  </div>

                  {experiment.status !== 'paused' && experiment.results && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-600">成功率</p>
                        <p className="text-xl font-bold text-green-900">
                          {(100 - experiment.results.errorRate).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-600">応答時間</p>
                        <p className="text-xl font-bold text-blue-900">
                          {experiment.results.responseTime}ms
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-600">エラー率</p>
                        <p className="text-xl font-bold text-red-900">
                          {experiment.results.errorRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-600">復旧時間</p>
                        <p className="text-xl font-bold text-purple-900">
                          {experiment.results.recoveryTime || 0}秒
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={experiment.autoHeal || false}
                        onChange={(e) =>
                          updateExperiment(experiment.id, { autoHeal: e.target.checked })
                        }
                        className="rounded"
                        disabled={experiment.status === 'running'}
                      />
                      <span className="text-sm text-gray-700">自動復旧を有効にする</span>
                    </label>
                  </div>
                </div>
              ))}

              {experiments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">🧪</span>
                  <p className="text-lg">カオス実験が設定されていません</p>
                  <p className="text-sm">「実験作成」から設定してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 自動復旧タブ */}
        {selectedTab === 'auto-heal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">自動復旧ルール</h3>
              <button
                onClick={createAutoHealRule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + ルール追加
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {autoHealRules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{rule.name}</h4>
                      <p className="text-sm text-gray-600">
                        {rule.trigger.metric} {rule.trigger.operator.replace('_', ' ')}{' '}
                        {rule.trigger.threshold}
                        {rule.trigger.metric.includes('time')
                          ? 'ms'
                          : rule.trigger.metric.includes('rate')
                            ? '%'
                            : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleAutoHealRule(rule.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">有効</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="font-medium text-yellow-900 mb-2">トリガー条件</h5>
                      <div className="space-y-2 text-sm">
                        <div>メトリクス: {rule.trigger.metric}</div>
                        <div>閾値: {rule.trigger.threshold}</div>
                        <div>継続時間: {rule.trigger.duration}分</div>
                        <div>条件: {rule.trigger.operator.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">復旧アクション</h5>
                      <div className="space-y-2 text-sm">
                        <div>アクション: {rule.action.type.replace('_', ' ')}</div>
                        <div>成功率: {rule.successRate.toFixed(1)}%</div>
                        {rule.lastTriggered && (
                          <div>最終実行: {new Date(rule.lastTriggered).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">設定</h5>
                      <div className="space-y-2">
                        <select className="w-full px-2 py-1 border rounded text-sm">
                          <option value="restart_service">サービス再起動</option>
                          <option value="scale_up">スケールアップ</option>
                          <option value="scale_down">スケールダウン</option>
                          <option value="switch_region">リージョン切替</option>
                          <option value="rollback_deployment">デプロイ巻き戻し</option>
                        </select>
                        <input
                          type="number"
                          placeholder="閾値"
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {autoHealRules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🔄</span>
                  <p>自動復旧ルールが設定されていません</p>
                  <p className="text-sm">「ルール追加」から設定してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* メトリクスタブ */}
        {selectedTab === 'metrics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              リアルタイムシステムメトリクス
            </h3>

            {metrics && (
              <div className="space-y-4">
                {metrics.services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getHealthColor(service.health)}`}
                        >
                          {service.health}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{service.instances} インスタンス</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-600">応答時間</p>
                        <p className="text-lg font-bold text-blue-900">{service.responseTime}ms</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-sm font-medium text-red-600">エラー率</p>
                        <p className="text-lg font-bold text-red-900">
                          {service.errorRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm font-medium text-orange-600">CPU使用率</p>
                        <p className="text-lg font-bold text-orange-900">
                          {service.cpu.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-sm font-medium text-purple-600">メモリ使用率</p>
                        <p className="text-lg font-bold text-purple-900">
                          {service.memory.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!metrics && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📊</span>
                <p>メトリクスを読み込み中...</p>
              </div>
            )}
          </div>
        )}

        {/* シナリオタブ */}
        {selectedTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">事前定義シナリオ</h3>
              <div className="space-y-3">
                {[
                  {
                    name: 'データベース障害',
                    description: 'プライマリDBの完全停止',
                    severity: 'critical',
                  },
                  {
                    name: 'ネットワーク分断',
                    description: 'リージョン間通信断絶',
                    severity: 'high',
                  },
                  { name: 'トラフィック急増', description: '通常の10倍負荷', severity: 'medium' },
                  { name: 'ストレージ満杯', description: 'ディスク容量99%使用', severity: 'high' },
                  {
                    name: 'メモリリーク',
                    description: '徐々にメモリ使用量増加',
                    severity: 'medium',
                  },
                ].map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            scenario.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : scenario.severity === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {scenario.severity}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                          実行
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カスタムシナリオ作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">シナリオ名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: API レスポンス遅延テスト"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">障害タイプ</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="">選択してください</option>
                    <option value="network">ネットワーク障害</option>
                    <option value="service">サービス障害</option>
                    <option value="resource">リソース不足</option>
                    <option value="data">データ障害</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象サービス
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="">選択してください</option>
                    <option value="api-service">API Service</option>
                    <option value="database">Database</option>
                    <option value="cache">Cache Service</option>
                    <option value="queue">Message Queue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    実行スケジュール
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="immediate">即座に実行</option>
                    <option value="scheduled">スケジュール実行</option>
                    <option value="recurring">定期実行</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">自動復旧テスト</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">メトリクス記録</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Slack通知</span>
                  </label>
                </div>

                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  シナリオ作成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 実験作成モーダル */}
        {isCreatingExperiment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カオス実験作成</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">実験名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例: API レスポンス遅延テスト"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">実験タイプ</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="latency">ネットワーク遅延</option>
                    <option value="error">パケットロス</option>
                    <option value="resource">CPU負荷</option>
                    <option value="network">ネットワーク分断</option>
                    <option value="database">データベース障害</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象サービス
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="api-service">API Service</option>
                    <option value="web-service">Web Service</option>
                    <option value="database">Database</option>
                    <option value="cache">Cache</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">環境</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="production">Production (注意)</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={createExperiment}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => setIsCreatingExperiment(false)}
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

export default ChaosEngineeringPage;
