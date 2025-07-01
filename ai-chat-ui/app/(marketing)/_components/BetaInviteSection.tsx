'use client';

import { useState } from 'react';
import { fetchPost } from '../../_utils/fetcher';

export function BetaInviteSection() {
  const [betaEmail, setBetaEmail] = useState('');
  const [betaCompany, setBetaCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ベータ招待リクエストを送信
      await fetchPost('/api/beta-invite', {
        email: betaEmail,
        company: betaCompany,
      });

      setSubmitMessage(
        '🎉 ベータ招待リクエストを受け付けました！優先的にご案内させていただきます。'
      );
      setBetaEmail('');
      setBetaCompany('');
    } catch (error) {
      console.error('Beta invite submission error:', error);
      setSubmitMessage('⚠️ エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="beta-invite" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🚀 ベータ版早期アクセス
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              先着100社限定で、ベータ版を<strong>6ヶ月間無料</strong>でお使いいただけます
            </p>
            <p className="text-gray-500">
              正式版リリース後も<strong>50%割引</strong>でご利用可能 • 専任サポート付き
            </p>
          </div>

          <form onSubmit={handleBetaSubmit} className="max-w-lg mx-auto">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={betaEmail}
                  onChange={(e) => setBetaEmail(e.target.value)}
                  placeholder="ビジネスメールアドレス"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={betaCompany}
                  onChange={(e) => setBetaCompany(e.target.value)}
                  placeholder="会社名・サービス名"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '送信中...' : '🎯 ベータ版に申し込む（無料）'}
              </button>
            </div>
          </form>

          {submitMessage && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">{submitMessage}</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            ✅ クレジットカード不要 &nbsp; ✅ いつでもキャンセル可能 &nbsp; ✅ 30秒で完了
          </div>
        </div>
      </div>
    </section>
  );
}
