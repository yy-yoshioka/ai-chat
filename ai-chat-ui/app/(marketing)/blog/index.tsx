'use client';

import { useState } from 'react';
import Head from 'next/head';
import { BlogHeader } from './components/BlogHeader';
import { TagFilter } from './components/TagFilter';
import { BlogCTA } from './components/BlogCTA';
import { EmptyState } from './components/EmptyState';
import { PostCard } from './components/PostCard';
import { FeaturedPostCard } from './components/FeaturedPostCard';

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

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));
  const filteredPosts =
    selectedTag === 'all' ? posts : posts.filter((post) => post.tags.includes(selectedTag));
  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ブログ | AI Chat - 最新の AI チャット情報</title>
        <meta
          name="description"
          content="AI Chatの最新情報、導入事例、活用方法についてご紹介します。"
        />
      </Head>

      <BlogHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TagFilter tags={allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />

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

        {filteredPosts.length === 0 && <EmptyState selectedTag={selectedTag} />}
      </div>

      <BlogCTA />
    </div>
  );
};

export default BlogPage;
