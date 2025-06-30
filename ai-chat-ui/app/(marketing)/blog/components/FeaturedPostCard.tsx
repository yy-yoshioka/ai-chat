import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
}

interface FeaturedPostCardProps {
  post: BlogPost;
}

export function FeaturedPostCard({ post }: FeaturedPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 hover:shadow-xl transition-all">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <time dateTime={post.date}>{post.date}</time>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-700 mb-4 line-clamp-3">{post.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">by {post.author}</span>
        </div>
      </article>
    </Link>
  );
}
