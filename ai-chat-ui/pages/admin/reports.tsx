import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface ReportData {
  userGrowth: { month: string; users: number }[];
  chatVolume: { date: string; chats: number }[];
  satisfaction: { score: number; count: number }[];
  popularTopics: { topic: string; count: number; avgRating: number }[];
  performanceMetrics: {
    avgResponseTime: number;
    successRate: number;
    totalChats: number;
    activeUsers: number;
  };
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sampleData: ReportData = {
        userGrowth: [
          { month: '2024-01', users: 120 },
          { month: '2024-02', users: 180 },
          { month: '2024-03', users: 250 },
          { month: '2024-04', users: 320 },
          { month: '2024-05', users: 450 },
          { month: '2024-06', users: 580 },
        ],
        chatVolume: [
          { date: '2024-01-15', chats: 45 },
          { date: '2024-01-16', chats: 52 },
          { date: '2024-01-17', chats: 38 },
          { date: '2024-01-18', chats: 67 },
          { date: '2024-01-19', chats: 73 },
          { date: '2024-01-20', chats: 89 },
        ],
        satisfaction: [
          { score: 5, count: 245 },
          { score: 4, count: 189 },
          { score: 3, count: 67 },
          { score: 2, count: 23 },
          { score: 1, count: 12 },
        ],
        popularTopics: [
          { topic: '料金プラン', count: 156, avgRating: 4.2 },
          { topic: 'テクニカルサポート', count: 134, avgRating: 3.8 },
          { topic: '機能について', count: 98, avgRating: 4.5 },
          { topic: 'アカウント問題', count: 87, avgRating: 3.9 },
          { topic: 'その他', count: 61, avgRating: 4.1 },
        ],
        performanceMetrics: {
          avgResponseTime: 2.3,
          successRate: 96.7,
          totalChats: 1542,
          activeUsers: 847,
        },
      };

      setReportData(sampleData);
      setLoading(false);
    };

    fetchReportData();
  }, [dateRange]);

  const exportReport = (format: 'csv' | 'pdf') => {
    alert(`${format.toUpperCase()}形式でレポートをエクスポートします`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">レポート種別</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">概要レポート</option>
                  <option value="detailed">詳細レポート</option>
                  <option value="performance">パフォーマンス</option>
                  <option value="satisfaction">満足度分析</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => exportReport('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                CSV
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総チャット数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.performanceMetrics.totalChats.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">+12% 前月比</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.performanceMetrics.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">+8% 前月比</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">平均応答時間</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.performanceMetrics.avgResponseTime}秒
                    </p>
                    <p className="text-xs text-green-600">-5% 前月比</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">成功率</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.performanceMetrics.successRate}%
                    </p>
                    <p className="text-xs text-green-600">+2% 前月比</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">ユーザー成長</h3>
                <div className="space-y-3">
                  {reportData.userGrowth.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.users / Math.max(...reportData.userGrowth.map((d) => d.users))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">{item.users}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satisfaction Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">満足度分布</h3>
                <div className="space-y-3">
                  {reportData.satisfaction.map((item) => (
                    <div key={item.score} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 w-8">{item.score}★</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mx-3">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${(item.count / Math.max(...reportData.satisfaction.map((d) => d.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">人気のトピック</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        トピック
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        チャット数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        平均評価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        シェア
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.popularTopics.map((topic, index) => (
                      <tr key={topic.topic}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-gray-900">{topic.topic}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {topic.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-1">{topic.avgRating}</span>
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= Math.round(topic.avgRating) ? '' : 'text-gray-300'
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(topic.count / reportData.popularTopics[0].count) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(
                                (topic.count /
                                  reportData.popularTopics.reduce((sum, t) => sum + t.count, 0)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Chat Volume */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">日別チャットボリューム</h3>
              <div className="space-y-3">
                {reportData.chatVolume.map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('ja-JP')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-48 bg-gray-200 rounded-full h-3 mr-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{
                            width: `${(item.chats / Math.max(...reportData.chatVolume.map((d) => d.chats))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16">{item.chats}件</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
