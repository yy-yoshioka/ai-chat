# Section-4: User Management Enhancement
`<todo-key>: user-management`

## 🎯 目的
ユーザー詳細表示、招待機能、権限管理UIを実装

## 📋 作業内容

### 1. ユーザー詳細ページ
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/users/[userId]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/_components/common/PageHeader';
import { UserDetailView } from '@/_components/feature/users/UserDetailView';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const userId = params.userId as string;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        
        <PageHeader
          title="ユーザー詳細"
          description="ユーザー情報と権限の管理"
        />
      </div>
      
      <UserDetailView userId={userId} orgId={orgId} />
    </div>
  );
}
```

### 2. UserDetailViewコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/users/UserDetailView.tsx
'use client';

import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useUser } from '@/_hooks/users/useUsers';
import { UserPermissionsEditor } from './UserPermissionsEditor';

interface UserDetailViewProps {
  userId: string;
  orgId: string;
}

export function UserDetailView({ userId, orgId }: UserDetailViewProps) {
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
              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                {user.role}
              </Badge>
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
                  locale: ja
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最終ログイン</p>
              <p className="font-medium flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {user.lastLogin ? 
                  formatDistanceToNow(new Date(user.lastLogin), {
                    addSuffix: true,
                    locale: ja
                  }) : '未ログイン'
                }
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
```

### 3. UserPermissionsEditorコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/users/UserPermissionsEditor.tsx
'use client';

import React, { useState } from 'react';
import { Shield, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchPut } from '@/_utils/fetcher';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'widgets.create',
    name: 'ウィジェット作成',
    description: '新しいウィジェットを作成できます',
    category: 'ウィジェット'
  },
  {
    id: 'widgets.edit',
    name: 'ウィジェット編集',
    description: '既存のウィジェットを編集できます',
    category: 'ウィジェット'
  },
  {
    id: 'widgets.delete',
    name: 'ウィジェット削除',
    description: 'ウィジェットを削除できます',
    category: 'ウィジェット'
  },
  {
    id: 'users.manage',
    name: 'ユーザー管理',
    description: 'ユーザーの追加・編集・削除ができます',
    category: 'ユーザー'
  },
  {
    id: 'billing.manage',
    name: '請求管理',
    description: '請求情報の確認・変更ができます',
    category: '請求'
  },
  {
    id: 'analytics.view',
    name: '分析閲覧',
    description: '詳細な分析データを閲覧できます',
    category: '分析'
  }
];

interface UserPermissionsEditorProps {
  userId: string;
  currentPermissions: string[];
  onUpdate: () => void;
}

export function UserPermissionsEditor({
  userId,
  currentPermissions,
  onUpdate
}: UserPermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Set<string>>(
    new Set(currentPermissions)
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const togglePermission = (permissionId: string) => {
    const newPermissions = new Set(permissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setPermissions(newPermissions);
  };
  
  const savePermissions = async () => {
    setIsSaving(true);
    
    try {
      await fetchPut(`/api/bff/users/${userId}`, {
        permissions: Array.from(permissions)
      });
      
      toast({
        title: '権限を更新しました',
        description: '変更が正常に保存されました',
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'エラー',
        description: '権限の更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // カテゴリ別にグループ化
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限設定
          </div>
          <Button
            size="sm"
            onClick={savePermissions}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <div key={category}>
              <h3 className="font-medium text-sm text-gray-700 mb-3">
                {category}
              </h3>
              <div className="space-y-3">
                {perms.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start space-x-3"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={permissions.has(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </label>
                      <p className="text-sm text-gray-500">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. 招待ページ
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/users/invite/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { InviteUserModal } from '@/_components/feature/users/InviteUserModal';

export default function InviteUserPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="ユーザー招待"
        description="新しいユーザーを組織に招待します"
      />
      
      <div className="max-w-2xl mx-auto mt-8">
        <InviteUserModal
          orgId={orgId}
          onSuccess={() => router.push(`/admin/${orgId}/users`)}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
```

### 5. InviteUserModalコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/users/InviteUserModal.tsx
'use client';

import React, { useState } from 'react';
import { Mail, UserPlus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchPost } from '@/_utils/fetcher';

interface InviteUserModalProps {
  orgId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InviteUserModal({
  orgId,
  onSuccess,
  onCancel
}: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      toast({
        title: 'エラー',
        description: 'メールアドレスとロールは必須です',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await fetchPost('/api/bff/users/invite', {
        email,
        role,
        organizationId: orgId,
        message,
        sendEmail: true
      });
      
      toast({
        title: '招待を送信しました',
        description: `${email} に招待メールを送信しました`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'エラー',
        description: '招待の送信に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          ユーザーを招待
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              ロール
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">ユーザー</SelectItem>
                <SelectItem value="admin">管理者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              メッセージ（任意）
            </label>
            <Textarea
              placeholder="招待メッセージを入力..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              招待を送信
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 6. BFFルート補完
```typescript
// ai-chat-ui/app/api/bff/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
```

## ✅ 完了条件
- [ ] ユーザー詳細ページが表示される
- [ ] 権限の編集・保存が動作する
- [ ] 招待メール送信が動作する
- [ ] BFFルートが正しく動作する

## 🚨 注意事項
- 権限変更時の影響範囲
- 招待メールのセキュリティ
- 自分自身の権限変更防止