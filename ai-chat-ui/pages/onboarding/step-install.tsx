import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function StepInstallPage() {
  const router = useRouter();
  const [isExtending, setIsExtending] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7); // Mock data

  useEffect(() => {
    // Check if user should be auto-redirected
    // Trial残 3 日以下 && 未設置時に自動リダイレクト
    if (trialDaysLeft <= 3 && !isInstalled) {
      // Auto redirect to this page - user is already here, so no action needed
      console.log('User should see extension option due to low trial days and no installation');
    }
  }, [trialDaysLeft, isInstalled]);

  const handleExtendTrial = async () => {
    setIsExtending(true);

    try {
      // Get current organization ID
      const orgId = localStorage.getItem('currentOrgId'); // or get from auth context

      const response = await fetch('/api/trial/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: orgId,
        }),
      });

      if (response.ok) {
        // Update trial days
        setTrialDaysLeft((prev) => prev + 7);
        alert('トライアル期間を7日延長しました！');
      } else {
        const error = await response.json();
        alert(`延長に失敗しました: ${error.message || 'エラーが発生しました'}`);
      }
    } catch (error) {
      console.error('Trial extension error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsExtending(false);
    }
  };

  const copyInstallCode = () => {
    const code = `<script src="https://your-domain.com/widget.js" data-org-id="your-org-id"></script>`;
    navigator.clipboard.writeText(code);
    alert('インストールコードをコピーしました！');
  };

  const markAsInstalled = () => {
    setIsInstalled(true);
    // You might want to also call an API to mark installation status
    alert('インストール完了として記録しました！');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AIチャットをウェブサイトに設置
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              簡単なコードを追加するだけで、あなたのウェブサイトにAIチャット機能を追加できます
            </p>
          </div>

          {/* Trial Extension Alert - Show if 3 days or less left */}
          {trialDaysLeft <= 3 && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">⚠️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      トライアル期間が残り {trialDaysLeft} 日です
                    </h3>
                    <p className="text-yellow-800">設置を完了してトライアルを7日延長しませんか？</p>
                  </div>
                </div>
                <button
                  onClick={handleExtendTrial}
                  disabled={isExtending}
                  className={`px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition-colors ${
                    isExtending ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isExtending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      延長中...
                    </div>
                  ) : (
                    '＋7日延長'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Installation Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">設置手順</h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    インストールコードをコピー
                  </h3>
                  <p className="text-gray-600 mb-4">
                    以下のコードをコピーして、ウェブサイトの &lt;head&gt; タグ内に貼り付けてください
                  </p>
                  <div className="bg-gray-100 rounded-lg p-4 relative">
                    <code className="text-sm text-gray-800 font-mono break-all">
                      &lt;script src=&quot;https://your-domain.com/widget.js&quot;
                      data-org-id=&quot;your-org-id&quot;&gt;&lt;/script&gt;
                    </code>
                    <button
                      onClick={copyInstallCode}
                      className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      コピー
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ウェブサイトに反映</h3>
                  <p className="text-gray-600 mb-4">
                    変更をウェブサイトに反映させてください。通常は数分以内にチャットウィジェットが表示されます。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">動作確認</h3>
                  <p className="text-gray-600 mb-4">
                    ウェブサイトでチャットウィジェットが正常に動作することを確認してください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">設置状況</h2>

            {!isInstalled ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🔧</span>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">設置待ち</h3>
                <p className="text-gray-600 mb-6">まだウィジェットの設置が検出されていません</p>
                <button
                  onClick={markAsInstalled}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  設置完了をマーク
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">✅</span>
                <h3 className="text-xl font-semibold text-green-700 mb-2">設置完了</h3>
                <p className="text-gray-600 mb-6">ウィジェットが正常に設置されました！</p>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  ダッシュボードへ
                </button>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">設置に問題がありますか？</p>
            <div className="space-x-4">
              <a href="/help/installation" className="text-blue-600 hover:text-blue-800 underline">
                設置ガイド
              </a>
              <a href="/help/support" className="text-blue-600 hover:text-blue-800 underline">
                サポートに連絡
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
