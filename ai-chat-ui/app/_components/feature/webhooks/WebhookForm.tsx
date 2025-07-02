'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookEventType,
} from '@/app/_schemas/webhooks';

interface WebhookFormProps {
  initialData?: {
    name: string;
    url: string;
    events: WebhookEventType[];
    retryCount?: number;
    timeoutMs?: number;
  };
  onSubmit: (data: CreateWebhookInput | UpdateWebhookInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WebhookForm({ initialData, onSubmit, onCancel, isLoading }: WebhookFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [selectedEvents, setSelectedEvents] = useState<Set<WebhookEventType>>(
    new Set(initialData?.events || [])
  );
  const [retryCount, setRetryCount] = useState(initialData?.retryCount || 3);
  const [timeoutMs, setTimeoutMs] = useState(initialData?.timeoutMs || 30000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      url,
      events: Array.from(selectedEvents),
      retryCount,
      timeoutMs,
    };

    await onSubmit(data);
  };

  const toggleEvent = (event: WebhookEventType) => {
    const newEvents = new Set(selectedEvents);
    if (newEvents.has(event)) {
      newEvents.delete(event);
    } else {
      newEvents.add(event);
    }
    setSelectedEvents(newEvents);
  };

  const eventGroups = {
    チャット: ['chat.created'] as const,
    ユーザー: ['user.created', 'user.updated'] as const,
    ウィジェット: ['widget.created', 'widget.updated', 'widget.deleted'] as const,
    ナレッジベース: [
      'knowledge_base.created',
      'knowledge_base.updated',
      'knowledge_base.deleted',
    ] as const,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Webhook名を入力"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label>イベント</Label>
        <div className="mt-2 space-y-4">
          {Object.entries(eventGroups).map(([groupName, events]) => (
            <div key={groupName}>
              <p className="text-sm font-medium text-gray-700 mb-2">{groupName}</p>
              <div className="space-y-2">
                {events.map((event) => (
                  <label key={event} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedEvents.has(event)}
                      onCheckedChange={() => toggleEvent(event)}
                      disabled={isLoading}
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="retryCount">リトライ回数</Label>
          <Input
            id="retryCount"
            type="number"
            min="0"
            max="10"
            value={retryCount}
            onChange={(e) => setRetryCount(parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="timeoutMs">タイムアウト (ミリ秒)</Label>
          <Input
            id="timeoutMs"
            type="number"
            min="1000"
            max="60000"
            step="1000"
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(parseInt(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading || selectedEvents.size === 0}>
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
}
