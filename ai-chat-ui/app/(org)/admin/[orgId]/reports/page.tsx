'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  totalUsers: number;
  totalChats: number;
  avgSatisfaction: number;
  responseTime: number;
  dailyStats: Array<{ date: string; chats: number; satisfaction: number }>;
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    // Sample report data
    const sampleData: ReportData = {
      totalUsers: 1250,
      totalChats: 3456,
      avgSatisfaction: 4.2,
      responseTime: 1.8,
      dailyStats: [
        { date: '2024-01-14', chats: 120, satisfaction: 4.1 },
        { date: '2024-01-15', chats: 135, satisfaction: 4.3 },
        { date: '2024-01-16', chats: 98, satisfaction: 4.0 },
        { date: '2024-01-17', chats: 156, satisfaction: 4.4 },
        { date: '2024-01-18', chats: 142, satisfaction: 4.2 },
        { date: '2024-01-19', chats: 189, satisfaction: 4.5 },
        { date: '2024-01-20', chats: 167, satisfaction: 4.3 },
      ],
    };

    setTimeout(() => {
      setReportData(sampleData);
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">過去7日間</option>
          <option value="30days">過去30日間</option>
          <option value="90days">過去90日間</option>
        </select>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総チャット数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.totalChats.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均満足度</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.avgSatisfaction}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均応答時間</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.responseTime}秒</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">日別チャット数</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.dailyStats.map((stat) => (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-full rounded-t"
                      style={{
                        height: `${(stat.chats / Math.max(...reportData.dailyStats.map((s) => s.chats))) * 200}px`,
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(stat.date).toLocaleDateString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">満足度推移</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.dailyStats.map((stat) => (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-yellow-500 w-full rounded-t"
                      style={{
                        height: `${(stat.satisfaction / 5) * 200}px`,
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(stat.date).toLocaleDateString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">エクスポート</h3>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                CSV形式でダウンロード
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                PDF形式でダウンロード
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Excelファイルでダウンロード
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
