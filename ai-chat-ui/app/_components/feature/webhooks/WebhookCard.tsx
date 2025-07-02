'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Webhook,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  TestTube,
  Activity,
} from 'lucide-react';
import type { Webhook as WebhookType } from '@/app/_schemas/webhooks';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface WebhookCardProps {
  webhook: WebhookType;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  onToggle: (isActive: boolean) => void;
  onShowLogs: () => void;
}

export function WebhookCard({
  webhook,
  onEdit,
  onDelete,
  onTest,
  onToggle,
  onShowLogs,
}: WebhookCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Webhook className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{webhook.name}</h3>
              <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                {webhook.isActive ? '有効' : '無効'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{webhook.url}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {webhook.events.map((event) => (
                <Badge key={event} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>

            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>タイムアウト: {webhook.timeoutMs / 1000}秒</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>リトライ: {webhook.retryCount}回</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              作成日:{' '}
              {formatDistanceToNow(new Date(webhook.createdAt), {
                addSuffix: true,
                locale: ja,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={webhook.isActive}
            onCheckedChange={onToggle}
            aria-label="Webhookの有効/無効を切り替え"
          />

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <button
                    onClick={() => {
                      onShowLogs();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    ログを表示
                  </button>
                  <button
                    onClick={() => {
                      onTest();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    テスト送信
                  </button>
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </button>
                  <div className="border-t" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
