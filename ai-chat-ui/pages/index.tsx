import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaCompany, setBetaCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ユーザーがログイン済みの場合はchatページにリダイレクト
  useEffect(() => {
    if (user) {
      window.location.href = '/chat';
    }
  }, [user]);

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ベータ招待リクエストを送信
      const response = await fetch('/api/beta-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: betaEmail,
          company: betaCompany,
        }),
      });

      if (response.ok) {
        setSubmitMessage(
          '🎉 ベータ招待リクエストを受け付けました！優先的にご案内させていただきます。'
        );
        setBetaEmail('');
        setBetaCompany('');
      } else {
        setSubmitMessage('⚠️ エラーが発生しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Beta invite submission error:', error);
      setSubmitMessage('⚠️ エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">チャットページに移動中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/faq"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/blog"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/status"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Status
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Enhanced Value Proposition */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                🚀 早期アクセスベータ版受付中
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              顧客サポート革命
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent block">
                AI チャットボットで
              </span>
              <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                売上 3倍UP
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              <strong>わずか5分の設置</strong>で、24時間365日対応の AI
              チャットボットがあなたのウェブサイトに。
              <br />
              Intercom や Zendesk の<strong>1/10のコスト</strong>で、
              <strong>顧客満足度92%向上</strong>、<strong>問い合わせ対応時間80%短縮</strong>を実現。
            </p>

            {/* Key Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                '💰 月額コスト90%削減',
                '⚡ 5分で設置完了',
                '🎯 CV率3.2倍向上',
                '📈 顧客満足度92%UP',
                '🌍 100言語対応',
                '🔒 SOC2準拠',
              ].map((benefit, index) => (
                <span
                  key={index}
                  className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
                >
                  {benefit}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                14日間無料トライアル
              </Link>
              <a
                href="#beta-invite"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                ベータ版早期アクセス
              </a>
            </div>
          </div>
        </div>

        {/* Social Proof Ticker */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">信頼される企業に選ばれています</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['スタートアップA', 'EC企業B', 'SaaS会社C', 'メディアD', 'コンサルE'].map(
              (company, index) => (
                <div key={index} className="text-gray-400 font-medium text-lg">
                  {company}
                </div>
              )
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              あなたの会社ではどれくらい節約できる？
            </h2>
            <p className="text-xl text-gray-600">
              従来のカスタマーサポートツールと比較して、コスト削減効果を確認してみましょう
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-red-600 mb-2">従来ツール</div>
                <div className="text-lg text-gray-600 mb-4">月額 $2,000〜</div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 複雑な設定</li>
                  <li>• 高額な月額費用</li>
                  <li>• 専門スタッフ必要</li>
                  <li>• 導入に数ヶ月</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg transform scale-105">
                <div className="text-3xl font-bold mb-2">AI Chat</div>
                <div className="text-lg mb-4">月額 $199〜</div>
                <ul className="text-sm space-y-2">
                  <li>• 5分で設置完了</li>
                  <li>• 90%コスト削減</li>
                  <li>• 技術者不要</li>
                  <li>• 即日運用開始</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">年間節約額</div>
                <div className="text-lg text-gray-600 mb-4">$21,612</div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 人件費削減</li>
                  <li>• ツール費削減</li>
                  <li>• 効率向上</li>
                  <li>• 機会損失防止</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              なぜ AI Chat が選ばれるのか
            </h2>
            <p className="text-xl text-gray-600">他社との圧倒的な違いを体感してください</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-white border hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">業界最速0.3秒レスポンス</h3>
              <p className="text-gray-600 mb-4">
                最新のGPT-4o技術により、業界最速クラスの応答速度を実現。 顧客を待たせません。
              </p>
              <div className="text-sm text-blue-600 font-medium">競合他社: 2-5秒</div>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-white border hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">97.8% 回答精度</h3>
              <p className="text-gray-600 mb-4">
                あなたの業界・企業に特化したAIモデルで、 的確な回答を提供します。
              </p>
              <div className="text-sm text-blue-600 font-medium">競合他社: 82-90%</div>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-white border hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                エンタープライズ級セキュリティ
              </h3>
              <p className="text-gray-600 mb-4">
                SOC2 Type II準拠、GDPR対応、ISO27001認証。 大企業でも安心してご利用いただけます。
              </p>
              <div className="text-sm text-blue-600 font-medium">金融・医療業界でも導入実績</div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <h3 className="text-2xl font-bold text-center">機能比較表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">機能</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">
                      AI Chat
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                      Intercom
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                      Zendesk
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                      其他社A
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    {
                      feature: '月額料金 (スタート)',
                      ai: '$199',
                      intercom: '$2,000',
                      zendesk: '$1,500',
                      other: '$1,200',
                    },
                    {
                      feature: '設置時間',
                      ai: '5分',
                      intercom: '2-4週間',
                      zendesk: '1-3週間',
                      other: '1-2週間',
                    },
                    {
                      feature: '応答速度',
                      ai: '0.3秒',
                      intercom: '3-5秒',
                      zendesk: '2-4秒',
                      other: '4-8秒',
                    },
                    {
                      feature: '多言語対応',
                      ai: '100言語',
                      intercom: '45言語',
                      zendesk: '30言語',
                      other: '20言語',
                    },
                    {
                      feature: '24/7サポート',
                      ai: '✅',
                      intercom: '💰 有料',
                      zendesk: '💰 有料',
                      other: '❌',
                    },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-sm text-center text-blue-600 font-semibold">
                        {row.ai}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {row.intercom}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-500">{row.zendesk}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-500">{row.other}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Invite Form */}
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

      {/* Customer Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">お客様の成功事例</h2>
            <p className="text-xl text-gray-600">実際にAI Chatを導入した企業の成果をご覧ください</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: 'EC企業 A社',
                industry: 'Eコマース',
                metrics: '売上 +187%, CS効率 +340%',
                quote:
                  '深夜の問い合わせにも即座に対応できるようになり、機会損失が大幅に減少しました。',
                avatar: '🛒',
              },
              {
                company: 'SaaS企業 B社',
                industry: 'ソフトウェア',
                metrics: 'CV率 +250%, CS工数 -70%',
                quote: '技術的な質問にも正確に答えてくれるので、顧客満足度が格段に向上しました。',
                avatar: '💻',
              },
              {
                company: '医療法人 C社',
                industry: 'ヘルスケア',
                metrics: '患者満足度 +95%, 問い合わせ処理時間 -80%',
                quote: '24時間対応が可能になり、患者様に安心感を提供できています。',
                avatar: '🏥',
              },
            ].map((story, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4 text-center">{story.avatar}</div>
                <div className="text-center mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">{story.company}</h3>
                  <p className="text-gray-500 text-sm">{story.industry}</p>
                  <p className="text-blue-600 font-semibold mt-2">{story.metrics}</p>
                </div>
                <blockquote className="text-gray-600 italic text-center">
                  {`"${story.quote}"`}
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">よくある質問</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: '本当に5分で設置できますか？',
                a: 'はい、JavaScriptコードを1行追加するだけで完了します。技術知識は一切不要です。',
              },
              {
                q: '既存のCRMやヘルプデスクツールと連携できますか？',
                a: 'Salesforce、HubSpot、Slack、Notionなど主要なツールとAPI連携が可能です。',
              },
              {
                q: 'データのセキュリティは大丈夫ですか？',
                a: 'SOC2 Type II準拠、GDPR対応で、エンタープライズレベルのセキュリティを確保しています。',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-blue-600 hover:text-blue-800 font-medium">
              その他の質問を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ始めて、競合に差をつけませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14日間の無料トライアルで、AI Chatの効果を実際に体験してください。
            <br />
            クレジットカード不要、いつでもキャンセル可能です。
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🚀 14日間無料でスタート
            </Link>
            <a
              href="#beta-invite"
              className="bg-transparent text-white px-8 py-4 rounded-xl text-lg font-medium border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              📝 ベータ版に申し込む
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold">AI Chat</span>
              </div>
              <p className="text-gray-400 text-sm">
                次世代AI技術で、カスタマーサポートを革新します。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    機能一覧
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    料金プラン
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-white transition-colors">
                    連携サービス
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors">
                    セキュリティ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">リソース</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link href="/case-studies" className="hover:text-white transition-colors">
                    事例
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    ステータス
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">会社</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    プライバシー
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Chat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
