import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

interface ConversationSummary {
  id: string;
  conversationId: string;
  userId: string;
  agentId?: string;
  createdAt: string;
  summary: {
    intent: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyPoints: string[];
    resolution: string;
    nextSteps: {
      priority: 'high' | 'medium' | 'low';
      action: string;
      assignee?: string;
      dueDate?: string;
    }[];
  };
  metadata: {
    messageCount: number;
    duration: number; // seconds
    language: string;
    topics: string[];
    satisfaction?: number;
  };
  status: 'generated' | 'reviewed' | 'archived';
}

interface SummaryTemplate {
  id: string;
  name: string;
  prompt: string;
  fields: {
    intent: boolean;
    sentiment: boolean;
    keyPoints: boolean;
    nextSteps: boolean;
    customFields: { name: string; type: 'text' | 'number' | 'select'; options?: string[] }[];
  };
  isDefault: boolean;
}

type TriggerEvent = 'conversation_end' | 'agent_handoff' | 'manual_request';

interface SummarySettings {
  autoGenerate: boolean;
  minMessages: number;
  triggerEvents: TriggerEvent[];
  model: string;
  language: string;
  includePersonalInfo: boolean;
  retentionDays: number;
}

const ConversationSummaryPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<
    'summaries' | 'templates' | 'settings' | 'analytics'
  >('summaries');
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [templates, setTemplates] = useState<SummaryTemplate[]>([]);
  const [settings, setSettings] = useState<SummarySettings>({
    autoGenerate: true,
    minMessages: 5,
    triggerEvents: ['conversation_end'],
    model: 'agentic-summarize-2025-06',
    language: 'ja',
    includePersonalInfo: false,
    retentionDays: 90,
  });
  const [selectedSummary, setSelectedSummary] = useState<ConversationSummary | null>(null);

  const loadSummaryData = useCallback(async () => {
    try {
      const [summariesResponse, templatesResponse, settingsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/ai/conversation-summaries`),
        fetch(`/api/organizations/${id}/ai/summary-templates`),
        fetch(`/api/organizations/${id}/ai/summary-settings`),
      ]);

      if (summariesResponse.ok) {
        const summariesData = await summariesResponse.json();
        setSummaries(summariesData);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Failed to load summary data:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSummaryData();
    }
  }, [id, loadSummaryData]);

  const generateSummary = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}/ai/conversation-summaries/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });

      if (response.ok) {
        const newSummary = await response.json();
        setSummaries((prev) => [newSummary, ...prev]);
        alert('会話要約を生成しました');
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('要約生成に失敗しました');
    }
  };

  const createTemplate = () => {
    const newTemplate: SummaryTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      prompt:
        'Analyze this conversation and provide a summary with the following information:\n- Intent\n- Sentiment\n- Key points\n- Next steps',
      fields: {
        intent: true,
        sentiment: true,
        keyPoints: true,
        nextSteps: true,
        customFields: [],
      },
      isDefault: false,
    };

    setTemplates((prev) => [...prev, newTemplate]);
  };

  const updateSettings = async (newSettings: Partial<SummarySettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const response = await fetch(`/api/organizations/${id}/ai/summary-settings`, {
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

  const toggleTriggerEvent = (event: TriggerEvent, checked: boolean) => {
    const newEvents = checked
      ? [...settings.triggerEvents, event]
      : settings.triggerEvents.filter((e) => e !== event);
    updateSettings({ triggerEvents: newEvents });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700';
      case 'negative':
        return 'bg-red-100 text-red-700';
      case 'neutral':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">会話サマリー & AI分析</h1>
            <p className="text-gray-600 mt-1">リアルタイム分析・傾向把握・AI洞察・エクスポート</p>
          </div>
          <button
            onClick={() => generateSummary('sample-conversation')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🤖 手動要約生成
          </button>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総要約数</p>
                <p className="text-2xl font-bold text-gray-900">{summaries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">😊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ポジティブ感情</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaries.filter((s) => s.summary.sentiment === 'positive').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">未対応アクション</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaries.reduce((sum, s) => sum + s.summary.nextSteps.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均満足度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaries.length > 0
                    ? (
                        summaries.reduce((sum, s) => sum + (s.metadata.satisfaction || 0), 0) /
                        summaries.length
                      ).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'summaries', label: '📝 要約', desc: '会話要約・分析結果' },
              { key: 'templates', label: '📋 テンプレート', desc: '要約テンプレート管理' },
              { key: 'settings', label: '⚙️ 設定', desc: 'AI要約設定' },
              { key: 'analytics', label: '📊 分析', desc: '要約分析・レポート' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedTab(key as 'summaries' | 'templates' | 'settings' | 'analytics')
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

        {/* 要約タブ */}
        {selectedTab === 'summaries' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {summaries.map((summary) => (
                <div key={summary.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        会話 #{summary.conversationId.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(summary.createdAt).toLocaleString()} •
                        {summary.metadata.messageCount}メッセージ •
                        {Math.round(summary.metadata.duration / 60)}分
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(summary.summary.sentiment)}`}
                      >
                        {summary.summary.sentiment}
                      </span>
                      <button
                        onClick={() => setSelectedSummary(summary)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        詳細
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">意図・解決策</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">意図:</span>
                          <span className="ml-2 text-gray-600">{summary.summary.intent}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">解決策:</span>
                          <span className="ml-2 text-gray-600">{summary.summary.resolution}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">重要ポイント</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {summary.summary.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {summary.summary.nextSteps.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">次のステップ</h4>
                      <div className="space-y-2">
                        {summary.summary.nextSteps.map((step, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(step.priority)}`}
                              >
                                {step.priority}
                              </span>
                              <span className="text-sm text-gray-900">{step.action}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {step.assignee && <span>担当: {step.assignee}</span>}
                              {step.dueDate && (
                                <span className="ml-2">
                                  期限: {new Date(step.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {summaries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl mb-4 block">📝</span>
                  <p className="text-lg">会話要約がまだありません</p>
                  <p className="text-sm">会話が完了すると自動的に要約が生成されます</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* テンプレートタブ */}
        {selectedTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">要約テンプレート</h3>
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
                      {template.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded mt-1 inline-block">
                          デフォルト
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">プロンプト</h5>
                      <textarea
                        value={template.prompt}
                        className="w-full px-3 py-2 border rounded-lg h-32 text-sm"
                        readOnly
                      />
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">出力フィールド</h5>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={template.fields.intent}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">意図分析</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={template.fields.sentiment}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">感情分析</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={template.fields.keyPoints}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">重要ポイント</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={template.fields.nextSteps}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">次のステップ</span>
                        </label>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">AI要約設定</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">基本設定</h4>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.autoGenerate}
                        onChange={(e) => updateSettings({ autoGenerate: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">自動要約生成</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最小メッセージ数: {settings.minMessages}
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="20"
                        value={settings.minMessages}
                        onChange={(e) => updateSettings({ minMessages: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AIモデル
                      </label>
                      <select
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="agentic-summarize-2025-06">GPT-4o Agentic Summarize</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>

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

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">トリガー設定</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.triggerEvents.includes('conversation_end')}
                        onChange={(e) => toggleTriggerEvent('conversation_end', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">会話終了時</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.triggerEvents.includes('agent_handoff')}
                        onChange={(e) => toggleTriggerEvent('agent_handoff', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">エージェント引き継ぎ時</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.triggerEvents.includes('manual_request')}
                        onChange={(e) => toggleTriggerEvent('manual_request', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">手動リクエスト時</span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-4">プライバシー設定</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.includePersonalInfo}
                          onChange={(e) =>
                            updateSettings({ includePersonalInfo: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">個人情報を含める</span>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          データ保持期間: {settings.retentionDays}日
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="365"
                          value={settings.retentionDays}
                          onChange={(e) =>
                            updateSettings({ retentionDays: parseInt(e.target.value) })
                          }
                          className="w-full"
                        />
                      </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">感情分析トレンド</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ポジティブ</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(summaries.filter((s) => s.summary.sentiment === 'positive').length / summaries.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {summaries.filter((s) => s.summary.sentiment === 'positive').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ニュートラル</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full"
                          style={{
                            width: `${(summaries.filter((s) => s.summary.sentiment === 'neutral').length / summaries.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {summaries.filter((s) => s.summary.sentiment === 'neutral').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ネガティブ</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(summaries.filter((s) => s.summary.sentiment === 'negative').length / summaries.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {summaries.filter((s) => s.summary.sentiment === 'negative').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">よくある意図</h3>
                <div className="space-y-2">
                  {[
                    { intent: '技術サポート', count: 45 },
                    { intent: '料金に関する質問', count: 32 },
                    { intent: '機能の使い方', count: 28 },
                    { intent: 'アカウント管理', count: 23 },
                    { intent: 'バグ報告', count: 18 },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-900">{item.intent}</span>
                      <span className="text-sm font-medium text-gray-600">{item.count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-600">高優先度アクション</p>
                  <p className="text-2xl font-bold text-red-900">
                    {summaries.reduce(
                      (sum, s) =>
                        sum + s.summary.nextSteps.filter((step) => step.priority === 'high').length,
                      0
                    )}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">中優先度アクション</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {summaries.reduce(
                      (sum, s) =>
                        sum +
                        s.summary.nextSteps.filter((step) => step.priority === 'medium').length,
                      0
                    )}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">低優先度アクション</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summaries.reduce(
                      (sum, s) =>
                        sum + s.summary.nextSteps.filter((step) => step.priority === 'low').length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        {selectedSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">要約詳細</h3>
                <button
                  onClick={() => setSelectedSummary(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本情報</h4>
                  <div className="text-sm space-y-1">
                    <div>会話ID: {selectedSummary.conversationId}</div>
                    <div>作成日時: {new Date(selectedSummary.createdAt).toLocaleString()}</div>
                    <div>メッセージ数: {selectedSummary.metadata.messageCount}</div>
                    <div>継続時間: {Math.round(selectedSummary.metadata.duration / 60)}分</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">トピック</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedSummary.metadata.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">満足度</h4>
                  <div className="text-sm">
                    {selectedSummary.metadata.satisfaction ? (
                      <span className="text-green-600">
                        ★ {selectedSummary.metadata.satisfaction}/5
                      </span>
                    ) : (
                      <span className="text-gray-500">未評価</span>
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

export default ConversationSummaryPage;
