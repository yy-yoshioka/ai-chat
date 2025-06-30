import Link from 'next/link';
import { ShareButton } from './ShareButton';
import { BlogPostData } from '../types';

interface ShareSectionProps {
  post: BlogPostData;
}

export function ShareSection({ post }: ShareSectionProps) {
  return (
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
  );
}
