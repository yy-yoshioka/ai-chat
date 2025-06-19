import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import FAQForm from '@/components/FAQ/FAQForm';

export default function CreateFAQPage() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/admin/faq" className="hover:text-blue-600 transition-colors">
            FAQ管理
          </Link>
          <span>/</span>
          <span className="text-gray-900">新規作成</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新しいFAQ作成</h1>
              <p className="text-gray-600 mt-1">
                ユーザーからよく寄せられる質問と回答を追加してください
              </p>
            </div>
            <Link
              href="/admin/faq"
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              戻る
            </Link>
          </div>

          {/* Form */}
          <FAQForm onSubmitSuccess={() => router.push('/admin/faq')} />
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 FAQの作成のコツ</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>質問は具体的で分かりやすい表現にしましょう</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>回答は簡潔で理解しやすい内容を心がけましょう</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>必要に応じて手順を番号付きで説明しましょう</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
