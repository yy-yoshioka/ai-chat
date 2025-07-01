import { BlogPostData } from '../types';

interface ArticleHeaderProps {
  post: BlogPostData;
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
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
              <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
