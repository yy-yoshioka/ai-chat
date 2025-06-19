import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

interface CancelSession {
  id: string;
  planName?: string;
  amount?: number;
  cancelReason?: string;
}

export default function BillingCancelPage() {
  const router = useRouter();
  const { session_id, reason } = router.query;
  const [session, setSession] = useState<CancelSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchCancelSession = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);

        // モック実装
        setTimeout(() => {
          setSession({
            id: sessionId,
            planName: 'Professional',
            amount: 9800,
            cancelReason: (reason as string) || 'user_cancelled',
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch cancel session:', err);
        setLoading(false);
      }
    },
    [reason]
  );

  useEffect(() => {
    if (session_id) {
      fetchCancelSession(session_id as string);
    } else {
      setLoading(false);
    }
  }, [session_id, fetchCancelSession]);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      // フィードバック送信API呼び出し（モック）
      console.log('Feedback submitted:', feedback);
      setFeedbackSent(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getCancelReason = (reason?: string) => {
    switch (reason) {
      case 'payment_failed':
        return '支払い処理でエラーが発生しました';
      case 'card_declined':
        return 'カードが承認されませんでした';
      case 'insufficient_funds':
        return '残高不足のため処理できませんでした';
      case 'user_cancelled':
        return 'お客様によりキャンセルされました';
      default:
        return '処理がキャンセルされました';
    }
  };

  const getRecommendation = (reason?: string) => {
    switch (reason) {
      case 'payment_failed':
      case 'card_declined':
        return '別のカードをお試しいただくか、カード会社にお問い合わせください。';
      case 'insufficient_funds':
        return 'アカウントの残高をご確認の上、再度お試しください。';
      default:
        return 'いつでも再度お申し込みいただけます。';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">情報を確認しています...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-orange-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              お申し込みがキャンセルされました
            </h1>
            <p className="text-lg text-gray-600">{getCancelReason(session?.cancelReason)}</p>
          </div>

          {/* Cancel Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">詳細情報</h2>

            {session && (
              <div className="space-y-4">
                {session.planName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">プラン:</span>
                    <span className="font-medium text-gray-900">{session.planName}</span>
                  </div>
                )}

                {session.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">金額:</span>
                    <span className="font-medium text-gray-900">
                      ¥{session.amount.toLocaleString()}/月
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">キャンセル理由:</span>
                  <span className="font-medium text-gray-900">
                    {getCancelReason(session.cancelReason)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>ご安心ください</strong>
                    <br />
                    {getRecommendation(session?.cancelReason)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              フィードバックをお聞かせください
            </h2>

            {!feedbackSent ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  今回のキャンセルについて、改善のためのご意見をいただけますでしょうか？（任意）
                </p>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="ご意見・ご要望がございましたらお聞かせください..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  フィードバックを送信
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                <p className="text-gray-900 font-medium">フィードバックありがとうございました！</p>
                <p className="text-gray-600 text-sm">
                  いただいたご意見はサービス改善に活用させていただきます。
                </p>
              </div>
            )}
          </div>

          {/* Alternative Options */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">その他のオプション</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">無料デモを試す</h3>
                  <p className="text-gray-600 text-sm">まずは機能をお試しいただけます。</p>
                  <Link
                    href="/demo"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    デモを開始 →
                  </Link>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">サポートに相談</h3>
                  <p className="text-gray-600 text-sm">
                    ご不明な点がございましたらお気軽にお問い合わせください。
                  </p>
                  <Link
                    href="/help"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    サポートセンター →
                  </Link>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">再度お申し込み</h3>
                  <p className="text-gray-600 text-sm">
                    問題が解決されましたら、いつでも再度お申し込みいただけます。
                  </p>
                  <Link
                    href="/billing"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    プラン選択 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
