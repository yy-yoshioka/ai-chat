import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import FAQForm, { FAQFormValues } from '@/components/FAQ/FAQForm';
import { api } from '@/lib/api';

export default function EditFAQPage() {
  const router = useRouter();
  const { id } = router.query;
  const [initialValues, setInitialValues] = useState<FAQFormValues>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchFaq = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<{ faq: FAQFormValues }>(`/faqs/${id}`);
        if (data?.faq) {
          setInitialValues(data.faq);
        } else {
          setError('FAQが見つかりません');
        }
      } catch (err) {
        setError('FAQの取得に失敗しました');
        console.error('Failed to fetch FAQ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">エラーが発生しました</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link
              href="/admin/faq"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              FAQ一覧に戻る
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/admin/faq" className="hover:text-blue-600 transition-colors">
            FAQ管理
          </Link>
          <span>/</span>
          <span className="text-gray-900">編集</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FAQ編集</h1>
              <p className="text-gray-600 mt-1">既存のFAQの内容を修正できます</p>
            </div>
            <div className="flex items-center space-x-3">
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
          </div>

          {/* Form */}
          {initialValues && (
            <FAQForm
              initialValues={initialValues}
              faqId={id as string}
              onSubmitSuccess={() => router.push('/admin/faq')}
            />
          )}
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">⚠️ 編集時の注意事項</h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>変更は即座に公開FAQページに反映されます</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>
                質問内容を大きく変更する場合は、新しいFAQとして作成することを検討してください
              </span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
