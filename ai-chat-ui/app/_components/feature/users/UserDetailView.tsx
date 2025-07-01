'use client';

import React from 'react';
import { User, Mail, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useUser } from '@/app/_hooks/users/useUsers';
import { UserPermissionsEditor } from './UserPermissionsEditor';

interface UserDetailViewProps {
  userId: string;
  orgId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const { user, isLoading, mutate } = useUser(userId);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">名前</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <p className="font-medium flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ロール</p>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">ステータス</p>
              <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                {user.status === 'active' ? 'アクティブ' : '無効'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">登録日</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最終ログイン</p>
              <p className="font-medium flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {user.lastLogin
                  ? formatDistanceToNow(new Date(user.lastLogin), {
                      addSuffix: true,
                      locale: ja,
                    })
                  : '未ログイン'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブ */}
      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">権限設定</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
          <TabsTrigger value="sessions">セッション</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="mt-4">
          <UserPermissionsEditor
            userId={userId}
            currentPermissions={user.permissions || []}
            onUpdate={() => mutate()}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
            </CardHeader>
            <CardContent>
              {/* アクティビティログの実装 */}
              <p className="text-gray-500">アクティビティログは今後実装予定です</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>アクティブセッション</CardTitle>
            </CardHeader>
            <CardContent>
              {/* セッション管理の実装 */}
              <p className="text-gray-500">セッション管理は今後実装予定です</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
