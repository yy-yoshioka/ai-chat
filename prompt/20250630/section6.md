# Section-6: Settings, Notifications, and Logs
`<todo-key>: settings-suite`

## 🎯 目的
各種設定ページ、通知センター、ログビューアを実装

## 📋 作業内容

### 1. API設定ページ
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/settings/api/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { APIKeyManager } from '@/_components/feature/settings/APIKeyManager';

export default function APISettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="API設定"
        description="APIキーの管理とWebhook設定"
      />
      
      <div className="mt-8">
        <APIKeyManager orgId={orgId} />
      </div>
    </div>
  );
}
```

### 2. APIKeyManagerコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/settings/APIKeyManager.tsx
'use client';

import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAPIKeys } from '@/_hooks/settings/useSettings';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface APIKeyManagerProps {
  orgId: string;
}

export function APIKeyManager({ orgId }: APIKeyManagerProps) {
  const { apiKeys, isLoading, createKey, deleteKey } = useAPIKeys(orgId);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  const toggleKeyVisibility = (keyId: string) => {
    const newShowKeys = new Set(showKeys);
    if (newShowKeys.has(keyId)) {
      newShowKeys.delete(keyId);
    } else {
      newShowKeys.add(keyId);
    }
    setShowKeys(newShowKeys);
  };
  
  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({
        title: 'コピーしました',
        description: 'APIキーをクリップボードにコピーしました',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'コピーに失敗しました',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    setIsCreating(true);
    try {
      const newKey = await createKey(newKeyName);
      
      // 新しいキーを表示
      setShowKeys(new Set([newKey.id]));
      setNewKeyName('');
      
      toast({
        title: 'APIキーを作成しました',
        description: 'このキーは一度しか表示されません。安全に保管してください。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'APIキーの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('このAPIキーを削除してもよろしいですか？')) return;
    
    try {
      await deleteKey(keyId);
      toast({
        title: 'APIキーを削除しました',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'APIキーの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          APIキー管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 新規作成 */}
          <div className="flex gap-2">
            <Input
              placeholder="APIキー名（例: Production API）"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button
              onClick={handleCreateKey}
              disabled={isCreating || !newKeyName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              作成
            </Button>
          </div>
          
          {/* キー一覧 */}
          <div className="space-y-2">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{apiKey.name}</span>
                    <Badge variant="secondary">
                      {apiKey.lastUsed ? 'Active' : 'Unused'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="font-mono text-sm">
                      {showKeys.has(apiKey.id) 
                        ? apiKey.key 
                        : `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}`
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    作成: {formatDistanceToNow(new Date(apiKey.createdAt), { 
                      addSuffix: true, 
                      locale: ja 
                    })}
                    {apiKey.lastUsed && (
                      <> • 最終使用: {formatDistanceToNow(new Date(apiKey.lastUsed), { 
                        addSuffix: true, 
                        locale: ja 
                      })}</>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteKey(apiKey.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          
          {apiKeys.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              APIキーがまだありません
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. 通知設定ページ
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/settings/notifications/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { NotificationSettings } from '@/_components/feature/settings/NotificationSettings';

export default function NotificationSettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="通知設定"
        description="メール通知とアプリ内通知の設定"
      />
      
      <div className="mt-8">
        <NotificationSettings orgId={orgId} />
      </div>
    </div>
  );
}
```

### 4. NotificationSettingsコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/settings/NotificationSettings.tsx
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
    category: 'activity'
  },
  {
    id: 'unresolved_question',
    name: '未解決の質問',
    description: 'AIが回答できない質問があったとき',
    icon: AlertCircle,
    category: 'alerts'
  },
  {
    id: 'usage_limit',
    name: '使用量の上限',
    description: '月間使用量が上限に近づいたとき',
    icon: TrendingUp,
    category: 'billing'
  },
  {
    id: 'weekly_report',
    name: '週次レポート',
    description: '毎週月曜日にサマリーレポートを送信',
    icon: Mail,
    category: 'reports'
  }
];

export function NotificationSettings({ orgId }: NotificationSettingsProps) {
  const { settings, isLoading, updateSettings } = useNotificationSettings(orgId);
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const toggleNotification = (notificationId: string, channel: 'email' | 'app') => {
    setLocalSettings(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        [channel]: !prev[notificationId]?.[channel]
      }
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: '設定を保存しました',
      });
    } catch (error) {
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
  const notificationsByCategory = NOTIFICATION_TYPES.reduce((acc, notif) => {
    if (!acc[notif.category]) {
      acc[notif.category] = [];
    }
    acc[notif.category].push(notif);
    return acc;
  }, {} as Record<string, typeof NOTIFICATION_TYPES>);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知設定
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
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
                        <p className="text-sm text-gray-500">
                          {notification.description}
                        </p>
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
```

### 5. NotificationCenterコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/notifications/NotificationCenter.tsx
'use client';

import React, { useState } from 'react';
import { Bell, X, Check, AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/_hooks/notifications/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'usage': return <TrendingUp className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">通知</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              すべて既読
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              新しい通知はありません
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {