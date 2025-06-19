import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

interface CheckoutSession {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  trialEnd?: string;
  isTrialActive: boolean;
}

export default function BillingSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session_id) {
      fetchCheckoutSession(session_id as string);
    }
  }, [session_id]);

  const fetchCheckoutSession = async (sessionId: string) => {
    try {
      setLoading(true);

      // 実際の実装では以下のAPIを呼び出します:
      // const response = await fetch(`/api/billing/session/${sessionId}`);

      // モック実装
      setTimeout(() => {
        setSession({
          id: sessionId,
          planName: 'Professional',
          amount: 9800,
          currency: 'jpy',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          isTrialActive: true,
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to fetch checkout session:', err);
      setError('セッション情報の取得に失敗しました');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">支払い情報を確認しています...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/billing" className="text-blue-600 hover:text-blue-800 font-medium">
              プラン選択に戻る
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              お申し込みありがとうございます！
            </h1>
            <p className="text-lg text-gray-600">
              {session?.isTrialActive
                ? '14日間の無料トライアルが開始されました'
                : 'サブスクリプションが有効になりました'}
            </p>
          </div>

          {/* Plan Details */}
          {session && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">プラン詳細</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">選択プラン</h3>
                  <p className="text-lg font-semibold text-gray-900">{session.planName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">月額料金</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    ¥{session.amount.toLocaleString()}/月
                  </p>
                </div>

                {session.isTrialActive && session.trialEnd && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">トライアル期間</h3>
                      <p className="text-lg font-semibold text-green-600">14日間無料</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">初回課金日</h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(session.trialEnd).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {session.isTrialActive && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>14日間無料トライアル中</strong>
                        <br />
                        トライアル期間中はいつでもキャンセル可能です。
                        {session.trialEnd &&
                          ` ${new Date(session.trialEnd).toLocaleDateString('ja-JP')} に初回課金が行われます。`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">次のステップ</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">ウィジェットを設置</h3>
                  <p className="text-gray-600 text-sm">
                    あなたのWebサイトにAIチャットウィジェットを設置しましょう。
                  </p>
                  <Link
                    href="/widgets"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ウィジェット設置ガイド →
                  </Link>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">FAQを作成</h3>
                  <p className="text-gray-600 text-sm">
                    よくある質問を追加して、AIの回答精度を向上させましょう。
                  </p>
                  <Link
                    href="/admin/faq"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    FAQ管理 →
                  </Link>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">設定をカスタマイズ</h3>
                  <p className="text-gray-600 text-sm">
                    チャットの応答や外観を御社のブランドに合わせて調整できます。
                  </p>
                  <Link
                    href="/admin/settings"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    設定管理 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              管理画面へ進む
            </Link>

            <div className="text-sm text-gray-500">
              ご質問がございましたら、
              <Link href="/help" className="text-blue-600 hover:text-blue-800 font-medium">
                ヘルプセンター
              </Link>
              をご確認ください。
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
