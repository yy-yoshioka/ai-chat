'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataRetention } from '@/_hooks/settings/useDataRetention';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RetentionJobHistoryProps {
  orgId: string;
}

export function RetentionJobHistory({ orgId }: RetentionJobHistoryProps) {
  const { jobs, refetch } = useDataRetention(orgId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      running: 'default',
      completed: 'outline',
      failed: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: '待機中',
      running: '実行中',
      completed: '完了',
      failed: '失敗',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getJobTypeLabel = (jobType: string) => {
    const labels: Record<string, string> = {
      chat_logs: 'チャットログ',
      webhook_logs: 'Webhookログ',
      system_metrics: 'システムメトリクス',
      health_checks: 'ヘルスチェック',
      chat_logs_anonymization: 'チャットログ匿名化',
    };

    return labels[jobType] || jobType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          実行履歴
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? '更新中...' : '更新'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">まだ実行履歴がありません</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{getJobTypeLabel(job.jobType)}</h4>
                    <p className="text-sm text-gray-600">
                      作成日時:{' '}
                      {format(new Date(job.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">処理件数:</span>
                    <span className="ml-2 font-medium">{job.itemsProcessed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">削除件数:</span>
                    <span className="ml-2 font-medium">{job.itemsDeleted}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">匿名化件数:</span>
                    <span className="ml-2 font-medium">{job.itemsAnonymized}</span>
                  </div>
                </div>

                {job.startedAt && (
                  <p className="text-sm text-gray-600">
                    開始時刻: {format(new Date(job.startedAt), 'HH:mm:ss', { locale: ja })}
                  </p>
                )}

                {job.completedAt && (
                  <p className="text-sm text-gray-600">
                    完了時刻: {format(new Date(job.completedAt), 'HH:mm:ss', { locale: ja })}
                  </p>
                )}

                {job.error && (
                  <div className="p-2 bg-red-50 rounded text-sm text-red-800">
                    エラー: {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
