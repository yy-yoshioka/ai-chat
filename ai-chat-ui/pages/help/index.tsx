import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpPageProps {
  faqs: FAQItem[];
  categories: string[];
}

const HelpCenter = ({ faqs, categories }: HelpPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // FAQをフィルタリング
  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ヘルプセンター | AI Chat - よくある質問とサポート</title>
        <meta
          name="description"
          content="AI Chatのよくある質問、使い方ガイド、トラブルシューティングなどのサポート情報をご確認いただけます。"
        />
      </Head>

      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">ヘルプセンター</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              AI Chatの使い方やよくある質問にお答えします。
              お探しの情報が見つからない場合は、お気軽にサポートチームまでお問い合わせください。
            </p>

            {/* 検索ボックス */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="質問やキーワードで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  すべて ({faqs.length})
                </button>
                {categories.map((category) => {
                  const count = faqs.filter((faq) => faq.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </nav>

              {/* サポート連絡先 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">お困りですか？</h3>
                <div className="space-y-3">
                  <Link
                    href="/contact"
                    className="block bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    サポートに連絡
                  </Link>
                  <Link
                    href="/demo"
                    className="block border border-gray-300 text-gray-700 text-center px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    デモを見る
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* クイックリンク */}
            {selectedCategory === 'all' && searchQuery === '' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 よく閲覧される記事</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickLinkCard
                    title="AI Chatの始め方"
                    description="5分でできる基本設定から最初のメッセージまで"
                    icon="🎯"
                    href="/help/getting-started"
                  />
                  <QuickLinkCard
                    title="ナレッジベースの設定"
                    description="FAQ登録とドキュメント取り込みの方法"
                    icon="📚"
                    href="/help/knowledge-base"
                  />
                  <QuickLinkCard
                    title="料金とプラン"
                    description="各プランの機能比較と選び方"
                    icon="💰"
                    href="/help/pricing"
                  />
                  <QuickLinkCard
                    title="トラブルシューティング"
                    description="よくある問題の解決方法"
                    icon="🔧"
                    href="/help/troubleshooting"
                  />
                </div>
              </div>
            )}

            {/* FAQ一覧 */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'よくある質問' : `${selectedCategory} に関する質問`}
                </h2>
                <span className="text-sm text-gray-500">{filteredFAQs.length}件の質問</span>
              </div>

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <p className="text-gray-600 text-lg mb-2">お探しの情報が見つかりませんでした</p>
                  <p className="text-gray-500 text-sm mb-6">
                    別のキーワードで検索するか、サポートチームまでお問い合わせください。
                  </p>
                  <Link
                    href="/contact"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    サポートに連絡
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <FAQCard
                      key={faq.id}
                      faq={faq}
                      isExpanded={expandedFAQ === faq.id}
                      onToggle={() => toggleFAQ(faq.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">まだ解決しませんか？</h2>
          <p className="text-xl text-gray-600 mb-8">
            サポートチームが迅速にお答えします。お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              サポートに連絡
            </Link>
            <Link
              href="/blog"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              ブログを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// クイックリンクカード
const QuickLinkCard = ({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) => (
  <Link href={href} className="block group">
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

// FAQカード
const FAQCard = ({
  faq,
  isExpanded,
  onToggle,
}: {
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>

    {isExpanded && (
      <div className="px-6 pb-4">
        <div className="pt-2 border-t border-gray-200">
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>{faq.answer}</p>
          </div>

          {faq.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {faq.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export const getStaticProps: GetStaticProps = async () => {
  // 実際の実装では、データベースやCMSから取得
  const faqs: FAQItem[] = [
    {
      id: 'setup-1',
      question: 'AI Chatの設置にはどのくらい時間がかかりますか？',
      answer:
        'AI Chatの設置は非常に簡単で、通常5分以内で完了します。管理画面でウィジェットをカスタマイズし、生成されたJavaScriptコードを1行追加するだけです。技術的な知識は必要ありません。',
      category: '設定・導入',
      tags: ['設置', '時間', '簡単'],
    },
    {
      id: 'pricing-1',
      question: '月額料金はいくらですか？',
      answer:
        'AI Chatは月額$199からご利用いただけます。無料プランもご用意しており、月間100メッセージまで無料でお試しいただけます。詳細な料金表は料金ページをご確認ください。',
      category: '料金・プラン',
      tags: ['料金', '価格', '月額'],
    },
    {
      id: 'features-1',
      question: 'どのような機能がありますか？',
      answer:
        'AI Chatには、GPT-4o搭載のAIチャット、100以上の言語対応、ナレッジベース統合、リアルタイム分析、カスタマイズ可能なデザインなど、多彩な機能があります。',
      category: '機能・特徴',
      tags: ['機能', 'AI', '多言語'],
    },
    {
      id: 'support-1',
      question: 'サポート体制はどうなっていますか？',
      answer:
        '日本語での技術サポートを平日9:00-18:00に提供しています。メール、チャット、電話でのサポートに対応しており、初期設定のサポートも無料で行います。',
      category: 'サポート',
      tags: ['サポート', '日本語', '無料'],
    },
    {
      id: 'setup-2',
      question: 'カスタマイズはどの程度可能ですか？',
      answer:
        'チャットウィジェットの色、サイズ、位置、テキストなどを自由にカスタマイズできます。CSSでの詳細なスタイリングも可能で、あなたのブランドに合わせた外観にできます。',
      category: '設定・導入',
      tags: ['カスタマイズ', 'デザイン', 'ブランド'],
    },
    {
      id: 'features-2',
      question: 'どんな業界で使えますか？',
      answer:
        'AI ChatはSaaS、Eコマース、教育、金融、不動産など、あらゆる業界でご利用いただけます。業界特有の専門用語にも対応し、カスタマイズされた回答を提供できます。',
      category: '機能・特徴',
      tags: ['業界', '汎用性', '専門用語'],
    },
    {
      id: 'pricing-2',
      question: '無料プランでできることを教えてください',
      answer:
        '無料プランでは月間100メッセージまで利用でき、基本的なAIチャット機能、カスタマイズ、分析機能をお試しいただけます。クレジットカード登録も不要です。',
      category: '料金・プラン',
      tags: ['無料', '制限', 'お試し'],
    },
    {
      id: 'troubleshooting-1',
      question: 'ウィジェットが表示されない場合はどうすればよいですか？',
      answer:
        'まず、コードが正しく貼り付けられているか確認してください。次に、JavaScriptがブロックされていないか、コンソールエラーがないかをチェックします。それでも解決しない場合は、サポートチームまでお問い合わせください。',
      category: 'トラブルシューティング',
      tags: ['表示されない', 'ウィジェット', 'エラー'],
    },
  ];

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return {
    props: {
      faqs,
      categories,
    },
  };
};

export default HelpCenter;
