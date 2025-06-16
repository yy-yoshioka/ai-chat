import { useState } from 'react';

const AIInsightsPage = () => {
  const [metrics] = useState({
    avgCSAT: 4.2,
    sentimentScore: 78,
    faqGaps: 12,
    embeddingDrift: 0.7,
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Insights Hub</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">CSAT vs Sentiment</h2>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.avgCSAT}/5</div>
            <div className="text-sm text-gray-600">平均CSAT</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">FAQ ギャップ分析</h2>
          <div className="space-y-2">
            {['価格設定について', 'アカウント削除方法', 'データエクスポート'].map((gap, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm">{gap}</span>
                <span className="text-xs text-red-600">要対応</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Embedding Drift Monitor</h2>
        <div className="flex items-center space-x-4">
          <div
            className={`px-3 py-1 rounded text-sm ${
              metrics.embeddingDrift > 0.6
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            Similarity: {metrics.embeddingDrift}
          </div>
          {metrics.embeddingDrift < 0.6 && (
            <span className="text-red-600 text-sm">⚠️ アラート: 閾値を下回っています</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
