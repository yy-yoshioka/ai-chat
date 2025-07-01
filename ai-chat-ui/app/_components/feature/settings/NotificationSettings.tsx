'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNotificationSettings } from '@/_hooks/settings/useSettings';

interface NotificationSettingsProps {
  orgId: string;
}

const NOTIFICATION_TYPES = [
  {
    id: 'new_chat',
    name: '新しいチャット',
    description: '新しいチャットセッションが開始されたとき',
    icon: MessageSquare,
    category: 'activity',
  },
  {
    id: 'unresolved_question',
    name: '未解決の質問',
    description: 'AIが回答できない質問があったとき',
    icon: AlertCircle,
    category: 'alerts',
  },
  {
    id: 'usage_limit',
    name: '使用量の上限',
    description: '月間使用量が上限に近づいたとき',
    icon: TrendingUp,
    category: 'billing',
  },
  {
    id: 'weekly_report',
    name: '週次レポート',
    description: '毎週月曜日にサマリーレポートを送信',
    icon: Mail,
    category: 'reports',
  },
];

export function NotificationSettings({ orgId }: NotificationSettingsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { settings, isLoading, updateSettings } = useNotificationSettings(orgId);
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const toggleNotification = (notificationId: string, channel: 'email' | 'app') => {
    setLocalSettings((prev) => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        [channel]: !prev[notificationId]?.[channel],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: '設定を保存しました',
      });
    } catch {
      toast({
        title: 'エラー',
        description: '設定の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // カテゴリ別にグループ化
  const notificationsByCategory = NOTIFICATION_TYPES.reduce(
    (acc, notif) => {
      if (!acc[notif.category]) {
        acc[notif.category] = [];
      }
      acc[notif.category].push(notif);
      return acc;
    },
    {} as Record<string, typeof NOTIFICATION_TYPES>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知設定
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            保存
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(notificationsByCategory).map(([category, notifications]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                {category === 'activity' && 'アクティビティ'}
                {category === 'alerts' && 'アラート'}
                {category === 'billing' && '請求'}
                {category === 'reports' && 'レポート'}
              </h3>
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-3 border rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{notification.name}</p>
                        <p className="text-sm text-gray-500">{notification.description}</p>
                        <div className="flex items-center gap-6 mt-2">
                          <label className="flex items-center gap-2">
                            <Switch
                              checked={localSettings[notification.id]?.email || false}
                              onCheckedChange={() => toggleNotification(notification.id, 'email')}
                            />
                            <span className="text-sm">メール</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <Switch
                              checked={localSettings[notification.id]?.app || false}
                              onCheckedChange={() => toggleNotification(notification.id, 'app')}
                            />
                            <span className="text-sm">アプリ内</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
