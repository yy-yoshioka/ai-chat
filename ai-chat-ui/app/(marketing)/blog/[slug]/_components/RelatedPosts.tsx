import Link from 'next/link';
import { RelatedPost } from '../types';

interface RelatedPostsProps {
  relatedPosts: RelatedPost[];
}

export function RelatedPosts({ relatedPosts }: RelatedPostsProps) {
  if (relatedPosts.length === 0) return null;

  return (
    <div className="bg-white border-t">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">関連記事</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedPosts.map((relatedPost) => (
            <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="block group">
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
  );
}
