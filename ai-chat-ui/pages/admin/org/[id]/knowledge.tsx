import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// タブの種類
type TabType = 'docs' | 'faq' | 'link-rules' | 'suggestions';

// データ型定義
interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  sourceType: 'pdf' | 'url' | 'markdown' | 'csv' | 'zendesk' | 'intercom' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  wordCount?: number;
  createdAt: string;
  errorMessage?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  weight: number;
  isActive: boolean;
  timesUsed: number;
  lastUsedAt?: string;
}

interface LinkRule {
  id: string;
  name: string;
  triggerRegex: string;
  targetUrl: string;
  newTab: boolean;
  description?: string;
  isActive: boolean;
  clickCount: number;
}

interface FAQSuggestion {
  id: string;
  originalMessage: string;
  suggestedQuestion: string;
  suggestedAnswer: string;
  confidence: number;
  count: number;
  lastAskedAt: string;
  priority: 'high' | 'medium' | 'low';
}

export default function KnowledgeManagement() {
  const router = useRouter();
  const { id } = router.query;
  const organizationId = id as string;

  const [activeTab, setActiveTab] = useState<TabType>('docs');
  const [_knowledgeBases] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [linkRules, setLinkRules] = useState<LinkRule[]>([]);
  const [suggestions, setSuggestions] = useState<FAQSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // データ読み込み
  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadKnowledgeBases(), loadDocuments(), loadFAQs(), loadLinkRules()]);
      if (activeTab === 'suggestions') {
        await loadSuggestions();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadKnowledgeBases = async () => {
    // TODO: API call to fetch knowledge bases
    // setKnowledgeBases([...]);
  };

  const loadDocuments = async () => {
    // TODO: API call to fetch documents
    setDocuments([
      {
        id: 'doc-1',
        title: 'AI Chat 基本ガイド',
        sourceType: 'manual',
        status: 'completed',
        wordCount: 1250,
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'doc-2',
        title: '料金プランと請求',
        sourceType: 'manual',
        status: 'completed',
        wordCount: 890,
        createdAt: '2024-01-16T14:30:00Z',
      },
      {
        id: 'doc-3',
        title: 'API ドキュメント',
        sourceType: 'url',
        status: 'processing',
        createdAt: '2024-01-20T09:15:00Z',
      },
    ]);
  };

  const loadFAQs = async () => {
    // TODO: API call to fetch FAQs
    setFaqs([
      {
        id: 'faq-1',
        question: 'AI Chatの設置にはどのくらい時間がかかりますか？',
        answer:
          'AI Chatの設置は非常簡単で、通常5分以内で完了します。管理画面でウィジェットをカスタマイズし、生成されたJavaScriptコードを1行追加するだけです。',
        weight: 100,
        isActive: true,
        timesUsed: 45,
        lastUsedAt: '2024-01-20T12:30:00Z',
      },
      {
        id: 'faq-2',
        question: '月額料金はいくらですか？',
        answer:
          'AI Chatは月額$199からご利用いただけます。無料プランもご用意しており、月間100メッセージまで無料でお試しいただけます。',
        weight: 90,
        isActive: true,
        timesUsed: 38,
        lastUsedAt: '2024-01-19T16:45:00Z',
      },
    ]);
  };

  const loadLinkRules = async () => {
    // TODO: API call to fetch link rules
    setLinkRules([
      {
        id: 'link-1',
        name: '料金ページリンク',
        triggerRegex: '(料金|価格|プラン|費用)',
        targetUrl: '/pricing',
        newTab: false,
        description: '料金に関する質問があった場合、料金ページへのリンクを表示',
        isActive: true,
        clickCount: 23,
      },
      {
        id: 'link-2',
        name: 'ドキュメンテーション',
        triggerRegex: '(使い方|設定|セットアップ|導入)',
        targetUrl: '/docs',
        newTab: true,
        description: '使い方や設定に関する質問でドキュメントへのリンクを表示',
        isActive: true,
        clickCount: 15,
      },
    ]);
  };

  const loadSuggestions = async () => {
    // TODO: API call to fetch FAQ suggestions
    setSuggestions([
      {
        id: 'sug-1',
        originalMessage: 'APIの制限はありますか？',
        suggestedQuestion: 'APIには利用制限がありますか？',
        suggestedAnswer:
          'AI ChatのAPIには、プランに応じた利用制限があります。無料プランでは月間100回、プロプランでは月間10,000回まで利用できます。制限に達した場合は追加購入も可能です。',
        confidence: 0.85,
        count: 15,
        lastAskedAt: '2024-01-20T09:00:00Z',
        priority: 'high',
      },
      {
        id: 'sug-2',
        originalMessage: 'Slackとの連携は可能ですか？',
        suggestedQuestion: 'Slackとの連携機能はありますか？',
        suggestedAnswer:
          'はい、AI ChatはSlackとの連携に対応しています。Webhook URLを設定することで、チャットログをSlackチャンネルに自動送信できます。',
        confidence: 0.78,
        count: 12,
        lastAskedAt: '2024-01-19T16:30:00Z',
        priority: 'medium',
      },
      {
        id: 'sug-3',
        originalMessage: 'データのエクスポート機能はありますか？',
        suggestedQuestion: 'チャットデータのエクスポートは可能ですか？',
        suggestedAnswer:
          'プロプラン以上では、チャットログやFAQデータをCSV形式でエクスポートできます。管理画面の「データエクスポート」メニューからダウンロード可能です。',
        confidence: 0.72,
        count: 8,
        lastAskedAt: '2024-01-18T11:15:00Z',
        priority: 'medium',
      },
    ]);
  };

  // FAQサジェスト生成
  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      // TODO: API call to generate suggestions
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      await loadSuggestions();
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // FAQサジェスト承認
  const approveSuggestion = async (
    suggestionId: string,
    overrides?: { question?: string; answer?: string }
  ) => {
    try {
      // TODO: API call to approve suggestion
      console.log('Approving suggestion:', suggestionId, overrides);

      // サジェストリストから削除
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));

      // FAQ一覧を再読み込み
      await loadFAQs();
    } catch (error) {
      console.error('Failed to approve suggestion:', error);
    }
  };

  // FAQサジェスト却下
  const rejectSuggestion = async (suggestionId: string, reason?: string) => {
    try {
      // TODO: API call to reject suggestion
      console.log('Rejecting suggestion:', suggestionId, reason);

      // サジェストリストから削除
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    }
  };

  // ファイルアップロード処理
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // TODO: Implement actual file upload
        await uploadFile(file);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    await loadDocuments(); // Reload documents
  };

  const uploadFile = async (_file: File): Promise<void> => {
    // TODO: Implement actual file upload logic
    return new Promise((resolve) => {
      setTimeout(resolve, 1000); // Simulate upload time
    });
  };

  // FAQ並び替え処理
  const moveFAQ = (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newFaqs.length) {
      [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
      setFaqs(newFaqs);
      // TODO: API call to update order
    }
  };

  // タブ切り替え時の処理
  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'suggestions' && suggestions.length === 0) {
      await loadSuggestions();
    }
  };

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: Document['status'] }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: '待機中',
      processing: '処理中',
      completed: '完了',
      failed: 'エラー',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // 優先度バッジ
  const PriorityBadge = ({ priority }: { priority: FAQSuggestion['priority'] }) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      high: '高',
      medium: '中',
      low: '低',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ナレッジベース管理 | AI Chat Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ナレッジベース管理</h1>
          <p className="mt-2 text-gray-600">
            ドキュメント、FAQ、リンクルールを管理して、AIの回答精度を向上させましょう。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'docs', label: 'ドキュメント', icon: '📄' },
              { id: 'faq', label: 'FAQ', icon: '❓' },
              { id: 'suggestions', label: 'FAQ候補', icon: '💡', badge: suggestions.length },
              { id: 'link-rules', label: 'リンクルール', icon: '🔗' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ドキュメントタブ */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            {/* アップロードエリア */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                📤 ドキュメントアップロード
              </h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">
                  ファイルをドラッグ&ドロップ、またはクリックして選択
                </p>
                <p className="text-sm text-gray-500">
                  PDF、Markdown、CSV、テキストファイルをサポート
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.md,.csv,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>アップロード中...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* ドキュメント一覧 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">📚 ドキュメント一覧</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイプ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        文字数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        作成日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{doc.sourceType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.wordCount ? `${doc.wordCount.toLocaleString()}文字` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">編集</button>
                            <button className="text-red-600 hover:text-red-900">削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FAQタブ */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* FAQ追加ボタン */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">❓ FAQ 管理</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                ➕ FAQ を追加
              </button>
            </div>

            {/* FAQ一覧 */}
            <div className="bg-white rounded-lg shadow">
              <div className="space-y-4 p-6">
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{faq.question}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {faq.isActive ? '有効' : '無効'}
                          </span>
                          <span className="text-xs text-gray-500">重み: {faq.weight}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{faq.answer}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>使用回数: {faq.timesUsed}回</span>
                          {faq.lastUsedAt && (
                            <span>
                              最終使用: {new Date(faq.lastUsedAt).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => moveFAQ(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => moveFAQ(index, 'down')}
                          disabled={index === faqs.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ⬇️
                        </button>
                        <button className="p-1 text-blue-600 hover:text-blue-800">✏️</button>
                        <button className="p-1 text-red-600 hover:text-red-800">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ候補タブ */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {/* ヘッダーとアクション */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">💡 FAQ候補</h2>
                <p className="text-sm text-gray-600">未回答の質問からAIが生成したFAQ候補です</p>
              </div>
              <button
                onClick={generateSuggestions}
                disabled={isGeneratingSuggestions}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isGeneratingSuggestions ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    生成中...
                  </span>
                ) : (
                  '🔄 候補を生成'
                )}
              </button>
            </div>

            {/* FAQ候補一覧 */}
            <div className="bg-white rounded-lg shadow">
              {suggestions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">💭</div>
                  <p className="text-lg font-medium mb-2">FAQ候補がありません</p>
                  <p className="text-sm">
                    未回答の質問が蓄積されたら、AI が自動的にFAQ候補を生成します。
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <PriorityBadge priority={suggestion.priority} />
                            <span className="text-xs text-gray-500">
                              {suggestion.count}回質問 | 信頼度:{' '}
                              {Math.round(suggestion.confidence * 100)}% | 最終:{' '}
                              {new Date(suggestion.lastAskedAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>元の質問:</strong> {suggestion.originalMessage}
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="mb-3">
                                <strong className="text-gray-900">提案質問:</strong>
                                <p className="mt-1 text-gray-800">{suggestion.suggestedQuestion}</p>
                              </div>
                              <div>
                                <strong className="text-gray-900">提案回答:</strong>
                                <p className="mt-1 text-gray-700">{suggestion.suggestedAnswer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => approveSuggestion(suggestion.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          ✅ そのまま承認
                        </button>
                        <button
                          onClick={() => {
                            // TODO: モーダルで編集してから承認
                            const question = prompt('質問を編集:', suggestion.suggestedQuestion);
                            const answer = prompt('回答を編集:', suggestion.suggestedAnswer);
                            if (question && answer) {
                              approveSuggestion(suggestion.id, { question, answer });
                            }
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          ✏️ 編集して承認
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('却下理由（任意）:');
                            rejectSuggestion(suggestion.id, reason || undefined);
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          ❌ 却下
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* リンクルールタブ */}
        {activeTab === 'link-rules' && (
          <div className="space-y-6">
            {/* リンクルール追加ボタン */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">🔗 リンクルール管理</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                ➕ ルールを追加
              </button>
            </div>

            {/* リンクルール一覧 */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ルール名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        トリガー（正規表現）
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        リンク先
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        クリック数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {linkRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                          {rule.description && (
                            <div className="text-xs text-gray-500">{rule.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {rule.triggerRegex}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{rule.targetUrl}</div>
                          <div className="text-xs text-gray-500">
                            {rule.newTab ? '新しいタブで開く' : '同じタブで開く'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.clickCount.toLocaleString()}回
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {rule.isActive ? '有効' : '無効'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">編集</button>
                            <button className="text-red-600 hover:text-red-900">削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
