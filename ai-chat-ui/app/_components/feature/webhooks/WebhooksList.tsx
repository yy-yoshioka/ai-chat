'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Webhook } from 'lucide-react';
import { useWebhooks } from '@/app/_hooks/webhooks/useWebhooks';
import { WebhookCard } from './WebhookCard';
import { CreateWebhookModal } from './CreateWebhookModal';
import { WebhookLogsModal } from './WebhookLogsModal';

export function WebhooksList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState('');
  const [showLogsModal, setShowLogsModal] = useState(false);

  const { webhooks, isLoading, createWebhook, updateWebhook, deleteWebhook, testWebhook } =
    useWebhooks();

  const handleEdit = (webhookId: string) => {
    // TODO: Implement edit modal
    console.log('Edit webhook:', webhookId);
  };

  const handleDelete = async (webhookId: string) => {
    if (confirm('このWebhookを削除してもよろしいですか？')) {
      await deleteWebhook(webhookId);
    }
  };

  const handleToggle = async (webhookId: string, isActive: boolean) => {
    await updateWebhook(webhookId, { isActive });
  };

  const handleShowLogs = (webhookId: string, webhookName: string) => {
    setSelectedWebhook(webhookId);
    setSelectedWebhookName(webhookName);
    setShowLogsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Webhook管理</h2>
            <p className="text-gray-600 mt-1">イベント発生時に外部サービスへ通知を送信します</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Webhook className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Webhookが登録されていません</h3>
            <p className="text-gray-600 mb-4">
              Webhookを作成して、イベントを外部サービスに通知しましょう
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              最初のWebhookを作成
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={() => handleEdit(webhook.id)}
                onDelete={() => handleDelete(webhook.id)}
                onTest={() => testWebhook(webhook.id)}
                onToggle={(isActive) => handleToggle(webhook.id, isActive)}
                onShowLogs={() => handleShowLogs(webhook.id, webhook.name)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWebhookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createWebhook}
      />

      <WebhookLogsModal
        webhookId={selectedWebhook}
        webhookName={selectedWebhookName}
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
      />
    </>
  );
}
