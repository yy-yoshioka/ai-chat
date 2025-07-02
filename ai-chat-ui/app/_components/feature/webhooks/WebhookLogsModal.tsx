'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWebhookLogs } from '@/app/_hooks/webhooks/useWebhookLogs';
import type { WebhookLogStatus } from '@/app/_schemas/webhooks';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface WebhookLogsModalProps {
  webhookId: string | null;
  webhookName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookLogsModal({
  webhookId,
  webhookName,
  isOpen,
  onClose,
}: WebhookLogsModalProps) {
  const [statusFilter, setStatusFilter] = useState<WebhookLogStatus | undefined>();
  const { logs, isLoading, refetch } = useWebhookLogs(webhookId, { status: statusFilter });

  if (!isOpen || !webhookId) return null;

  const getStatusIcon = (status: WebhookLogStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: WebhookLogStatus) => {
    const variants = {
      success: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const,
    };

    const labels = {
      success: '成功',
      failed: '失敗',
      pending: '保留中',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden m-4">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Webhookログ</h2>
            <p className="text-sm text-gray-600">{webhookName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={statusFilter === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(undefined)}
            >
              すべて
            </Button>
            <Button
              variant={statusFilter === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('success')}
            >
              成功
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('failed')}
            >
              失敗
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              保留中
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ログがありません</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className="font-medium">{log.event}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>

                  {log.statusCode && (
                    <p className="text-sm text-gray-600 mb-2">ステータスコード: {log.statusCode}</p>
                  )}

                  {log.attempts > 1 && (
                    <p className="text-sm text-gray-600 mb-2">試行回数: {log.attempts}</p>
                  )}

                  {log.error && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                      エラー: {log.error}
                    </div>
                  )}

                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      詳細を表示
                    </summary>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">ペイロード:</p>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>

                      {log.response && (
                        <>
                          <p className="text-xs text-gray-600 mb-1 mt-2">レスポンス:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {log.response}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
