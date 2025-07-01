import Link from 'next/link';

export function BlogCTA() {
  return (
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
  );
}
