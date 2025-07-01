import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
}

export function Breadcrumb({ title }: BreadcrumbProps) {
  return (
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
          <span className="text-gray-900 truncate">{title}</span>
        </nav>
      </div>
    </div>
  );
}
