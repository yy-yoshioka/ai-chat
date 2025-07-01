# Section-7: Organizations & Widgets Enhancement
`<todo-key>: org-widgets`

## 🎯 目的
組織管理ページとWidgets BFFルートの欠損部分を補完

## 📋 作業内容

### 1. 組織一覧ページ
```typescript
// ai-chat-ui/app/(org)/admin/organizations/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Package, Calendar } from 'lucide-react';
import { PageHeader } from '@/_components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganizations } from '@/_hooks/org/useOrganizations';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function OrganizationsPage() {
  const router = useRouter();
  const { organizations, isLoading } = useOrganizations();
  
  if (isLoading) {
    return <div>読み込み中...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="組織管理"
        description="所属する組織の一覧と管理"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/admin/${org.id}/dashboard`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {org.name}
                </div>
                <Badge variant={org.plan === 'enterprise' ? 'default' : 'secondary'}>
                  {org.plan}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    ユーザー
                  </div>
                  <span className="font-medium">{org.userCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package className="h-4 w-4" />
                    ウィジェット
                  </div>
                  <span className="font-medium">{org.widgetCount}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  作成: {formatDistanceToNow(new Date(org.createdAt), {
                    addSuffix: true,
                    locale: ja
                  })}
                </div>
              </div>
              
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/${org.id}/settings`);
                }}
              >
                設定
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">所属する組織がありません</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Organizations BFFルート補完
```typescript
// ai-chat-ui/app/api/bff/organizations/[id]/route.ts
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
    const response = await fetch(`${API_BASE_URL}/organizations/${params.id}`, {
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
      { error: 'Failed to fetch organization' },
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
    
    const response = await fetch(`${API_BASE_URL}/organizations/${params.id}`, {
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
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
```

### 3. Widgets BFFルート補完
```typescript
// ai-chat-ui/app/api/bff/widgets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${API_BASE_URL}/widgets?${queryString}`, {
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
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/widgets`, {
      method: 'POST',
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
      { error: 'Failed to create widget' },
      { status: 500 }
    );
  }
}
```

### 4. Widget個別操作BFFルート
```typescript
// ai-chat-ui/app/api/bff/widgets/[id]/route.ts
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
    const response = await fetch(`${API_BASE_URL}/widgets/${params.id}`, {
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
      { error: 'Failed to fetch widget' },
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
    
    const response = await fetch(`${API_BASE_URL}/widgets/${params.id}`, {
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
      { error: 'Failed to update widget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/widgets/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}
```

### 5. 組織切り替えコンポーネント更新
```typescript
// ai-chat-ui/app/_components/ui/nav/OrgSwitcher.tsx の拡張
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOrganizations } from '@/_hooks/org/useOrganizations';
import { useCurrentOrg } from '@/_hooks/auth/useCurrentOrg';
import { cn } from '@/lib/utils';

export function OrgSwitcher() {
  const router = useRouter();
  const { organizations } = useOrganizations();
  const { currentOrg, setCurrentOrg } = useCurrentOrg();
  const [open, setOpen] = React.useState(false);
  
  const handleSelect = (orgId: string) => {
    setCurrentOrg(orgId);
    setOpen(false);
    router.push(`/admin/${orgId}/dashboard`);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <Building2 className="mr-2 h-4 w-4" />
          {currentOrg
            ? organizations.find((org) => org.id === currentOrg)?.name
            : "組織を選択"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="組織を検索..." />
          <CommandList>
            <CommandEmpty>組織が見つかりません</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => handleSelect(org.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentOrg === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => router.push('/admin/organizations')}
              >
                <Plus className="mr-2 h-4 w-4" />
                組織を管理
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## ✅ 完了条件
- [ ] 組織一覧ページが表示される
- [ ] 組織の切り替えが動作する
- [ ] Widgets BFFルートがすべて動作する
- [ ] 組織詳細の取得・更新が可能

## 🚨 注意事項
- 組織間のデータ分離を確認
- 権限チェックの実装
- 現在の組織コンテキストの管理