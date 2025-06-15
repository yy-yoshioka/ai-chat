import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// タブの種類
type TabType = 'docs' | 'faq' | 'link-rules';

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

export default function KnowledgeManagement() {
  const router = useRouter();
  const { id } = router.query;
  const organizationId = id as string;

  const [activeTab, setActiveTab] = useState<TabType>('docs');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [linkRules, setLinkRules] = useState<LinkRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadKnowledgeBases = async () => {
    // TODO: API call to fetch knowledge bases
    setKnowledgeBases([
      {
        id: 'kb-1',
        title: 'AI Chat サポートガイド',
        description: 'AI Chatプラットフォームの基本的な使い方やよくある質問をまとめたガイドです。',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
      },
    ]);
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

  const uploadFile = async (file: File): Promise<void> => {
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
              { id: 'link-rules', label: 'リンクルール', icon: '🔗' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
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
