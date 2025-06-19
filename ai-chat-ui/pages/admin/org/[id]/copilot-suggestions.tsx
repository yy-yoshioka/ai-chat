import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface CopilotSuggestion {
  id: string;
  conversationId: string;
  agentId: string;
  timestamp: string;
  userMessage: string;
  suggestions: {
    id: string;
    text: string;
    confidence: number;
    source: 'ai_generated' | 'template' | 'faq_link';
    faqLinkIds?: string[];
    reasoning: string;
    tags: string[];
  }[];
  selectedSuggestion?: string;
  feedback: {
    accepted: boolean;
    modified: boolean;
    rating?: number;
    agentNotes?: string;
  } | null;
  responseTime: number; // ms
}

interface SuggestionTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  variables: { name: string; type: 'text' | 'number' | 'select'; options?: string[] }[];
  isActive: boolean;
  usage: number;
  successRate: number;
}

interface CopilotSettings {
  enabled: boolean;
  model: string;
  maxSuggestions: number;
  confidenceThreshold: number;
  autoSuggestDelay: number; // seconds
  includeTemplates: boolean;
  includeFAQLinks: boolean;
  learningMode: boolean;
  language: string;
  personalizeToAgent: boolean;
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalSuggestions: number;
  acceptanceRate: number;
  averageResponseTime: number;
  preferredSuggestionTypes: string[];
  improvementScore: number;
}

const CopilotSuggestionsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<
    'suggestions' | 'templates' | 'settings' | 'analytics'
  >('suggestions');
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [templates, setTemplates] = useState<SuggestionTemplate[]>([]);
  const [settings, setSettings] = useState<CopilotSettings>({
    enabled: true,
    model: 'gpt-4o',
    maxSuggestions: 3,
    confidenceThreshold: 0.7,
    autoSuggestDelay: 2,
    includeTemplates: true,
    includeFAQLinks: true,
    learningMode: true,
    language: 'ja',
    personalizeToAgent: true,
  });
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CopilotSuggestion | null>(null);

  const loadCopilotData = useCallback(async () => {
    try {
      const [suggestionsResponse, templatesResponse, settingsResponse, performanceResponse] =
        await Promise.all([
          fetch(`/api/organizations/${id}/ai/copilot-suggestions`),
          fetch(`/api/organizations/${id}/ai/suggestion-templates`),
          fetch(`/api/organizations/${id}/ai/copilot-settings`),
          fetch(`/api/organizations/${id}/ai/agent-performance`),
        ]);

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }

      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setAgentPerformance(performanceData);
      }
    } catch (error) {
      console.error('Failed to load copilot data:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCopilotData();
    }
  }, [id, loadCopilotData]);

  const generateSuggestions = async (conversationId: string, userMessage: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/ai/copilot-suggestions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userMessage }),
      });

      if (response.ok) {
        const newSuggestions = await response.json();
        setSuggestions((prev) => [newSuggestions, ...prev]);
        alert('候補を生成しました');
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      alert('候補生成に失敗しました');
    }
  };

  const recordFeedback = async (
    suggestionId: string,
    feedback: {
      accepted: boolean;
      modified: boolean;
      rating?: number;
      agentNotes?: string;
    }
  ) => {
    try {
      const response = await fetch(
        `/api/organizations/${id}/ai/copilot-suggestions/${suggestionId}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback),
        }
      );

      if (response.ok) {
        setSuggestions((prev) =>
          prev.map((suggestion) =>
            suggestion.id === suggestionId ? { ...suggestion, feedback } : suggestion
          )
        );
      }
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  const createTemplate = () => {
    const newTemplate: SuggestionTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      category: 'general',
      prompt: 'Generate a helpful response for: {user_message}',
      variables: [{ name: 'user_message', type: 'text' }],
      isActive: true,
      usage: 0,
      successRate: 0,
    };

    setTemplates((prev) => [...prev, newTemplate]);
  };

  const updateSettings = async (newSettings: Partial<CopilotSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const response = await fetch(`/api/organizations/${id}/ai/copilot-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai_generated':
        return '🤖';
      case 'template':
        return '📋';
      case 'faq_link':
        return '❓';
      default:
        return '💡';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AIコパイロット & サジェスト</h1>
            <p className="text-gray-600 mt-1">
              リアルタイム提案・トレーニング・パフォーマンス分析・設定
            </p>
          </div>
          <button
            onClick={() =>
              generateSuggestions('sample-conversation', 'こんにちは、どのようなご用件でしょうか？')
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🤖 候補生成テスト
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総候補数</p>
                <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">採用率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suggestions.length > 0
                    ? (
                        (suggestions.filter((s) => s.feedback?.accepted).length /
                          suggestions.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均応答時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suggestions.length > 0
                    ? Math.round(
                        suggestions.reduce((sum, s) => sum + s.responseTime, 0) / suggestions.length
                      )
                    : 0}
                  ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブエージェント</p>
                <p className="text-2xl font-bold text-gray-900">{agentPerformance.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                key: 'suggestions',
                label: '💡 候補提案',
                desc: 'リアルタイム候補・フィードバック',
              },
              { key: 'templates', label: '📋 テンプレート', desc: '候補テンプレート管理' },
              { key: 'settings', label: '⚙️ 設定', desc: 'Copilot設定・AI調整' },
              { key: 'analytics', label: '📊 分析', desc: 'エージェント分析・学習効果' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'suggestions' | 'templates' | 'settings' | 'analytics')
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

        {/* 候補提案タブ */}
        {selectedTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        会話 #{suggestion.conversationId.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(suggestion.timestamp).toLocaleString()} • エージェント:{' '}
                        {suggestion.agentId} • 応答時間: {suggestion.responseTime}ms
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {suggestion.feedback?.accepted ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          採用済み
                        </span>
                      ) : suggestion.feedback !== null ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          却下
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          未対応
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        詳細
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">ユーザーメッセージ</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                      {suggestion.userMessage}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      提案候補 ({suggestion.suggestions.length}件)
                    </h4>
                    <div className="space-y-3">
                      {suggestion.suggestions.map((sug) => (
                        <div key={sug.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getSourceIcon(sug.source)}</span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(sug.confidence)}`}
                              >
                                信頼度: {(sug.confidence * 100).toFixed(1)}%
                              </span>
                              {suggestion.selectedSuggestion === sug.id && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  選択済み
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  recordFeedback(suggestion.id, {
                                    accepted: true,
                                    modified: false,
                                    rating: 5,
                                  })
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                採用
                              </button>
                              <button
                                onClick={() =>
                                  recordFeedback(suggestion.id, {
                                    accepted: false,
                                    modified: false,
                                    rating: 1,
                                  })
                                }
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                却下
                              </button>
                            </div>
                          </div>

                          <div className="text-sm text-gray-900 mb-2">{sug.text}</div>

                          <div className="text-xs text-gray-500">
                            <div>理由: {sug.reasoning}</div>
                            {sug.tags.length > 0 && (
                              <div className="mt-1">
                                タグ:{' '}
                                {sug.tags.map((tag) => (
                                  <span key={tag} className="px-1 py-0.5 bg-gray-100 rounded mr-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {sug.faqLinkIds && sug.faqLinkIds.length > 0 && (
                              <div className="mt-1">FAQ参照: {sug.faqLinkIds.join(', ')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {suggestions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">💡</span>
                  <p className="text-lg">候補提案がまだありません</p>
                  <p className="text-sm">エージェントが会話を開始すると候補が表示されます</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* テンプレートタブ */}
        {selectedTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">候補テンプレート</h3>
              <button
                onClick={createTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + テンプレート追加
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        カテゴリ: {template.category} • 使用回数: {template.usage} • 成功率:{' '}
                        {template.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={template.isActive} className="rounded" />
                      <span className="text-sm text-gray-600">有効</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">プロンプト</h5>
                      <textarea
                        value={template.prompt}
                        className="w-full px-3 py-2 border rounded-lg h-24 text-sm"
                        readOnly
                      />
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">変数</h5>
                      <div className="space-y-2">
                        {template.variables.map((variable, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {variable.name}
                            </span>
                            <span className="text-gray-600">{variable.type}</span>
                            {variable.options && (
                              <span className="text-gray-500">({variable.options.join(', ')})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 設定タブ */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Copilot設定</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">基本設定</h4>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Copilot機能を有効化</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AIモデル
                      </label>
                      <select
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大候補数: {settings.maxSuggestions}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={settings.maxSuggestions}
                        onChange={(e) =>
                          updateSettings({ maxSuggestions: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        信頼度閾値: {(settings.confidenceThreshold * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.05"
                        value={settings.confidenceThreshold}
                        onChange={(e) =>
                          updateSettings({ confidenceThreshold: parseFloat(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自動提案遅延: {settings.autoSuggestDelay}秒
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={settings.autoSuggestDelay}
                        onChange={(e) =>
                          updateSettings({ autoSuggestDelay: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">機能設定</h4>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.includeTemplates}
                        onChange={(e) => updateSettings({ includeTemplates: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">テンプレートを含める</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.includeFAQLinks}
                        onChange={(e) => updateSettings({ includeFAQLinks: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">FAQリンクを含める</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.learningMode}
                        onChange={(e) => updateSettings({ learningMode: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">学習モード</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.personalizeToAgent}
                        onChange={(e) => updateSettings({ personalizeToAgent: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">エージェント別パーソナライズ</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">言語</label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                        <option value="auto">自動検出</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 分析タブ */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                エージェント別パフォーマンス
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        エージェント
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        総候補数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        採用率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        平均応答時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        改善スコア
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agentPerformance.map((agent) => (
                      <tr key={agent.agentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {agent.agentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.totalSuggestions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.acceptanceRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.averageResponseTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${agent.improvementScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{agent.improvementScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">候補タイプ別統計</h3>
                <div className="space-y-3">
                  {[
                    { type: 'AI生成', count: 245, percentage: 68 },
                    { type: 'テンプレート', count: 89, percentage: 25 },
                    { type: 'FAQリンク', count: 25, percentage: 7 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">学習効果</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-600">今月の改善</p>
                    <p className="text-2xl font-bold text-green-900">+12.3%</p>
                    <p className="text-sm text-green-600">採用率向上</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">応答時間短縮</p>
                    <p className="text-2xl font-bold text-blue-900">-340ms</p>
                    <p className="text-sm text-blue-600">平均応答時間</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-600">新しいパターン学習</p>
                    <p className="text-2xl font-bold text-purple-900">47</p>
                    <p className="text-sm text-purple-600">今月学習した新パターン</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        {selectedSuggestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">候補詳細</h3>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本情報</h4>
                  <div className="text-sm space-y-1">
                    <div>会話ID: {selectedSuggestion.conversationId}</div>
                    <div>エージェントID: {selectedSuggestion.agentId}</div>
                    <div>生成時刻: {new Date(selectedSuggestion.timestamp).toLocaleString()}</div>
                    <div>応答時間: {selectedSuggestion.responseTime}ms</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">フィードバック</h4>
                  <div className="text-sm">
                    {selectedSuggestion.feedback ? (
                      <div className="space-y-1">
                        <div>採用: {selectedSuggestion.feedback.accepted ? 'Yes' : 'No'}</div>
                        <div>修正: {selectedSuggestion.feedback.modified ? 'Yes' : 'No'}</div>
                        {selectedSuggestion.feedback.rating && (
                          <div>評価: ★ {selectedSuggestion.feedback.rating}/5</div>
                        )}
                        {selectedSuggestion.feedback.agentNotes && (
                          <div>メモ: {selectedSuggestion.feedback.agentNotes}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">フィードバックなし</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CopilotSuggestionsPage;
