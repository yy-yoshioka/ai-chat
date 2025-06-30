'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from './_components/Breadcrumb';
import { ArticleHeader } from './_components/ArticleHeader';
import { ShareSection } from './_components/ShareSection';
import { RelatedPosts } from './_components/RelatedPosts';
import { CallToAction } from './_components/CallToAction';
import { BlogPostData, RelatedPost } from './types';
import { getMockPost, getMockRelatedPosts } from './data';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Simulate loading - in production this would fetch from API
    setTimeout(() => {
      setPost(getMockPost(slug));
      setRelatedPosts(getMockRelatedPosts());
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
      <Breadcrumb title={post.title} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ArticleHeader post={post} />

        {/* 記事本文 */}
        <div className="prose prose-lg max-w-none">
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <ShareSection post={post} />
      </article>

      <RelatedPosts relatedPosts={relatedPosts} />
      <CallToAction />
    </div>
  );
}
