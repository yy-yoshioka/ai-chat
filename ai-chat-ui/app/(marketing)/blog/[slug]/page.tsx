'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
  readingTime: string;
  content: string;
}

interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Mock data for now - in production this would fetch from API
    const mockPost: BlogPostData = {
      slug,
      title: 'AIチャットボットの最新動向',
      description: 'AI技術の進歩により、チャットボットはより自然で有用な対話を実現しています。',
      date: '2024-01-15',
      author: 'AI Chat Team',
      tags: ['AI', 'チャットボット', '技術'],
      featured: true,
      readingTime: '5分',
      content: `
        <h2>AIチャットボットの革命</h2>
        <p>現代のAIチャットボットは、従来のルールベースシステムを大幅に上回る性能を示しています。</p>
        
        <h3>主要な改善点</h3>
        <ul>
          <li>自然言語処理の精度向上</li>
          <li>文脈理解能力の強化</li>
          <li>多言語対応の充実</li>
          <li>学習機能の最適化</li>
        </ul>
        
        <h3>ビジネスへの影響</h3>
        <p>これらの技術進歩により、企業は以下のメリットを享受できます：</p>
        <ol>
          <li>カスタマーサポートの効率化</li>
          <li>24時間対応の実現</li>
          <li>コスト削減</li>
          <li>顧客満足度の向上</li>
        </ol>
        
        <h3>まとめ</h3>
        <p>AIチャットボット技術は急速に発展しており、今後もビジネスに大きな変革をもたらすことでしょう。</p>
      `,
    };

    const mockRelatedPosts: RelatedPost[] = [
      {
        slug: 'chatbot-implementation-guide',
        title: 'チャットボット導入ガイド',
        description: '効果的なチャットボット導入のための完全ガイド',
        readingTime: '8分',
      },
      {
        slug: 'ai-trends-2024',
        title: '2024年のAIトレンド',
        description: '今年注目すべきAI技術の動向を解説',
        readingTime: '6分',
      },
    ];

    // Simulate loading
    setTimeout(() => {
      setPost(mockPost);
      setRelatedPosts(mockRelatedPosts);
      setLoading(false);
    }, 500);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">記事を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">記事が見つかりません</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700">
            ブログ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずナビ */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ホーム
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/blog" className="text-gray-500 hover:text-gray-700">
              ブログ
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 記事ヘッダー */}
        <header className="mb-8">
          {post.featured && (
            <div className="mb-4">
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                🌟 注目記事
              </span>
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{post.description}</p>

          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{post.author.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{post.author}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {post.readingTime}
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 記事本文 */}
        <div className="prose prose-lg max-w-none">
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* シェアボタン */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">この記事をシェア</h3>
              <div className="flex space-x-3">
                <ShareButton
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ai-chat.jp/blog/${post.slug}`)}`}
                  label="Twitter"
                  icon="🐦"
                  bgColor="bg-blue-400"
                />
                <ShareButton
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ai-chat.jp/blog/${post.slug}`)}`}
                  label="Facebook"
                  icon="📘"
                  bgColor="bg-blue-600"
                />
                <ShareButton
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ai-chat.jp/blog/${post.slug}`)}`}
                  label="LinkedIn"
                  icon="💼"
                  bgColor="bg-blue-700"
                />
              </div>
            </div>

            <div className="text-right">
              <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
                ← ブログ一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <div className="bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="block group"
                >
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{relatedPost.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {relatedPost.readingTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA セクション */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">AI Chat を試してみませんか？</h2>
          <p className="text-xl mb-8 text-blue-100">
            この記事で紹介した機能を実際に体験してください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              無料で始める
            </Link>
            <Link
              href="/demo"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              デモを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// シェアボタンコンポーネント
const ShareButton = ({
  href,
  label,
  icon,
  bgColor,
}: {
  href: string;
  label: string;
  icon: string;
  bgColor: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2`}
  >
    <span>{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);
