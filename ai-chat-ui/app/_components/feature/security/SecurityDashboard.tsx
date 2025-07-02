'use client';

import { useSecurityReport } from '@/app/_hooks/security/useSecurityReport';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/_components/ui/card';
import { format, subDays } from 'date-fns';
import { AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface SecurityDashboardProps {
  orgId: string;
}

export function SecurityDashboard({ orgId }: SecurityDashboardProps) {
  const dateRange = {
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  };

  const { report, isLoading } = useSecurityReport(dateRange.startDate, dateRange.endDate, orgId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return <div>セキュリティレポートの取得に失敗しました</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総イベント数</p>
                <p className="text-2xl font-bold">{report.summary.totalEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">失敗イベント</p>
                <p className="text-2xl font-bold">{report.summary.failedEvents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">高リスクイベント</p>
                <p className="text-2xl font-bold">{report.summary.highRiskEvents}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="text-2xl font-bold">{report.summary.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions */}
      <Card>
        <CardHeader>
          <CardTitle>上位アクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.topActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <span className="text-sm">{action.action}</span>
                <span className="text-sm font-medium">{action.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle>データアクセス概要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テーブル
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    回数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.dataAccess.map((access, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{access.table}</td>
                    <td className="px-4 py-2 text-sm">{access.operation}</td>
                    <td className="px-4 py-2 text-sm">{access.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
