import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Layout from '../../components/Layout';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
  readingTime: string;
}

interface BlogPageProps {
  posts: BlogPost[];
}

const BlogPage = ({ posts }: BlogPageProps) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // 全てのタグを取得
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  // タグでフィルタリング
  const filteredPosts =
    selectedTag === 'all' ? posts : posts.filter((post) => post.tags.includes(selectedTag));

  // 注目記事
  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>ブログ | AI Chat - 最新の AI チャット情報</title>
          <meta
            name="description"
            content="AI Chatの最新情報、導入事例、活用方法についてご紹介します。"
          />
        </Head>

        {/* ヘッダー */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Chat ブログ</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                AI Chatの最新情報、導入事例、活用ノウハウを発信しています。
                あなたのビジネスを次のレベルに引き上げるヒントを見つけてください。
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* タグフィルタ */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 注目記事 */}
          {selectedTag === 'all' && featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 注目記事</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <FeaturedPostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* 記事一覧 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedTag === 'all' ? '📚 すべての記事' : `📚 ${selectedTag} の記事`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">
                {selectedTag === 'all'
                  ? '記事がありません'
                  : `${selectedTag} の記事が見つかりませんでした`}
              </p>
            </div>
          )}
        </div>

        {/* CTA セクション */}
        <div className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">AI Chat を実際に体験してみませんか？</h2>
            <p className="text-xl mb-8 text-blue-100">
              無料トライアルで、記事で紹介した機能を実際にお試しください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                無料トライアル開始
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
    </Layout>
  );
};

// 注目記事カード
const FeaturedPostCard = ({ post }: { post: BlogPost }) => (
  <Link href={`/blog/${post.slug}`} className="block group">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
            注目記事
          </span>
          <span className="text-sm text-gray-500">{post.readingTime}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{post.author}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(post.date).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// 通常記事カード
const PostCard = ({ post }: { post: BlogPost }) => (
  <Link href={`/blog/${post.slug}`} className="block group">
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{post.readingTime}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{post.author}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {new Date(post.date).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 1).map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export const getStaticProps: GetStaticProps = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug: filename.replace('.md', ''),
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        author: data.author || '',
        tags: data.tags || [],
        featured: data.featured || false,
        readingTime: data.readingTime || '5分',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    props: {
      posts,
    },
  };
};

export default BlogPage;
