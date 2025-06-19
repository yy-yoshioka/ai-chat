import { useState } from 'react';

const AIGovernancePage = () => {
  const [settings, setSettings] = useState({
    confidenceThreshold: 70,
    autoReview: true,
    retentionDays: 1095,
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Governance Layer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">1,234</div>
          <div className="text-sm text-gray-600">総AI回答数</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">89</div>
          <div className="text-sm text-gray-600">要レビュー</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">85.5%</div>
          <div className="text-sm text-gray-600">平均信頼度</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">ガバナンス設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                信頼度閾値: {settings.confidenceThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.confidenceThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, confidenceThreshold: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoReview}
                onChange={(e) => setSettings({ ...settings, autoReview: e.target.checked })}
              />
              <span>自動レビュー</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">データ保持期間（日）</label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, retentionDays: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">レビューキュー</h2>
          <div className="space-y-3">
            {[
              { id: '1', confidence: 65, question: '料金プランについて教えて' },
              { id: '2', confidence: 58, question: 'キャンセル方法は？' },
              { id: '3', confidence: 72, question: 'セキュリティ機能について' },
            ].map((item) => (
              <div key={item.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{item.question}</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        item.confidence < 70
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.confidence}%
                    </span>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      レビュー
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGovernancePage;
